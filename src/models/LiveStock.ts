import { Schema, model, Document, Types } from 'mongoose';
import type { ILocation } from './Location';

export interface ILiveStock extends Document {
  kva: string;
  codeCore?: string;
  codeLV?: string;
  codeHV?: string;
  looseCoreOrderedKG: number;
  lvConductorOrderedKG: number;
  hvConductorOrderedKG: number;
  looseCoreStockKG: number;
  lvConductorStockKG: number;
  hvConductorStockKG: number;
  readyToDispatch: number;
  rtdRepairing: number;
  defective: number;
  dispatch: number;
  location?: Types.ObjectId | ILocation;
}

const LiveStockSchema = new Schema<ILiveStock>({
  kva: { type: String, required: true, unique: true, trim: true },
  codeCore: { type: String, trim: true },
  codeLV: { type: String, trim: true },
  codeHV: { type: String, trim: true },
  looseCoreOrderedKG: { type: Number, default: 0 },
  lvConductorOrderedKG: { type: Number, default: 0 },
  hvConductorOrderedKG: { type: Number, default: 0 },
  looseCoreStockKG: { type: Number, default: 0 },
  lvConductorStockKG: { type: Number, default: 0 },
  hvConductorStockKG: { type: Number, default: 0 },
  readyToDispatch: { type: Number, default: 0 },
  rtdRepairing: { type: Number, default: 0 },
  defective: { type: Number, default: 0 },
  dispatch: { type: Number, default: 0 },
  location: { type: Schema.Types.ObjectId, ref: 'Location' },
}, { timestamps: true });

export const LiveStock = model<ILiveStock>('LiveStock', LiveStockSchema);
