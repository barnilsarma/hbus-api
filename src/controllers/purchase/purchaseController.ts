import express from 'express';
import { Purchase, type IPurchase } from '../../models/Purchase';

const syncPurchaseStatus = (purchase: IPurchase) => {
  if (purchase.status === 'COMPLETE') {
    return;
  }

  const purchaseDate = purchase.date ? new Date(purchase.date) : new Date();
  const diffInDays = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays >= 15) {
    purchase.status = 'DELAYED';
  } else if (!purchase.status) {
    purchase.status = 'INCOMPLETE';
  }
};

export const getPurchases = async (_req: express.Request, res: express.Response) => {
  try {
    const purchases = await Purchase.find().populate('location').populate('items');

    // Update status directly without causing population save conflicts
    for (const purchase of purchases) {
      if (purchase.status !== 'COMPLETE') {
        const purchaseDate = purchase.date ? new Date(purchase.date) : new Date();
        const diffInDays = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
        const newStatus = diffInDays >= 15 ? 'DELAYED' : purchase.status || 'INCOMPLETE';

        if (newStatus !== purchase.status) {
          purchase.status = newStatus;
          await Purchase.updateOne({ _id: purchase._id }, { status: newStatus });
        }
      }
    }

    res.json(purchases);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPurchaseById = async (req: express.Request, res: express.Response) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate('location').populate('items');

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (purchase.status !== 'COMPLETE') {
      const purchaseDate = purchase.date ? new Date(purchase.date) : new Date();
      const diffInDays = Math.floor((Date.now() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24));
      const newStatus = diffInDays >= 15 ? 'DELAYED' : purchase.status || 'INCOMPLETE';

      if (newStatus !== purchase.status) {
        purchase.status = newStatus;
        await Purchase.updateOne({ _id: purchase._id }, { status: newStatus });
      }
    }

    res.json(purchase);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
      items,
      date,
      status,
      invoicenumber,
      invoicedate,
      receiptdate,
      receivedqty,
    } = req.body;

    if (!PONumber) {
      return res.status(400).json({ message: 'PONumber is required' });
    }

    if (!locationId) {
      return res.status(400).json({ message: 'locationId is required' });
    }

    const newPurchase = new Purchase({
      PONumber,
      supplier,
      supplierAddress,
      supplierState,
      supplierStateCode,
      gstn,
      items: items || [],
      location: locationId,
      date,
      status: status ?? 'INCOMPLETE',
      invoicenumber,
      invoicedate,
      receiptdate,
      receivedqty,
    });

    await newPurchase.save();

    // Populate location and items details before returning response
    const populatedPurchase = await newPurchase.populate(['location', 'items']);
    res.status(201).json(populatedPurchase);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
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
      date,
      status,
      invoicenumber,
      invoicedate,
      receiptdate,
      receivedqty,
    } = req.body;

    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({ message: 'Purchase not found' });
    }

    if (PONumber !== undefined) purchase.PONumber = PONumber;
    if (supplier !== undefined) purchase.supplier = supplier;
    if (supplierAddress !== undefined) purchase.supplierAddress = supplierAddress;
    if (supplierState !== undefined) purchase.supplierState = supplierState;
    if (supplierStateCode !== undefined) purchase.supplierStateCode = supplierStateCode;  
    if (gstn !== undefined) purchase.gstn = gstn;
    if (items !== undefined) purchase.items = items;
    if (locationId !== undefined) purchase.location = locationId;
    if (date !== undefined) purchase.date = date;
    if (status !== undefined) purchase.status = status;
    if (invoicenumber !== undefined) purchase.invoicenumber = invoicenumber;
    if (invoicedate !== undefined) purchase.invoicedate = invoicedate;
    if (receiptdate !== undefined) purchase.receiptdate = receiptdate;
    if (receivedqty !== undefined) purchase.receivedqty = receivedqty;

    syncPurchaseStatus(purchase);
    await purchase.save();

    const populatedPurchase = await purchase.populate(['location', 'items']);
    res.json(populatedPurchase);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};