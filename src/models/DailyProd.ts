import { Schema, model, Document } from 'mongoose';

export interface IDailyProd extends Document {
  timestamp: Date;
  operator: string;
  kva: string;
  tank: number;
  coreAssemblyDone: number;
  lvCoilWinding: number;
  hvCoilWinding: number;
  coilAssembly: number;
  boxupDone: number;
  testingDone: number;
  email: string;
  remarks?: string;
  date?: Date;
  paint?: number;
  coreJobNo?: string;
  lvJobNo?: string;
  hvJobNo?: string;
  coilJobNo?: string;
  boxupJobNo?: string;
}

const DailyProdSchema = new Schema<IDailyProd>({
  timestamp: { type: Date, default: Date.now },
  operator: { type: String, required: true, trim: true },
  kva: { type: String, required: true, trim: true },
  tank: { type: Number, required: true, default: 0 },
  coreAssemblyDone: { type: Number, required: true, default: 0 },
  lvCoilWinding: { type: Number, required: true, default: 0 },
  hvCoilWinding: { type: Number, required: true, default: 0 },
  coilAssembly: { type: Number, required: true, default: 0 },
  boxupDone: { type: Number, required: true, default: 0 },
  testingDone: { type: Number, required: true, default: 0 },
  email: { type: String, required: true, trim: true },
  remarks: { type: String, trim: true },
  date: Date,
  paint: { type: Number, default: 0 },
  coreJobNo: { type: String, trim: true },
  lvJobNo: { type: String, trim: true },
  hvJobNo: { type: String, trim: true },
  coilJobNo: { type: String, trim: true },
  boxupJobNo: { type: String, trim: true },
}, { timestamps: true });

export const DailyProd = model<IDailyProd>('DailyProd', DailyProdSchema);
