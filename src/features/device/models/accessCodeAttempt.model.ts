import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAccessCodeAttempt extends Document {
  identifier: string;
  failedAttempts: number;
  lockedUntil?: Date;
  lastAttemptAt: Date;
}

const AccessCodeAttemptSchema = new Schema<IAccessCodeAttempt>(
  {
    identifier: { type: String, required: true, unique: true, index: true },
    failedAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
    lastAttemptAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    collection: 'accessCodeAttempts',
  }
);

export const AccessCodeAttempt: Model<IAccessCodeAttempt> =
  mongoose.models.AccessCodeAttempt ||
  mongoose.model<IAccessCodeAttempt>('AccessCodeAttempt', AccessCodeAttemptSchema);
