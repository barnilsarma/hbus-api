import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Dispatch, IDispatch, IDispatchAccessory } from '../../models/Dispatch';
import { Item, IItem } from '../../models/Item';

class DispatchError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = 'DispatchError';
  }
}

type StockMovement = {
  itemId: string;
  quantityChange: number;
  dispatchedChange: number;
};

const normalizeInvoiceNo = (invoiceNo: unknown): string | undefined => {
  if (invoiceNo === undefined || invoiceNo === null) {
    return undefined;
  }

  if (typeof invoiceNo !== 'string') {
    throw new DispatchError('invoiceNo must be a string', 400);
  }

  return invoiceNo.trim() || undefined;
};

const readQuantity = (value: unknown, fieldName: string, allowZero = false): number => {
  const quantity = typeof value === 'number' || (typeof value === 'string' && value.trim() !== '')
    ? Number(value)
    : Number.NaN;

  if (!Number.isFinite(quantity) || quantity < 0 || (!allowZero && quantity === 0)) {
    throw new DispatchError(
      `${fieldName} must be a number ${allowZero ? 'greater than or equal to zero' : 'greater than zero'}`,
      400
    );
  }

  return quantity;
};

const itemIdFrom = (reference: unknown): string | undefined => {
  if (typeof reference === 'string' || reference instanceof Types.ObjectId) {
    return Types.ObjectId.isValid(reference) ? reference.toString() : undefined;
  }

  if (reference && typeof reference === 'object' && '_id' in reference) {
    const id = (reference as { _id: unknown })._id;
    if (typeof id === 'string' || id instanceof Types.ObjectId) {
      return Types.ObjectId.isValid(id) ? id.toString() : undefined;
    }
  }

  return undefined;
};

const resolveItem = async (reference: unknown): Promise<IItem> => {
  if (typeof reference !== 'string' && !(reference instanceof Types.ObjectId)) {
    if (reference && typeof reference === 'object' && '_id' in reference) {
      return resolveItem((reference as { _id: unknown })._id);
    }
    throw new DispatchError('Each dispatched item must be identified by item ID or mcode', 400);
  }

  const value = reference.toString().trim();
  if (!value) {
    throw new DispatchError('Item ID or mcode cannot be empty', 400);
  }

  const item = Types.ObjectId.isValid(value)
    ? await Item.findById(value)
    : await Item.findOne({ mcode: value });

  if (!item) {
    throw new DispatchError(`Item '${value}' not found`, 404);
  }

  return item;
};

const resolveAccessories = async (value: unknown): Promise<IDispatchAccessory[]> => {
  if (!Array.isArray(value)) {
    throw new DispatchError('accessories must be an array of { item, quantity } entries', 400);
  }

  return Promise.all(value.map(async (accessory, index) => {
    if (!accessory || typeof accessory !== 'object') {
      throw new DispatchError(`accessories[${index}] must include an item and quantity`, 400);
    }

    const entry = accessory as Record<string, unknown>;
    const reference = entry.item ?? entry.itemId ?? entry.mcode;
    const item = await resolveItem(reference);

    return {
      item: item._id,
      quantity: readQuantity(entry.quantity, `accessories[${index}].quantity`, true),
    };
  }));
};

const inventoryFor = (
  item: unknown,
  quantity: unknown,
  accessories: unknown
): Map<string, number> => {
  const inventory = new Map<string, number>();
  const itemId = itemIdFrom(item);

  if (itemId && typeof quantity === 'number' && quantity > 0) {
    inventory.set(itemId, quantity);
  }

  if (Array.isArray(accessories)) {
    for (const accessory of accessories) {
      if (!accessory || typeof accessory !== 'object') continue;
      const entry = accessory as { item?: unknown; quantity?: unknown };
      const accessoryId = itemIdFrom(entry.item);
      if (!accessoryId || typeof entry.quantity !== 'number' || entry.quantity <= 0) continue;
      inventory.set(accessoryId, (inventory.get(accessoryId) ?? 0) + entry.quantity);
    }
  }

  return inventory;
};

const stockDeltas = (before: Map<string, number>, after: Map<string, number>): Map<string, number> => {
  const deltas = new Map<string, number>();
  for (const itemId of new Set([...before.keys(), ...after.keys()])) {
    const delta = (after.get(itemId) ?? 0) - (before.get(itemId) ?? 0);
    if (delta !== 0) deltas.set(itemId, delta);
  }
  return deltas;
};

const rollbackMovements = async (movements: StockMovement[]): Promise<void> => {
  const failures: string[] = [];

  for (const movement of movements.reverse()) {
    try {
      const result = await Item.updateOne(
        { _id: movement.itemId },
        {
          $inc: {
            qty: -movement.quantityChange,
            dispatched: -movement.dispatchedChange,
          },
        }
      );
      if (result.matchedCount !== 1) {
        failures.push(`Item ${movement.itemId} no longer exists`);
      }
    } catch (error: unknown) {
      failures.push(error instanceof Error ? error.message : `Failed to restore item ${movement.itemId}`);
    }
  }

  if (failures.length > 0) {
    throw new DispatchError(`Stock rollback failed: ${failures.join('; ')}`, 500);
  }
};

const applyStockDeltas = async (deltas: Map<string, number>): Promise<() => Promise<void>> => {
  const applied: StockMovement[] = [];

  try {
    for (const [itemId, delta] of deltas) {
      const quantityChange = -delta;
      const dispatchedChange = delta;
      const filter = delta > 0
        ? { _id: itemId, qty: { $gte: delta } }
        : { _id: itemId, dispatched: { $gte: -delta } };
      const result = await Item.updateOne(
        filter,
        { $inc: { qty: quantityChange, dispatched: dispatchedChange } }
      );

      if (result.matchedCount !== 1) {
        const itemExists = await Item.exists({ _id: itemId });
        if (!itemExists) {
          throw new DispatchError(`Item '${itemId}' not found`, 404);
        }
        throw new DispatchError(
          delta > 0
            ? `Insufficient stock for item '${itemId}'`
            : `Cannot restore dispatch quantity for item '${itemId}' because its dispatched quantity is too low`,
          409
        );
      }

      applied.push({ itemId, quantityChange, dispatchedChange });
    }
  } catch (error: unknown) {
    try {
      await rollbackMovements(applied);
    } catch (rollbackError: unknown) {
      throw rollbackError;
    }
    throw error;
  }

  let rolledBack = false;
  return async () => {
    if (rolledBack) return;
    await rollbackMovements(applied);
    rolledBack = true;
  };
};

const errorResponse = (res: Response, error: unknown, fallback: string, defaultStatus: number) => {
  const status = error instanceof DispatchError ? error.status : defaultStatus;
  const message = error instanceof Error ? error.message : fallback;
  return res.status(status).json({ message });
};

const populateDispatch = (dispatch: IDispatch) =>
  dispatch.populate(['location', 'item', 'accessories.item']);

export const getDispatches = async (_req: Request, res: Response) => {
  try {
    const dispatches = await Dispatch.find()
      .populate('location')
      .populate('item')
      .populate('accessories.item');
    res.json(dispatches);
  } catch (error: unknown) {
    errorResponse(res, error, 'Failed to fetch dispatches', 500);
  }
};

export const getDispatchById = async (req: Request, res: Response) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id)
      .populate('location')
      .populate('item')
      .populate('accessories.item');

    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }

    res.json(dispatch);
  } catch (error: unknown) {
    errorResponse(res, error, 'Failed to fetch dispatch', 500);
  }
};

export const getDispatchesByLocation = async (req: Request, res: Response) => {
  try {
    const dispatches = await Dispatch.find({ location: req.params.locationId })
      .populate('location')
      .populate('item')
      .populate('accessories.item');
    res.json(dispatches);
  } catch (error: unknown) {
    errorResponse(res, error, 'Failed to fetch dispatches', 500);
  }
};

export const createDispatch = async (req: Request, res: Response) => {
  let rollbackStock: (() => Promise<void>) | undefined;
  try {
    const {
      challanNo,
      invoiceNo,
      dateOfDelivery,
      type,
      description,
      item,
      itemId,
      mcode,
      quantity,
      accessories = [],
      HSNCode,
      new: newValue,
      REP,
      DTRSerialNo,
      rate,
      gstno,
      vehicleDetails,
      partyName,
      destination,
      location,
      locationId,
    } = req.body;
    const targetLocation = locationId ?? location;
    const itemReference = item ?? itemId ?? mcode;

    if (!challanNo || !dateOfDelivery || !type || !description || !targetLocation) {
      return res.status(400).json({
        message: 'challanNo, dateOfDelivery, type, description, and location are required',
      });
    }

    const hasMainItem = itemReference !== undefined;
    if (hasMainItem && quantity === undefined) {
      return res.status(400).json({ message: 'quantity is required when item is provided' });
    }
    if (!hasMainItem && (!Array.isArray(accessories) || accessories.length === 0)) {
      return res.status(400).json({ message: 'Provide a main item or at least one accessory' });
    }

    const optionalInvoiceNo = normalizeInvoiceNo(invoiceNo);
    const dispatchQuantity = quantity === undefined ? undefined : readQuantity(quantity, 'quantity');
    const dispatchedItem = hasMainItem ? await resolveItem(itemReference) : undefined;
    const dispatchAccessories = await resolveAccessories(accessories);
    const dispatch = new Dispatch({
      challanNo,
      ...(optionalInvoiceNo !== undefined ? { invoiceNo: optionalInvoiceNo } : {}),
      dateOfDelivery,
      type,
      description,
      item: dispatchedItem?._id,
      quantity: dispatchQuantity,
      accessories: dispatchAccessories,
      HSNCode,
      new: newValue,
      REP,
      DTRSerialNo,
      rate,
      gstno,
      vehicleDetails,
      partyName,
      destination,
      location: targetLocation,
    });

    rollbackStock = await applyStockDeltas(
      stockDeltas(new Map(), inventoryFor(dispatch.item, dispatch.quantity, dispatch.accessories))
    );
    await dispatch.save();
    rollbackStock = undefined;
    await populateDispatch(dispatch);
    res.status(201).json(dispatch);
  } catch (error: unknown) {
    if (rollbackStock) {
      try {
        await rollbackStock();
      } catch (rollbackError: unknown) {
        return errorResponse(res, rollbackError, 'Failed to restore stock after dispatch error', 500);
      }
    }
    errorResponse(res, error, 'Failed to create dispatch', 400);
  }
};

export const updateDispatch = async (req: Request, res: Response) => {
  let rollbackStock: (() => Promise<void>) | undefined;
  try {
    const dispatch = await Dispatch.findById(req.params.id);
    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }

    const body = req.body as Record<string, unknown>;
    const {
      challanNo,
      invoiceNo,
      dateOfDelivery,
      type,
      description,
      HSNCode,
      new: newValue,
      REP,
      DTRSerialNo,
      rate,
      gstno,
      vehicleDetails,
      partyName,
      destination,
      location,
      locationId,
    } = body;

    const itemReference = body.item ?? body.itemId ?? body.mcode;
    const hasItemReference = body.item !== undefined || body.itemId !== undefined || body.mcode !== undefined;
    const nextItem = hasItemReference
      ? await resolveItem(itemReference)
      : dispatch.item
        ? await resolveItem(itemIdFrom(dispatch.item))
        : undefined;
    const nextQuantity = body.quantity === undefined
      ? dispatch.quantity
      : readQuantity(body.quantity, 'quantity');

    if ((hasItemReference || nextItem) && nextQuantity === undefined) {
      throw new DispatchError('quantity is required when item is provided', 400);
    }
    if (body.quantity !== undefined) {
      readQuantity(body.quantity, 'quantity');
    }

    const nextAccessories = body.accessories === undefined
      ? dispatch.accessories ?? []
      : await resolveAccessories(body.accessories);
    const before = inventoryFor(dispatch.item, dispatch.quantity, dispatch.accessories);
    const after = inventoryFor(nextItem?._id, nextQuantity, nextAccessories);

    if (challanNo !== undefined) dispatch.challanNo = challanNo as string;
    if (invoiceNo !== undefined) dispatch.invoiceNo = normalizeInvoiceNo(invoiceNo);
    if (dateOfDelivery !== undefined) dispatch.dateOfDelivery = dateOfDelivery as Date;
    if (type !== undefined) dispatch.type = type as string;
    if (description !== undefined) dispatch.description = description as string;
    if (hasItemReference && nextItem) dispatch.item = nextItem._id;
    if (body.quantity !== undefined) dispatch.quantity = nextQuantity;
    if (body.accessories !== undefined) dispatch.accessories = nextAccessories;
    if (HSNCode !== undefined) dispatch.HSNCode = HSNCode as string;
    if (newValue !== undefined) dispatch.new = newValue as string;
    if (REP !== undefined) dispatch.REP = REP as string;
    if (DTRSerialNo !== undefined) dispatch.DTRSerialNo = DTRSerialNo as string;
    if (rate !== undefined) dispatch.rate = Number(rate);
    if (gstno !== undefined) dispatch.gstno = gstno as string;
    if (vehicleDetails !== undefined) dispatch.vehicleDetails = vehicleDetails as string;
    if (partyName !== undefined) dispatch.partyName = partyName as string;
    if (destination !== undefined) dispatch.destination = destination as string;
    if (location !== undefined || locationId !== undefined) {
      dispatch.location = (locationId ?? location) as IDispatch['location'];
    }

    rollbackStock = await applyStockDeltas(stockDeltas(before, after));
    await dispatch.save();
    rollbackStock = undefined;
    await populateDispatch(dispatch);
    res.json(dispatch);
  } catch (error: unknown) {
    if (rollbackStock) {
      try {
        await rollbackStock();
      } catch (rollbackError: unknown) {
        return errorResponse(res, rollbackError, 'Failed to restore stock after dispatch error', 500);
      }
    }
    errorResponse(res, error, 'Failed to update dispatch', 400);
  }
};

export const deleteDispatch = async (req: Request, res: Response) => {
  let rollbackStock: (() => Promise<void>) | undefined;
  try {
    const dispatch = await Dispatch.findById(req.params.id);
    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }

    const inventory = inventoryFor(dispatch.item, dispatch.quantity, dispatch.accessories);
    const restoreDeltas = new Map<string, number>();
    for (const [itemId, quantity] of inventory) {
      restoreDeltas.set(itemId, -quantity);
    }
    rollbackStock = await applyStockDeltas(restoreDeltas);

    const result = await Dispatch.deleteOne({ _id: dispatch._id, __v: dispatch.__v });
    if (result.deletedCount !== 1) {
      throw new DispatchError('Dispatch was modified by another request; reload and try again', 409);
    }

    rollbackStock = undefined;
    res.status(204).send();
  } catch (error: unknown) {
    if (rollbackStock) {
      try {
        await rollbackStock();
      } catch (rollbackError: unknown) {
        return errorResponse(res, rollbackError, 'Failed to restore stock after dispatch error', 500);
      }
    }
    errorResponse(res, error, 'Failed to delete dispatch', 500);
  }
};
