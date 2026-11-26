import { Schema, model, Document } from 'mongoose';

export interface IProductionFlor extends Document {
  kva: string;
  tank: number;
  coreAssemblyStock: number;
  lvCoilStock: number;
  hvCoilStock: number;
  coilAssembly: number;
  boxup: number;
  rtd: number;
  tankOnlyFabrication: number;
}

const ProductionFlorSchema = new Schema<IProductionFlor>({
  kva: { type: String, required: true, unique: true, trim: true },
  tank: { type: Number, default: 0 },
  coreAssemblyStock: { type: Number, default: 0 },
  lvCoilStock: { type: Number, default: 0 },
  hvCoilStock: { type: Number, default: 0 },
  coilAssembly: { type: Number, default: 0 },
  boxup: { type: Number, default: 0 },
  rtd: { type: Number, default: 0 },
  tankOnlyFabrication: { type: Number, default: 0 },
}, { timestamps: true });

export const ProductionFlor = model<IProductionFlor>('ProductionFlor', ProductionFlorSchema);
