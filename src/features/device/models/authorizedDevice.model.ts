import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuthorizedDevice extends Document {
  deviceId: string;
  deviceToken: string;
  deviceName: string;
  browser: string;
  platform: string;
  userAgent: string;
  ipAddress?: string;
  createdAt: Date;
  lastActive: Date;
  isRevoked: boolean;
  revokedAt?: Date;
}

const AuthorizedDeviceSchema = new Schema<IAuthorizedDevice>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    deviceToken: { type: String, required: true, index: true },
    deviceName: { type: String, required: true },
    browser: { type: String, required: true },
    platform: { type: String, required: true },
    userAgent: { type: String, required: true },
    ipAddress: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now },
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: { type: Date },
  },
  {
    timestamps: false,
    collection: 'authorizedDevices',
  }
);

export const AuthorizedDevice: Model<IAuthorizedDevice> =
  mongoose.models.AuthorizedDevice ||
  mongoose.model<IAuthorizedDevice>('AuthorizedDevice', AuthorizedDeviceSchema);
