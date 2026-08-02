import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDailyInventory extends Document {
  publicId: string;
  sessionId: mongoose.Types.ObjectId;
  itemId: mongoose.Types.ObjectId;
  itemPublicId: string;
  itemNameSnapshot: string;
  categorySnapshot: 'FOOD' | 'DRINK' | 'SNACK';
  costPriceSnapshot: number;
  sellingPriceSnapshot: number;
  displayOrderSnapshot: number;
  openingStock: number;
  remainingStock: number;
  soldQuantity: number;
  status: 'OPEN' | 'LOCKED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

const dailyInventorySchema = new Schema<IDailyInventory>(
  {
    publicId: { type: String, required: true },
    sessionId: { type: Schema.Types.ObjectId, ref: 'SellingSession', required: true },
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    itemPublicId: { type: String, required: true },
    itemNameSnapshot: { type: String, required: true },
    categorySnapshot: { type: String, enum: ['FOOD', 'DRINK', 'SNACK'], required: true },
    costPriceSnapshot: { type: Number, required: true },
    sellingPriceSnapshot: { type: Number, required: true },
    displayOrderSnapshot: { type: Number, required: true },
    openingStock: { type: Number, required: true, min: 0 },
    remainingStock: { type: Number, required: true, min: 0 },
    soldQuantity: { type: Number, required: true, default: 0, min: 0 },
    status: { type: String, enum: ['OPEN', 'LOCKED', 'CLOSED'], default: 'OPEN' },
  },
  { timestamps: true }
);

// Indexes
dailyInventorySchema.index({ publicId: 1 }, { unique: true });
dailyInventorySchema.index({ sessionId: 1 });
dailyInventorySchema.index({ itemId: 1 });
dailyInventorySchema.index({ status: 1 });

// Compound Unique Index: One inventory entry per item per session
dailyInventorySchema.index({ sessionId: 1, itemId: 1 }, { unique: true });

export const DailyInventory: Model<IDailyInventory> =
  mongoose.models.DailyInventory || mongoose.model<IDailyInventory>('DailyInventory', dailyInventorySchema);
