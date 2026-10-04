import { Schema, model, Document, Types } from 'mongoose';
import {ILocation} from './Location';

export interface IRawMaterial extends Document {
    mcode:string;
    name: string;
    ordered:number;
    stock:number;
    location: ILocation;
}


// 2. Schema definition
const RawMaterialSchema = new Schema<IRawMaterial>(
  {
    mcode: {
      type: String,
      required: [true, 'Material code is required'],
      trim: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Material name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    ordered: {
      type: Number,
      default: 0
    },
    stock: {
      type: Number,
      default: 0
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location',
      required: [true, 'Location is required']
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

// 3. Indexes (Optional: enhances query performance on 'name')
RawMaterialSchema.index({ name: 1 });

// 3. Indexes (Optional: enhances query performance on 'name')

// 4. Model Creation & Export
export const RawMaterial = model<IRawMaterial>('RawMaterial', RawMaterialSchema);
export default RawMaterial;