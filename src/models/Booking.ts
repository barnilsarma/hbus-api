import { Schema, model, Document, Types } from 'mongoose';
import { ILocation } from './Location';
enum BookingStatus {
    BOOKING = 'BOOKING',
    DELIVERED = 'DELIVERED',
    CANCELLED = 'CANCELLED',
}
export interface IBooking extends Document {
    date: Date;
    status: BookingStatus;
    KvaDesign: string;
    qty: number;
    cutsomer:string;
    address?:string;
    contact?:string;
    advancePayment?: number;
    remarks?: string;
    location: Types.ObjectId | ILocation;
}
const BookingSchema = new Schema<IBooking>(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now,
        },
        status: {
            type: String,
            enum: Object.values(BookingStatus),
            default: BookingStatus.BOOKING
        },
        KvaDesign: {
            type: String,
            required: true,
            trim: true,
        },
        qty: {
            type: Number,
            required: true,
            min: 1,
        },
        cutsomer: {
            type: String,
            required: true,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        contact: {
            type: String,
            trim: true,
        },
        advancePayment: {
            type: Number,
            min: 0,
        },
        remarks: {
            type: String,
            trim: true,
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

export const BookingModel = model<IBooking>('Booking', BookingSchema);