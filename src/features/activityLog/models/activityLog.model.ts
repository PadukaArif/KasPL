import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  action: string;
  actor: string;
  details: string;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    actor: { type: String, default: 'SYSTEM' },
    details: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
