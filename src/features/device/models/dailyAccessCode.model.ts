import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyAccessCode extends Document {
  codeHash: string;
  encryptedCode: string;
  dateStr: string;
  isUsed: boolean;
  usedByDeviceId?: string;
  createdAt: Date;
  expiresAt: Date;
}

const DailyAccessCodeSchema = new Schema<IDailyAccessCode>(
  {
    codeHash: { type: String, required: true, index: true },
    encryptedCode: { type: String, required: true },
    dateStr: { type: String, required: true, index: true },
    isUsed: { type: Boolean, default: false, index: true },
    usedByDeviceId: { type: String },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: false,
    collection: 'dailyAccessCodes',
  }
);

export const DailyAccessCode: Model<IDailyAccessCode> =
  mongoose.models.DailyAccessCode ||
  mongoose.model<IDailyAccessCode>('DailyAccessCode', DailyAccessCodeSchema);
