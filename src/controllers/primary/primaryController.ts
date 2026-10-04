import { Request, Response } from 'express';
import { Primary } from '../../models/Primary';

export const getPrimaries = async (_req: Request, res: Response) => {
  try {
    const primaries = await Primary.find().populate('location').populate('rawMaterials');
    res.json(primaries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrimaryById = async (req: Request, res: Response) => {
  try {
    const primary = await Primary.findById(req.params.id).populate('location').populate('rawMaterials');

    if (!primary) {
      return res.status(404).json({ message: 'Primary not found' });
    }

    res.json(primary);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getPrimariesByLocation = async (req: Request, res: Response) => {
  try {
    const primaries = await Primary.find({ location: req.params.locationId })
      .populate('location')
      .populate('rawMaterials');
    res.json(primaries);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const createPrimary = async (req: Request, res: Response) => {
  try {
    const { name, ready, repairing, defective, location, locationId, rawMaterials } = req.body;
    const targetLocation = location || locationId;

    if (!name || !targetLocation) {
      return res.status(400).json({ message: 'name and location are required' });
    }

    const primary = new Primary({
      name,
      ready: ready === undefined ? 0 : Number(ready),
      repairing: repairing === undefined ? 0 : Number(repairing),
      defective: defective === undefined ? 0 : Number(defective),
      location: targetLocation,
      rawMaterials: rawMaterials || [],
    });

    await primary.save();
    await primary.populate(['location', 'rawMaterials']);
    res.status(201).json(primary);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePrimary = async (req: Request, res: Response) => {
  try {
    const { name, ready, repairing, defective, location, locationId, rawMaterials } = req.body;
    const primary = await Primary.findById(req.params.id);

    if (!primary) {
      return res.status(404).json({ message: 'Primary not found' });
    }

    if (name !== undefined) primary.name = name;
    if (ready !== undefined) primary.ready = Number(ready);
    if (repairing !== undefined) primary.repairing = Number(repairing);
    if (defective !== undefined) primary.defective = Number(defective);
    if (location !== undefined || locationId !== undefined) {
      primary.location = location || locationId;
    }
    if (rawMaterials !== undefined) primary.rawMaterials = rawMaterials;

    await primary.save();
    await primary.populate(['location', 'rawMaterials']);
    res.json(primary);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePrimary = async (req: Request, res: Response) => {
  try {
    const primary = await Primary.findByIdAndDelete(req.params.id);

    if (!primary) {
      return res.status(404).json({ message: 'Primary not found' });
    }

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
