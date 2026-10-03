import { Schema, model, Document, Types } from 'mongoose';
import { ILocation } from './Location';
export type ItemType = 'PRIMARY' | 'SECONDARY';

export interface IItem extends Document {
    type: ItemType;
    mcode: string;
    description: string;
    gst: number;
    unit: string;
    rate: number;
    qty: number;
    newQty: number;
    receivedqtyOriginal?: number;
    receivedqtyNew?: number;
    location: ILocation;
}

const ItemSchema = new Schema<IItem>(
    {
        type: {
            type: String,
            enum: ['PRIMARY', 'SECONDARY'],
            required: true,
        },
        mcode: {
            type: String,
            required: true,
            trim: true,
            unique: true
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        gst: {
            type: Number,
            required: true,
        },
        unit: {
            type: String,
            required: true,
            trim: true,
        },
        rate: {
            type: Number,
            required: true,
        },
        qty: {
            type: Number,
            default: 0,
        },
        newQty: {
            type: Number,
            default: 0
        },
        receivedqtyOriginal: {
            type: Number,
            default: 0
        },
        receivedqtyNew: {
            type: Number,
            default: 0
        },
        location: {
            type: Schema.Types.ObjectId,
            ref: 'Location'
        }
    },
    {
        timestamps: true,
    }
);

export const Item = model<IItem>('Item', ItemSchema);