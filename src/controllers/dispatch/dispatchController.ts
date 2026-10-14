import { Request, Response } from 'express';
import { Dispatch } from '../../models/Dispatch';

const normalizeInvoiceNo = (invoiceNo: unknown): string | undefined => {
  if (invoiceNo === undefined || invoiceNo === null) {
    return undefined;
  }

  if (typeof invoiceNo !== 'string') {
    throw new Error('invoiceNo must be a string');
  }

  return invoiceNo.trim() || undefined;
};

export const getDispatches = async (_req: Request, res: Response) => {
  try {
    const dispatches = await Dispatch.find().populate('location');
    res.json(dispatches);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch dispatches' });
  }
};

export const getDispatchById = async (req: Request, res: Response) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id).populate('location');

    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }

    res.json(dispatch);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch dispatch' });
  }
};

export const getDispatchesByLocation = async (req: Request, res: Response) => {
  try {
    const dispatches = await Dispatch.find({ location: req.params.locationId }).populate('location');
    res.json(dispatches);
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to fetch dispatches' });
  }
};

export const createDispatch = async (req: Request, res: Response) => {
  try {
    const {
      challanNo,
      invoiceNo,
      dateOfDelivery,
      type,
      description,
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
    const optionalInvoiceNo = normalizeInvoiceNo(invoiceNo);

    if (!challanNo || !dateOfDelivery || !type || !description || !targetLocation) {
      return res.status(400).json({
        message: 'challanNo, dateOfDelivery, type, description, and location are required',
      });
    }

    const dispatch = new Dispatch({
      challanNo,
      invoiceNo: optionalInvoiceNo,
      dateOfDelivery,
      type,
      description,
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

    await dispatch.save();
    await dispatch.populate('location');
    res.status(201).json(dispatch);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create dispatch' });
  }
};

export const updateDispatch = async (req: Request, res: Response) => {
  try {
    const dispatch = await Dispatch.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }

    const {
      challanNo,
      invoiceNo,
      dateOfDelivery,
      type,
      description,
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

    if (challanNo !== undefined) dispatch.challanNo = challanNo;
    if (invoiceNo !== undefined) dispatch.invoiceNo = normalizeInvoiceNo(invoiceNo);
    if (dateOfDelivery !== undefined) dispatch.dateOfDelivery = dateOfDelivery;
    if (type !== undefined) dispatch.type = type;
    if (description !== undefined) dispatch.description = description;
    if (newValue !== undefined) dispatch.new = newValue;
    if (REP !== undefined) dispatch.REP = REP;
    if (DTRSerialNo !== undefined) dispatch.DTRSerialNo = DTRSerialNo;
    if (rate !== undefined) dispatch.rate = rate;
    if (gstno !== undefined) dispatch.gstno = gstno;
    if (vehicleDetails !== undefined) dispatch.vehicleDetails = vehicleDetails;
    if (partyName !== undefined) dispatch.partyName = partyName;
    if (destination !== undefined) dispatch.destination = destination;
    if (location !== undefined || locationId !== undefined) {
      dispatch.location = locationId ?? location;
    }

    await dispatch.save();
    await dispatch.populate('location');
    res.json(dispatch);
  } catch (error: unknown) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update dispatch' });
  }
};

export const deleteDispatch = async (req: Request, res: Response) => {
  try {
    const dispatch = await Dispatch.findByIdAndDelete(req.params.id);

    if (!dispatch) {
      return res.status(404).json({ message: 'Dispatch not found' });
    }

    res.status(204).send();
  } catch (error: unknown) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'Failed to delete dispatch' });
  }
};
