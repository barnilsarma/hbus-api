import { Schema, model, Document } from 'mongoose';

export interface IRawMaterial extends Document {
  name: string;
  unit?: string;
  quantity?: number;
}

const RawMaterialSchema = new Schema<IRawMaterial>({
  name: { type: String, required: true, trim: true },
  unit: { type: String, trim: true },
  quantity: { type: Number, default: 0 },
}, { timestamps: true });

export const RawMaterial = model<IRawMaterial>('RawMaterial', RawMaterialSchema);
