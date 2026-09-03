import { Schema, model, Document, Types } from 'mongoose';

export interface IItem extends Document {
    description: string;
    gst: number;
    unit: string;
    rate: number;
    qty: number;
}

const ItemSchema = new Schema<IItem>(
    {
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
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Item = model<IItem>('Item', ItemSchema);