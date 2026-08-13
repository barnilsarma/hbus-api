import { Document, model, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// These virtuals provide the inverse of the references stored on User.
DepartmentSchema.virtual('viewaccess', {
  ref: 'User',
  localField: '_id',
  foreignField: 'viewaccess',
});

DepartmentSchema.virtual('editaccess', {
  ref: 'User',
  localField: '_id',
  foreignField: 'editaccess',
});

export const Department = model<IDepartment>('Department', DepartmentSchema);
