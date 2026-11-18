import { Schema, model, Document } from 'mongoose';

export interface IInvoicePO extends Document {
  date?: Date;
  POnumber: string;
  supplier?: string;
  icode?: string;
  description?: string;
  qty: number;
  unit?: string;
  rate: number;
  total: number;
  totalamountPO: number;
  received: number;
  remaining: number;
  remarks?: string;
}

const InvoicePOSchema = new Schema<IInvoicePO>({
  date: Date,
  POnumber: { type: String, required: true, trim: true },
  supplier: { type: String, trim: true },
  icode: { type: String, trim: true },
  description: { type: String, trim: true },
  qty: { type: Number, required: true, default: 0 },
  unit: { type: String, trim: true },
  rate: { type: Number, required: true, default: 0 },
  total: { type: Number, default: 0 },
  totalamountPO: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  remarks: { type: String, trim: true },
}, { timestamps: true });

export const InvoicePO = model<IInvoicePO>('InvoicePO', InvoicePOSchema);
