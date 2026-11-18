import { Schema, model, Document } from 'mongoose';

export interface IRepairingDataReturnStock extends Document {
  kva: string;
  stock: number;
}

const RepairingDataReturnStockSchema = new Schema<IRepairingDataReturnStock>({
  kva: { type: String, required: true, trim: true },
  stock: { type: Number, required: true, default: 0 },
}, { timestamps: true });

export const RepairingDataReturnStock = model<IRepairingDataReturnStock>('RepairingDataReturnStock', RepairingDataReturnStockSchema);
