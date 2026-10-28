import { Schema, model, Document, Types } from 'mongoose';
import type { ILocation } from './Location';
import type { IRawMaterial } from './RawMaterial';

export interface IPrimaryRawMaterial {
    name: Types.ObjectId | IRawMaterial;
    units: number;
}

export interface IPrimary extends Document {
    name: string;
    ready:number;
    repairing:number;
    defective:number;
    location: Types.ObjectId | ILocation;
    rawMaterials: IPrimaryRawMaterial[];
}

const PrimaryRawMaterialSchema = new Schema<IPrimaryRawMaterial>(
    {
        name: {
            type: Schema.Types.ObjectId,
            ref: 'RawMaterial',
            required: [true, 'Raw material is required']
        },
        units: {
            type: Number,
            required: [true, 'Raw material units are required'],
            min: [0, 'Raw material units cannot be negative']
        }
    },
    { _id: false }
);

const PrimarySchema = new Schema<IPrimary>(
  {
    name: {
        type: String,
        required: [true, 'Primary name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    ready: {
        type: Number,
        default: 0
    },
    repairing: {
        type: Number,
        default: 0
    },
    defective: {
        type: Number,
        default: 0
    },
    location: {
        type: Schema.Types.ObjectId,
        ref: 'Location',
        required: [true, 'Location is required']
    },
    rawMaterials: {
        type: [PrimaryRawMaterialSchema],
        default: []
    }
},
{
    timestamps: true
}
);  

export const Primary = model<IPrimary>('Primary', PrimarySchema);
export default Primary;