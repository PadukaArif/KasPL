import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IActivityLog extends Document {
  action: 'CREATE_TRANSACTION' | 'CHECKOUT_SUCCESS' | 'FIRST_TRANSACTION_LOCK';
  entity: string;
  entityId: string;
  performedBy: string; // Member name or ID
  sessionId: mongoose.Types.ObjectId;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  createdAt: Date;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, required: true },
    performedBy: { type: String, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'SellingSession', required: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

activityLogSchema.index({ sessionId: 1 });
activityLogSchema.index({ action: 1 });

export const ActivityLog: Model<IActivityLog> =
  mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', activityLogSchema);
