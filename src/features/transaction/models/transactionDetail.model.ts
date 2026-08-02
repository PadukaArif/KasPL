import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransactionDetail extends Document {
  transactionId: mongoose.Types.ObjectId;
  inventoryId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemPublicId: string;
  itemNameSnapshot: string;
  categorySnapshot: 'FOOD' | 'DRINK' | 'SNACK';
  costPriceSnapshot: number;
  sellingPriceSnapshot: number;
  quantity: number;
  subtotalRevenue: number;
  subtotalCost: number;
  subtotalProfit: number;
  createdAt: Date;
  updatedAt: Date;
}

const transactionDetailSchema = new Schema<ITransactionDetail>(
  {
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', required: true },
    inventoryId: { type: Schema.Types.ObjectId, ref: 'DailyInventory', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    itemPublicId: { type: String, required: true },
    itemNameSnapshot: { type: String, required: true },
    categorySnapshot: { type: String, enum: ['FOOD', 'DRINK', 'SNACK'], required: true },
    costPriceSnapshot: { type: Number, required: true },
    sellingPriceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotalRevenue: { type: Number, required: true, min: 0 },
    subtotalCost: { type: Number, required: true, min: 0 },
    subtotalProfit: { type: Number, required: true },
  },
  { timestamps: true }
);

transactionDetailSchema.index({ transactionId: 1 });
transactionDetailSchema.index({ inventoryId: 1 });
transactionDetailSchema.index({ itemId: 1 });

export const TransactionDetail: Model<ITransactionDetail> =
  mongoose.models.TransactionDetail ||
  mongoose.model<ITransactionDetail>('TransactionDetail', transactionDetailSchema);
