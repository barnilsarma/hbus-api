import { Schema, model, Document, Types } from 'mongoose';
import { ILocation } from './Location';
import { IItem } from './Item';

export interface IDispatchAccessory {
    item: Types.ObjectId | IItem;
    quantity: number;
}

export interface IDispatch extends Document {
    challanNo: string;
    invoiceNo?: string;
    dateOfDelivery: Date;
    type:string;
    description: string;
    item?: Types.ObjectId | IItem;
    quantity?: number;
    HSNCode?: string;
    new?:string;
    REP?:string;
    DTRSerialNo?:string;
    rate?:number;
    gstno?:string;
    vehicleDetails?:string;
    partyName?:string;
    destination?:string;
    location: ILocation;
    accessories?: IDispatchAccessory[];
}

const DispatchAccessorySchema = new Schema<IDispatchAccessory>(
    {
        item: {
            type: Schema.Types.ObjectId,
            ref: 'Item',
            required: true,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
    },
    { _id: false }
);

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
        item: {
            type: Schema.Types.ObjectId,
            ref: 'Item',
        },
        quantity: {
            type: Number,
            required: false,
            min: 0,
        },
        HSNCode: {
            type: String,
            required: false,
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
        },
        accessories: [DispatchAccessorySchema],
    },
    {
        timestamps: true,
        optimisticConcurrency: true,
    }
);

export const Dispatch = model<IDispatch>('Dispatch', DispatchSchema);