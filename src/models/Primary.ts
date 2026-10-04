import { Schema, model, Document, Types } from 'mongoose';
import {ILocation} from './Location';
import {IRawMaterial} from './RawMaterial';

export interface IPrimary extends Document {
    name: string;
    ready:number;
    repairing:number;
    defective:number;
    location: ILocation;
    rawMaterials: IRawMaterial[];
}

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
    rawMaterials: [
        {
            type: Schema.Types.ObjectId,
            ref: 'RawMaterial'
        }
    ]
},
{
    timestamps: true
}
);  

export const Primary = model<IPrimary>('Primary', PrimarySchema);
export default Primary;