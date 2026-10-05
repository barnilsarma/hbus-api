import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { RawMaterialPO, type RawMaterialPOStatus } from '../../models/RawMaterialPO';

const calculateStatus = (date: Date, currentStatus: RawMaterialPOStatus): RawMaterialPOStatus => {
  if (currentStatus === 'COMPLETE') return 'COMPLETE';

  const time = date.getTime();
  if (Number.isNaN(time)) return currentStatus || 'INCOMPLETE';

  const diffInDays = Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));
  return diffInDays >= 15 ? 'DELAYED' : currentStatus || 'INCOMPLETE';
};

export const getRawMaterialPOs = async (_req: Request, res: Response) => {
  try {
    const purchaseOrders = await RawMaterialPO.find()
      .populate('location')
      .populate('rawMaterials');

    const updates = purchaseOrders.map(async (purchaseOrder) => {
      const updatedStatus = calculateStatus(purchaseOrder.date, purchaseOrder.status);
      if (updatedStatus !== purchaseOrder.status) {
        purchaseOrder.status = updatedStatus;
        await RawMaterialPO.updateOne({ _id: purchaseOrder._id }, { status: updatedStatus });
      }
    });
    await Promise.allSettled(updates);

    res.json(purchaseOrders);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching raw material purchase orders' });
  }
};

export const getRawMaterialPOById = async (req: Request, res: Response) => {
  try {
    const purchaseOrder = await RawMaterialPO.findById(req.params.id)
      .populate('location')
      .populate('rawMaterials');

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Raw material purchase order not found' });
    }

    const updatedStatus = calculateStatus(purchaseOrder.date, purchaseOrder.status);
    if (updatedStatus !== purchaseOrder.status) {
      purchaseOrder.status = updatedStatus;
      await RawMaterialPO.updateOne({ _id: purchaseOrder._id }, { status: updatedStatus });
    }

    res.json(purchaseOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching raw material purchase order' });
  }
};

export const createRawMaterialPO = async (req: Request, res: Response) => {
  try {
    const {
      PONumber,
      supplier,
      supplierAddress,
      supplierState,
      supplierStateCode,
      gstn,
      locationId,
      location,
      rawMaterials,
      date,
      status,
      invoicenumber,
      invoicedate,
      receiptdate,
    } = req.body;
    const targetLocation = locationId || location;

    if (!PONumber) {
      return res.status(400).json({ message: 'PONumber is required' });
    }
    if (!targetLocation) {
      return res.status(400).json({ message: 'location or locationId is required' });
    }

    const purchaseOrder = new RawMaterialPO({
      PONumber,
      supplier,
      supplierAddress,
      supplierState,
      supplierStateCode,
      gstn,
      rawMaterials: rawMaterials || [],
      location: targetLocation,
      date: date || new Date(),
      status: status ?? 'INCOMPLETE',
      invoicenumber,
      invoicedate,
      receiptdate,
    });

    await purchaseOrder.save();
    await purchaseOrder.populate(['location', 'rawMaterials']);
    res.status(201).json(purchaseOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create raw material purchase order' });
  }
};

export const updateRawMaterialPO = async (req: Request, res: Response) => {
  try {
    const {
      PONumber,
      supplier,
      supplierAddress,
      supplierState,
      supplierStateCode,
      gstn,
      rawMaterials,
      locationId,
      location,
      date,
      status,
      invoicenumber,
      invoicedate,
      receiptdate,
    } = req.body;
    const purchaseOrder = await RawMaterialPO.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Raw material purchase order not found' });
    }

    const targetLocation = locationId || location;
    if (PONumber !== undefined) purchaseOrder.PONumber = PONumber;
    if (supplier !== undefined) purchaseOrder.supplier = supplier;
    if (supplierAddress !== undefined) purchaseOrder.supplierAddress = supplierAddress;
    if (supplierState !== undefined) purchaseOrder.supplierState = supplierState;
    if (supplierStateCode !== undefined) purchaseOrder.supplierStateCode = supplierStateCode;
    if (gstn !== undefined) purchaseOrder.gstn = gstn;
    if (rawMaterials !== undefined) purchaseOrder.rawMaterials = rawMaterials;
    if (targetLocation !== undefined) purchaseOrder.location = targetLocation;
    if (date !== undefined) purchaseOrder.date = date;
    if (status !== undefined) purchaseOrder.status = status;
    if (invoicenumber !== undefined) purchaseOrder.invoicenumber = invoicenumber;
    if (invoicedate !== undefined) purchaseOrder.invoicedate = invoicedate;
    if (receiptdate !== undefined) purchaseOrder.receiptdate = receiptdate;

    purchaseOrder.status = calculateStatus(purchaseOrder.date, purchaseOrder.status);
    await purchaseOrder.save();
    await purchaseOrder.populate(['location', 'rawMaterials']);
    res.json(purchaseOrder);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update raw material purchase order' });
  }
};

export const removeRawMaterialFromPO = async (req: Request, res: Response) => {
  try {
    const { id, rawMaterialId } = req.params;
    if (
      typeof id !== 'string' ||
      typeof rawMaterialId !== 'string' ||
      !Types.ObjectId.isValid(id) ||
      !Types.ObjectId.isValid(rawMaterialId)
    ) {
      return res.status(400).json({ message: 'Invalid purchase order or raw material ID' });
    }

    const purchaseOrder = await RawMaterialPO.findByIdAndUpdate(
      id,
      { $pull: { rawMaterials: rawMaterialId } },
      { new: true }
    ).populate(['location', 'rawMaterials']);

    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Raw material purchase order not found' });
    }

    res.json(purchaseOrder);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to remove raw material from purchase order' });
  }
};

export const deleteRawMaterialPO = async (req: Request, res: Response) => {
  try {
    const purchaseOrder = await RawMaterialPO.findByIdAndDelete(req.params.id);
    if (!purchaseOrder) {
      return res.status(404).json({ message: 'Raw material purchase order not found' });
    }
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete raw material purchase order' });
  }
};
