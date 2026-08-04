import mongoose, { Schema, Document, Model } from 'mongoose';
import '@/features/member/models/member.model';

export interface ISellingSession extends Document {
  publicId: string;
  periodMonth: number;
  periodWeek: number;
  startDate: Date;
  endDate: Date | null;
  guardians: mongoose.Types.ObjectId[];
  status: 'ACTIVE' | 'CLOSED';
  closedAt: Date | null;
  summary: {
    revenue: number;
    cost: number;
    grossProfit: number;
    expense: number;
    netProfit: number;
    itemsSold: number;
    transactionsCount: number;
    schoolShare: number;
    classShare: number;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}
const sellingSessionSchema = new Schema<ISellingSession>(
  {
    publicId: { type: String, required: true, unique: true },
    periodMonth: { type: Number, required: true },
    periodWeek: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    guardians: [{ type: Schema.Types.ObjectId, ref: 'ClassMember', required: true }],
    status: { type: String, enum: ['ACTIVE', 'CLOSED'], default: 'ACTIVE' },
    closedAt: { type: Date, default: null },
    summary: {
      type: {
        revenue: { type: Number, required: true },
        cost: { type: Number, required: true },
        grossProfit: { type: Number, required: true },
        expense: { type: Number, required: true },
        netProfit: { type: Number, required: true },
        itemsSold: { type: Number, required: true },
        transactionsCount: { type: Number, required: true },
        schoolShare: { type: Number, required: true },
        classShare: { type: Number, required: true },
      },
      default: null,
    },
  },
  { timestamps: true }
);

// Enforce exactly 3 guardians at the schema level
sellingSessionSchema.path('guardians').validate(function (value: mongoose.Types.ObjectId[]) {
  return value.length === 3;
}, 'Sesi penjualan harus memiliki tepat 3 penjaga.');

// Enforce unique active session per month/week
sellingSessionSchema.index(
  { periodMonth: 1, periodWeek: 1 },
  { unique: true, partialFilterExpression: { status: 'ACTIVE' } }
);

export const SellingSession: Model<ISellingSession> =
  mongoose.models.SellingSession || mongoose.model<ISellingSession>('SellingSession', sellingSessionSchema);
