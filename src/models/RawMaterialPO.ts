import { Schema, model, Document, Types } from 'mongoose';
import type { ILocation } from './Location';
import type { IRawMaterial } from './RawMaterial';

export type RawMaterialPOStatus = 'INCOMPLETE' | 'DELAYED' | 'COMPLETE';

export interface IRawMaterialPO extends Document {
  id: Types.ObjectId;
  PONumber: string;
  supplier?: string;
  supplierAddress?: string;
  supplierState?: string;
  supplierStateCode?: number;
  gstn?: string;
  date: Date;
  status: RawMaterialPOStatus;
  invoicenumber?: string;
  invoicedate?: Date;
  receiptdate?: string;
  location: Types.ObjectId | ILocation;
  rawMaterials: (Types.ObjectId | IRawMaterial)[];
  createdAt: Date;
  updatedAt: Date;
}

const RawMaterialPOSchema = new Schema<IRawMaterialPO>(
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
    rawMaterials: [
      {
        type: Schema.Types.ObjectId,
        ref: 'RawMaterial',
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
  },
  {
    timestamps: true,
  }
);

export const RawMaterialPO = model<IRawMaterialPO>('RawMaterialPO', RawMaterialPOSchema);
