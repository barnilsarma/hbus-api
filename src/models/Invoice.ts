import { Schema, model, Document } from 'mongoose';

export interface IInvoice extends Document {
  sl: number;
  receiptdate?: Date;
  invoiceno?: string;
  invoicedate?: Date;
  purchaseno?: string;
  mcode?: string;
  supplier?: string;
  description?: string;
  qty: number;
  unit?: string;
  invoicerate: number;
  totalamount: number;
  billamount: number;
  POqty: number;
  POrate: number;
  received: number;
  remaining: number;
  remarks?: string;
}

const InvoiceSchema = new Schema<IInvoice>({
  sl: { type: Number, required: true, unique: true },
  receiptdate: Date,
  invoiceno: { type: String, trim: true },
  invoicedate: Date,
  purchaseno: { type: String, trim: true },
  mcode: { type: String, trim: true },
  supplier: { type: String, trim: true },
  description: { type: String, trim: true },
  qty: { type: Number, required: true, default: 0 },
  unit: { type: String, trim: true },
  invoicerate: { type: Number, required: true, default: 0 },
  totalamount: { type: Number, default: 0 },
  billamount: { type: Number, default: 0 },
  POqty: { type: Number, default: 0 },
  POrate: { type: Number, default: 0 },
  received: { type: Number, default: 0 },
  remaining: { type: Number, default: 0 },
  remarks: { type: String, trim: true },
}, { timestamps: true });

export const Invoice = model<IInvoice>('Invoice', InvoiceSchema);
