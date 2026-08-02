import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  publicId: string;
  version: number;
  businessDate: string;
  periodMonth: number;
  periodWeek: number;
  sessionId: mongoose.Types.ObjectId;
  sessionPublicId: string;
  cashierMemberId: string;
  cashierName: string;
  guardianMemberIds: string[];
  guardianNames: string[];
  paymentMethod: 'CASH';
  totalItems: number;
  totalQuantity: number;
  grossRevenue: number;
  grossCost: number;
  grossProfit: number;
  netProfit: number;
  status: 'SUCCESS' | 'CANCELLED';
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    publicId: { type: String, required: true },
    version: { type: Number, default: 1 },
    businessDate: { type: String, required: true },
    periodMonth: { type: Number, required: true },
    periodWeek: { type: Number, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'SellingSession', required: true },
    sessionPublicId: { type: String, required: true },
    cashierMemberId: { type: String, required: true },
    cashierName: { type: String, required: true },
    guardianMemberIds: [{ type: String }],
    guardianNames: [{ type: String }],
    paymentMethod: { type: String, enum: ['CASH'], default: 'CASH' },
    totalItems: { type: Number, required: true, min: 1 },
    totalQuantity: { type: Number, required: true, min: 1 },
    grossRevenue: { type: Number, required: true, min: 0 },
    grossCost: { type: Number, required: true, min: 0 },
    grossProfit: { type: Number, required: true },
    netProfit: { type: Number, required: true },
    status: { type: String, enum: ['SUCCESS', 'CANCELLED'], default: 'SUCCESS' },
  },
  { timestamps: true }
);

transactionSchema.index({ publicId: 1 }, { unique: true });
transactionSchema.index({ businessDate: 1 });
transactionSchema.index({ periodMonth: 1, periodWeek: 1 });
transactionSchema.index({ sessionId: 1 });
transactionSchema.index({ createdAt: -1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', transactionSchema);
