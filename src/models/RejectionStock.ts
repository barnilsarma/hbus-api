import { Schema, model, Document } from 'mongoose';

export interface IRejectionStock extends Document {
  kva: string;
  core: number;
  lvConductor: number;
  hvConductor: number;
  oil: number;
}

const RejectionStockSchema = new Schema<IRejectionStock>({
  kva: { type: String, required: true, trim: true },
  core: { type: Number, default: 0 },
  lvConductor: { type: Number, default: 0 },
  hvConductor: { type: Number, default: 0 },
  oil: { type: Number, default: 0 },
}, { timestamps: true });

export const RejectionStock = model<IRejectionStock>('RejectionStock', RejectionStockSchema);
