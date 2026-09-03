import { Request, Response } from 'express';
import { Item } from '../../models/Item';

export const getItems = async (_req: Request, res: Response) => {
  try {
    const items = await Item.find();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getItemById = async (req: Request, res: Response) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(item);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createItem = async (req: Request, res: Response) => {
  try {
    const { description, gst, unit, rate, qty } = req.body;

    if (!description || gst === undefined || !unit || rate === undefined || qty === undefined) {
      return res.status(400).json({
        message: 'All item fields (description, gst, unit, rate, qty) are required',
      });
    }

    const newItem = new Item({
      description,
      gst: Number(gst),
      unit,
      rate: Number(rate),
      qty: Number(qty),
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateItem = async (req: Request, res: Response) => {
  try {
    const { description, gst, unit, rate, qty } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (description !== undefined) item.description = description;
    if (gst !== undefined) item.gst = Number(gst);
    if (unit !== undefined) item.unit = unit;
    if (rate !== undefined) item.rate = Number(rate);
    if (qty !== undefined) item.qty = Number(qty);

    await item.save();
    res.json(item);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteItem = async (req: Request, res: Response) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};