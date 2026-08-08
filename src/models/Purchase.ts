import { Schema, model, Document, Types } from 'mongoose';

export type PurchaseStatus = 'INCOMPLETE' | 'DELAYED' | 'COMPLETE';

export interface IPurchase extends Document {
  id: Types.ObjectId;
  PONumber: string;
  supplier?: string;
  item?: string;
  gst?: number;
  unit?: string;
  rate?: number;
  qty?: number;
  date: Date;
  status: PurchaseStatus;
  amount?: number;
  invoicenumber?: string;
  invoicedate?: Date;
  receiptdate?: string;
  receivedqty?: number;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<IPurchase>(
  {
    id: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId(),
    },
    PONumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    supplier: {
      type: String,
      trim: true,
    },
    item: {
      type: String,
      trim: true,
    },
    gst: {
      type: Number,
    },
    unit: {
      type: String,
      trim: true,
    },
    rate: {
      type: Number,
    },
    qty: {
      type: Number,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['INCOMPLETE', 'DELAYED', 'COMPLETE'],
      default: 'INCOMPLETE',
    },
    amount: {
      type: Number,
      default: function (this: IPurchase) {
        const gst = Number(this.gst ?? 0);
        const qty = Number(this.qty ?? 0);
        const rate = Number(this.rate ?? 0);
        return (gst * qty) / 100 + qty * rate;
      },
    },
    invoicenumber: {
      type: String,
      trim: true,
    },
    invoicedate: {
      type: Date,
    },
    receiptdate: {
      type: String,
      trim: true,
    },
    receivedqty: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Purchase = model<IPurchase>('Purchase', PurchaseSchema);
