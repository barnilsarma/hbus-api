import { Schema, model, Document, Types } from 'mongoose';
import { IUser } from './User';

// 1. Interface definition
export interface ILocation extends Document {
  name: string;
  address?: string;
  users?: Types.ObjectId[] | IUser[];
  createdAt: Date;
  updatedAt: Date;
}

// 2. Schema definition
const LocationSchema = new Schema<ILocation>(
  {
    name: {
      type: String,
      required: [true, 'Location name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    address: {
      type: String,
      trim: true,
      default: undefined
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

// 3. Indexes (Optional: enhances query performance on 'name')
LocationSchema.index({ name: 1 });

// 4. Model Creation & Export
export const Location = model<ILocation>('Location', LocationSchema);
export default Location;