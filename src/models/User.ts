import { Schema, model, Document, Types } from 'mongoose';

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
  createdAt: Date;
  updatedAt: Date;
  viewaccess: Types.ObjectId[];
  editaccess: Types.ObjectId[];
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
    viewaccess: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Department',
        },
      ],
      default: [],
    },
    editaccess: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Department',
        },
      ],
      default: [],
    }
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>('User', UserSchema);
