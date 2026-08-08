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
  const purchases = await Purchase.find();

  for (const purchase of purchases) {
    syncPurchaseStatus(purchase);
    await purchase.save();
  }

  res.json(purchases);
};

export const getPurchaseById = async (req: express.Request, res: express.Response) => {
  const purchase = await Purchase.findById(req.params.id);

  if (!purchase) {
    return res.status(404).json({ message: 'Purchase not found' });
  }

  syncPurchaseStatus(purchase);
  await purchase.save();

  res.json(purchase);
};

export const createPurchase = async (req: express.Request, res: express.Response) => {
  const {
    PONumber,
    supplier,
    item,
    gst,
    unit,
    rate,
    qty,
    date,
    status,
    amount,
    invoicenumber,
    invoicedate,
    receiptdate,
    receivedqty,
  } = req.body;

  if (!PONumber) {
    return res.status(400).json({ message: 'PONumber is required' });
  }

  const newPurchase = new Purchase({
    PONumber,
    supplier,
    item,
    gst,
    unit,
    rate,
    qty,
    date,
    status: status ?? 'INCOMPLETE',
    amount,
    invoicenumber,
    invoicedate,
    receiptdate,
    receivedqty,
  });

  await newPurchase.save();
  res.status(201).json(newPurchase);
};

export const updatePurchase = async (req: express.Request, res: express.Response) => {
  const {
    PONumber,
    supplier,
    item,
    gst,
    unit,
    rate,
    qty,
    date,
    status,
    amount,
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
  if (item !== undefined) purchase.item = item;
  if (gst !== undefined) purchase.gst = gst;
  if (unit !== undefined) purchase.unit = unit;
  if (rate !== undefined) purchase.rate = rate;
  if (qty !== undefined) purchase.qty = qty;
  if (date !== undefined) purchase.date = date;
  if (status !== undefined) purchase.status = status;
  if (amount !== undefined) purchase.amount = amount;
  if (invoicenumber !== undefined) purchase.invoicenumber = invoicenumber;
  if (invoicedate !== undefined) purchase.invoicedate = invoicedate;
  if (receiptdate !== undefined) purchase.receiptdate = receiptdate;
  if (receivedqty !== undefined) purchase.receivedqty = receivedqty;

  syncPurchaseStatus(purchase);
  await purchase.save();
  res.json(purchase);
};

export const deletePurchase = async (req: express.Request, res: express.Response) => {
  const purchase = await Purchase.findByIdAndDelete(req.params.id);

  if (!purchase) {
    return res.status(404).json({ message: 'Purchase not found' });
  }

  res.status(204).send();
};
