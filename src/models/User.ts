import { Schema, model, Document } from 'mongoose';

export type UserRole = 'A' | 'B' | 'C' | 'D';

export const rolePriority: Record<UserRole, number> = {
  A: 4,
  B: 3,
  C: 2,
  D: 1,
};

export interface IUser extends Document {
  userId: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C', 'D'],
      default: 'D',
    },
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);
