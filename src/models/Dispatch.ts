import { Schema, model, Document, Types } from 'mongoose';
import { ILocation } from './Location';
export interface IDispatch extends Document {
    challanNo: string;
    invoiceNo?: string;
    dateOfDelivery: Date;
    type:string;
    description: string;
    new?:string;
    REP?:string;
    DTRSerialNo?:string;
    rate?:number;
    gstno?:string;
    vehicleDetails?:string;
    partyName?:string;
    destination?:string;
    location: ILocation;
}

const DispatchSchema = new Schema<IDispatch>(
    {
        type: {
            type: String,
            required: true,
            trim: true,
        },
        challanNo: {
            type: String,
            required: true,
            trim: true,
        },
        invoiceNo: {        
            type: String,
            required: false,
            trim: true,
            unique: true,
            sparse: true,
        },
        dateOfDelivery: {
            type: Date,
            required: true,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        new: {
            type: String,
            required: false,
            trim: true,
        },
        REP: {
            type: String,
            required: false,
            trim: true,
        },  
        DTRSerialNo: {
            type: String,
            required: false,
            trim: true,
        },
        rate: {
            type: Number,
            required: false,
        },
        gstno: {
            type: String,
            required: false,
            trim: true, 
        },
        vehicleDetails: {
            type: String,
            required: false,
            trim: true,
        },
        partyName: {
            type: String,
            required: false,
            trim: true,
        },
        destination: {
            type: String,
            required: false,
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

export const Dispatch = model<IDispatch>('Dispatch', DispatchSchema);