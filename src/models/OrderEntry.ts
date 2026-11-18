import { Schema, model, Document, Types } from 'mongoose';
import type { ILocation } from './Location';

export interface IOrderEntry extends Document {
  material: 'CORE' | 'LV CONDUCTOR' | 'HV CONDUCTOR';
  kva: string;
  code: string;
  description?: string;
  qty: number;
  qtyinjob: number;
  location?: Types.ObjectId | ILocation;
}

const OrderEntrySchema = new Schema<IOrderEntry>({
  material: { type: String, enum: ['CORE', 'LV CONDUCTOR', 'HV CONDUCTOR'], required: true },
  kva: { type: String, required: true, trim: true },
  code: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  qty: { type: Number, required: true, default: 0 },
  qtyinjob: { type: Number, required: true, default: 0 },
  location: { type: Schema.Types.ObjectId, ref: 'Location' },
}, { timestamps: true });

export const OrderEntry = model<IOrderEntry>('OrderEntry', OrderEntrySchema);
