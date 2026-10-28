import express from 'express';
import { Types } from 'mongoose';
import { Purchase, type IPurchase } from '../../models/Purchase';

// Helper to compute status safely without crashing on invalid dates
const calculateStatus = (purchaseDateRaw: any, currentStatus: string): string => {
  if (currentStatus === 'COMPLETE') return 'COMPLETE';

  const purchaseDate = purchaseDateRaw ? new Date(purchaseDateRaw) : new Date();
  const time = purchaseDate.getTime();

  if (Number.isNaN(time)) {
    return currentStatus || 'INCOMPLETE';
  }

  const diffInDays = Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));
  return diffInDays >= 15 ? 'DELAYED' : currentStatus || 'INCOMPLETE';
};

export const getPurchases = async (_req: express.Request, res: express.Response) => {
  try {
    const purchases = await Purchase.find().populate('location').populate('items');

    // Update out-of-sync statuses safely
    const updates = purchases.map(async (purchase) => {
      const updatedStatus = calculateStatus(purchase.date, purchase.status);
      if (updatedStatus !== purchase.status) {
        purchase.status = updatedStatus as any;
        await Purchase.updateOne({ _id: purchase._id }, { status: updatedStatus });
      }
    });

    await Promise.allSettled(updates);

    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching purchases' });
  }
};

export const getPurchaseById = async (req: express.Request, res: express.Response) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('location').populate('items');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    const updatedStatus = calculateStatus(purchase.date, purchase.status);
    if (updatedStatus !== purchase.status) {
      purchase.status = updatedStatus as any;
      await Purchase.updateOne({ _id: purchase._id }, { status: updatedStatus });
    }

    res.json(purchase);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Error fetching purchase' });
  }
};

export const createPurchase = async (req: express.Request, res: express.Response) => {
  try {
    const {
      PONumber,
      supplier,
      supplierAddress,
      supplierState,
      supplierStateCode,
      gstn,
      locationId,
      location, // Accept both location and locationId from req.body
      items,
      date,
      status,
      invoicenumber,
      invoicedate,
      receiptdate
    } = req.body;

    const targetLocation = locationId || location;

    if (!PONumber) {
      return res.status(400).json({ message: 'PONumber is required' });
    }

    if (!targetLocation) {
      return res.status(400).json({ message: 'location or locationId is required' });
    }

    const newPurchase = new Purchase({
      PONumber,
      supplier,
      supplierAddress,
      supplierState,
      supplierStateCode,
      gstn,
      items: items || [],
      location: targetLocation,
      date: date || new Date(),
      status: status ?? 'INCOMPLETE',
      invoicenumber,
      invoicedate,
      receiptdate
    });

    await newPurchase.save();

    const populatedPurchase = await newPurchase.populate(['location', 'items']);
    res.status(201).json(populatedPurchase);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to create purchase' });
  }
};

export const updatePurchase = async (req: express.Request, res: express.Response) => {
  try {
    const {
      PONumber,
      supplier,
      supplierAddress,
      supplierState,
      supplierStateCode,
      gstn,
      items,
      locationId,
      location,
      date,
      status,
      invoicenumber,
      invoicedate,
      receiptdate
    } = req.body;

    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    const targetLocation = locationId || location;

    if (PONumber !== undefined) purchase.PONumber = PONumber;
    if (supplier !== undefined) purchase.supplier = supplier;
    if (supplierAddress !== undefined) purchase.supplierAddress = supplierAddress;
    if (supplierState !== undefined) purchase.supplierState = supplierState;
    if (supplierStateCode !== undefined) purchase.supplierStateCode = supplierStateCode;  
    if (gstn !== undefined) purchase.gstn = gstn;
    if (items !== undefined) purchase.items = items;
    if (targetLocation !== undefined) purchase.location = targetLocation;
    if (date !== undefined) purchase.date = date;
    if (status !== undefined) purchase.status = status;
    if (invoicenumber !== undefined) purchase.invoicenumber = invoicenumber;
    if (invoicedate !== undefined) purchase.invoicedate = invoicedate;
    if (receiptdate !== undefined) purchase.receiptdate = receiptdate;

    purchase.status = calculateStatus(purchase.date, purchase.status) as any;
    await purchase.save();

    const populatedPurchase = await purchase.populate(['location', 'items']);
    res.json(populatedPurchase);
  } catch (error: any) {
    res.status(400).json({ message: error.message || 'Failed to update purchase' });
  }
};


// controllers/purchaseController.ts

export const removeItemFromPurchase = async (req: express.Request, res: express.Response) => {
  try {
    const { id, itemId } = req.params;
    const purchaseId = typeof id === 'string' ? id : undefined;
    const purchaseItemId = typeof itemId === 'string' ? itemId : undefined;

    if (
      !purchaseId ||
      !purchaseItemId ||
      !Types.ObjectId.isValid(purchaseId) ||
      !Types.ObjectId.isValid(purchaseItemId)
    ) {
      return res.status(400).json({ message: 'Invalid purchase or item ID' });
    }

    const updatedPurchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { $pull: { items: purchaseItemId } },
      { new: true }
    ).populate(['location']);

    if (!updatedPurchase) {
      return res.status(404).json({ message: 'Purchase Order not found' });
    }

    res.json(updatedPurchase);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to remove item from purchase' });
  }
};
export const deletePurchase = async (req: express.Request, res: express.Response) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete purchase' });
  }
};