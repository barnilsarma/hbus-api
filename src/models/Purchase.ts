import { Schema, model, Document, Types } from 'mongoose';
import './Location';
import './Item';
import type { ILocation } from './Location';
import type { IItem } from './Item';

export type PurchaseStatus = 'INCOMPLETE' | 'DELAYED' | 'COMPLETE';

export interface IPurchase extends Document {
  id: Types.ObjectId;
  PONumber: string;
  supplier?: string;
  supplierAddress?: string;
  supplierState?: string;
  supplierStateCode?: number;
  gstn?: string;
  date: Date;
  status: PurchaseStatus;
  invoicenumber?: string;
  invoicedate?: Date;
  receiptdate?: string;
  receivedqty?: number;
  location: Types.ObjectId | ILocation;
  items: (Types.ObjectId | IItem)[];
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
    supplierAddress: {
      type: String,
      trim: true,
    },
    supplierState: {
      type: String,
      trim: true,
    },
    supplierStateCode: {
      type: Number,
    },
    gstn: {
      type: String,
      trim: true,
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
    ],
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: true,
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