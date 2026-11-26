import { Schema, model, Document } from 'mongoose';

export interface IPerJobData extends Document {
  kva: string;
  coreCode: string;
  lvConductorCode: string;
  hvConductorCode: string;
  corePerJobKG: number;
  lvConductorPerJobKG: number;
  hvConductorPerJobKG: number;
  oilConsumptionPerJob: number;
  radiatorCode: string;
  radiatorPerJob: number;
  lvConductorSize: string;
  hvConductorSize: string;
  widthWithRadiator: number;
  length: number;
  height: number;
  weightKG: number;
  blankTankWeight: number;
  yellow?: string;
  manualIdea?: string;
}

const PerJobDataSchema = new Schema<IPerJobData>({
  kva: { type: String, required: true, unique: true, trim: true },
  coreCode: { type: String, required: true, trim: true },
  lvConductorCode: { type: String, required: true, trim: true },
  hvConductorCode: { type: String, required: true, trim: true },
  corePerJobKG: { type: Number, required: true, default: 0 },
  lvConductorPerJobKG: { type: Number, required: true, default: 0 },
  hvConductorPerJobKG: { type: Number, required: true, default: 0 },
  oilConsumptionPerJob: { type: Number, required: true, default: 0 },
  radiatorCode: { type: String, required: true, trim: true },
  radiatorPerJob: { type: Number, required: true, default: 0 },
  lvConductorSize: { type: String, required: true, trim: true },
  hvConductorSize: { type: String, required: true, trim: true },
  widthWithRadiator: { type: Number, required: true, default: 0 },
  length: { type: Number, required: true, default: 0 },
  height: { type: Number, required: true, default: 0 },
  weightKG: { type: Number, required: true, default: 0 },
  blankTankWeight: { type: Number, required: true, default: 0 },
  yellow: { type: String, trim: true },
  manualIdea: { type: String, trim: true },
}, { timestamps: true });

export const PerJobData = model<IPerJobData>('PerJobData', PerJobDataSchema);
export const PerjobData = PerJobData;
