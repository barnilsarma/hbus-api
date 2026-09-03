import { Schema, model, Document, Types } from 'mongoose';
import { ILocation } from './Location';

export type UserRole = 'A' | 'B' | 'C' | 'D';

export const rolePriority: Record<UserRole, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

export interface IUser extends Document {
  name: string;
  email: string;
  role: UserRole;
  location?: Types.ObjectId | ILocation; // TypeScript type definition
  viewaccess?: string[];
  editaccess?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D'],
      default: 'D',
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: 'Location', // Schema definition
    },
    viewaccess: {
      type: [String],
      default: [],
    },
    editaccess: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);
export default User;