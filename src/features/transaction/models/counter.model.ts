import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICounter extends Document {
  name: string;
  date: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>({
  name: { type: String, required: true },
  date: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

counterSchema.index({ name: 1, date: 1 }, { unique: true });

export const Counter: Model<ICounter> = mongoose.models.Counter || mongoose.model<ICounter>('Counter', counterSchema);
