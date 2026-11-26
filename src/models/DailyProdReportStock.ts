import { Schema, model, Document } from 'mongoose';

export interface IDailyProdReportStock extends Document {
  kva: string;
  tankPaintDone: number;
  coreAssembly: number;
  lvCoil: number;
  hvCoil: number;
  coilAssembly: number;
  boxup: number;
  testingDone: number;
  tankOnlyFabrication: number;
}

const DailyProdReportStockSchema = new Schema<IDailyProdReportStock>({
  kva: { type: String, required: true, unique: true, trim: true },
  tankPaintDone: { type: Number, default: 0 },
  coreAssembly: { type: Number, default: 0 },
  lvCoil: { type: Number, default: 0 },
  hvCoil: { type: Number, default: 0 },
  coilAssembly: { type: Number, default: 0 },
  boxup: { type: Number, default: 0 },
  testingDone: { type: Number, default: 0 },
  tankOnlyFabrication: { type: Number, default: 0 },
}, { timestamps: true });

export const DailyProdReportStock = model<IDailyProdReportStock>('DailyProdReportStock', DailyProdReportStockSchema);
