import { Schema, model, Document } from 'mongoose';

export interface IStockAdjustmentEntry extends Document {
  email: string;
  kva: string;
  core: number;
  ltConductor: number;
  htConductor: number;
  remarks?: string;
}

const StockAdjustmentEntrySchema = new Schema<IStockAdjustmentEntry>({
  email: { type: String, required: true, trim: true },
  kva: { type: String, required: true, trim: true },
  core: { type: Number, required: true, default: 0 },
  ltConductor: { type: Number, required: true, default: 0 },
  htConductor: { type: Number, required: true, default: 0 },
  remarks: { type: String, trim: true },
}, { timestamps: true });

export const StockAdjustmentEntry = model<IStockAdjustmentEntry>('StockAdjustmentEntry', StockAdjustmentEntrySchema);
