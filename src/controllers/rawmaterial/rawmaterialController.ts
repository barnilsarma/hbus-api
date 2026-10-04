import { Request, Response } from 'express';
import { RawMaterial } from '../../models/RawMaterial';

export const getRawMaterials = async (_req: Request, res: Response) => {
  try {
    const rawMaterials = await RawMaterial.find().populate('location');
    res.json(rawMaterials);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRawMaterialById = async (req: Request, res: Response) => {
  try {
    const rawMaterial = await RawMaterial.findById(req.params.id).populate('location');

    if (!rawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    res.json(rawMaterial);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRawMaterialByMCode = async (req: Request, res: Response) => {
  try {
    const rawMaterial = await RawMaterial.findOne({ mcode: req.params.mcode }).populate('location');

    if (!rawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    res.json(rawMaterial);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getRawMaterialsByLocation = async (req: Request, res: Response) => {
  try {
    const rawMaterials = await RawMaterial.find({ location: req.params.locationId }).populate('location');
    res.json(rawMaterials);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createRawMaterial = async (req: Request, res: Response) => {
  try {
    const { mcode, name, ordered, stock, location, locationId } = req.body;
    const targetLocation = location || locationId;

    if (!mcode || !name || !targetLocation) {
      return res.status(400).json({
        message: 'mcode, name, and location are required',
      });
    }

    const rawMaterial = new RawMaterial({
      mcode,
      name,
      ordered: ordered === undefined ? 0 : Number(ordered),
      stock: stock === undefined ? 0 : Number(stock),
      location: targetLocation,
    });

    await rawMaterial.save();
    res.status(201).json(rawMaterial);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updateRawMaterial = async (req: Request, res: Response) => {
  try {
    const { mcode, name, ordered, stock, location, locationId } = req.body;
    const rawMaterial = await RawMaterial.findById(req.params.id);

    if (!rawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    if (mcode !== undefined) rawMaterial.mcode = mcode;
    if (name !== undefined) rawMaterial.name = name;
    if (ordered !== undefined) rawMaterial.ordered = Number(ordered);
    if (stock !== undefined) rawMaterial.stock = Number(stock);
    if (location !== undefined || locationId !== undefined) {
      rawMaterial.location = location || locationId;
    }

    await rawMaterial.save();
    res.json(rawMaterial);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteRawMaterial = async (req: Request, res: Response) => {
  try {
    const rawMaterial = await RawMaterial.findByIdAndDelete(req.params.id);

    if (!rawMaterial) {
      return res.status(404).json({ message: 'Raw material not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};