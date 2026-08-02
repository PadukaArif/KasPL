import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClassMember extends Document {
  publicId: string;
  name: string;
  attendanceNumber: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const classMemberSchema = new Schema<IClassMember>(
  {
    publicId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    attendanceNumber: { type: Number, required: true, unique: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ClassMember: Model<IClassMember> =
  mongoose.models.ClassMember || mongoose.model<IClassMember>('ClassMember', classMemberSchema);
