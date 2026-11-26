import { Schema, model, Document } from 'mongoose';

export interface IRepairingData extends Document {
  timestamp: Date;
  email: string;
  kva: string;
  totalRepairing: number;
  workDetailsWithDTRSNo?: string;
  operator: string;
  lvCoilChanged?: number;
  hvCoilChanged?: number;
  newOilUsing?: number;
  remarks?: string;
}

const RepairingDataSchema = new Schema<IRepairingData>({
  timestamp: { type: Date, default: Date.now },
  email: { type: String, required: true, trim: true },
  kva: { type: String, required: true, trim: true },
  totalRepairing: { type: Number, required: true, default: 0 },
  workDetailsWithDTRSNo: { type: String, trim: true },
  operator: { type: String, required: true, trim: true },
  lvCoilChanged: { type: Number, default: 0 },
  hvCoilChanged: { type: Number, default: 0 },
  newOilUsing: { type: Number, default: 0 },
  remarks: { type: String, trim: true },
}, { timestamps: true });

export const RepairingData = model<IRepairingData>('RepairingData', RepairingDataSchema);
