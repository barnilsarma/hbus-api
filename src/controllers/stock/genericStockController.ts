import { Request, Response } from 'express';
import { Model, Types } from 'mongoose';

export const createGenericController = (ModelClass: Model<any>, name: string) => {
  const getError = (error: unknown) => error instanceof Error ? error.message : `Failed to process ${name}`;
  const getAll = async (_req: Request, res: Response) => {
    try { res.json(await ModelClass.find()); }
    catch (error: unknown) { res.status(500).json({ message: getError(error) }); }
  };
  const getById = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid ID' });
      const record = await ModelClass.findById(id);
      if (!record) return res.status(404).json({ message: `${name} not found` });
      res.json(record);
    } catch (error: unknown) { res.status(500).json({ message: getError(error) }); }
  };
  const create = async (req: Request, res: Response) => {
    try {
      const record = await ModelClass.create(req.body);
      res.status(201).json(record);
    } catch (error: unknown) { res.status(400).json({ message: getError(error) }); }
  };
  const update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid ID' });
      const record = await ModelClass.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!record) return res.status(404).json({ message: `${name} not found` });
      res.json(record);
    } catch (error: unknown) { res.status(400).json({ message: getError(error) }); }
  };
  const remove = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (typeof id !== 'string' || !Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid ID' });
      const record = await ModelClass.findByIdAndDelete(id);
      if (!record) return res.status(404).json({ message: `${name} not found` });
      res.status(204).send();
    } catch (error: unknown) { res.status(500).json({ message: getError(error) }); }
  };
  return { getAll, getById, create, update, remove };
};
