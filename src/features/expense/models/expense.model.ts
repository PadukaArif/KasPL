import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IExpense extends Document {
  publicId: string;
  sessionId: mongoose.Types.ObjectId;
  title: string;
  category: 'OPERATIONAL' | 'RAW_MATERIAL' | 'EQUIPMENT' | 'OTHER';
  amount: number;
  notes?: string;
  expenseDate: Date;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    publicId: { type: String, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'SellingSession', required: true },
    title: { type: String, required: true, trim: true },
    category: { 
      type: String, 
      enum: ['OPERATIONAL', 'RAW_MATERIAL', 'EQUIPMENT', 'OTHER'], 
      required: true 
    },
    amount: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true },
    expenseDate: { type: Date, default: Date.now },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Unique index for publicId
expenseSchema.index({ publicId: 1 }, { unique: true });

// Index for session queries
expenseSchema.index({ sessionId: 1 });

// Index for category and date for reporting/filtering
expenseSchema.index({ category: 1, expenseDate: -1 });
expenseSchema.index({ expenseDate: -1 });

export const Expense: Model<IExpense> =
  mongoose.models.Expense || mongoose.model<IExpense>('Expense', expenseSchema);
