import { Schema, model, Document } from 'mongoose';

export interface IRepairingDataRepairingStock extends Document {
  kva: string;
  stock: number;
  lvCoil: number;
  hvCoil: number;
  oil: number;
}

const RepairingDataRepairingStockSchema = new Schema<IRepairingDataRepairingStock>({
  kva: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, default: 0 },
  lvCoil: { type: Number, required: true, default: 0 },
  hvCoil: { type: Number, required: true, default: 0 },
  oil: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const RepairingDataRepairingStock = model<IRepairingDataRepairingStock>('RepairingDataRepairingStock', RepairingDataRepairingStockSchema);
