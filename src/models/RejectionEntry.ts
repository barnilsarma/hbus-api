import { Schema, model, Document } from 'mongoose';

export interface IRejectionEntry extends Document {
  timestamp: Date;
  email: string;
  kva: string;
  coreRejectionKG: number;
  lvConductorRejectionKG: number;
  hvConductorRejectionKG: number;
  remarks_enter_purchase_no: string;
  oilRejectionLtr: number;
  remarks?: string;
}

const RejectionEntrySchema = new Schema<IRejectionEntry>({
  timestamp: { type: Date, default: Date.now },
  email: { type: String, required: true, trim: true },
  kva: { type: String, required: true, trim: true },
  coreRejectionKG: { type: Number, required: true, default: 0 },
  lvConductorRejectionKG: { type: Number, required: true, default: 0 },
  hvConductorRejectionKG: { type: Number, required: true, default: 0 },
  remarks_enter_purchase_no: { type: String, required: true, trim: true },
  oilRejectionLtr: { type: Number, required: true, default: 0 },
  remarks: { type: String, trim: true },
}, { timestamps: true });

export const RejectionEntry = model<IRejectionEntry>('RejectionEntry', RejectionEntrySchema);
