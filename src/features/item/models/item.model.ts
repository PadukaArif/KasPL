import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IItem extends Document {
  publicId: string;
  name: string;
  category: 'FOOD' | 'DRINK' | 'SNACK';
  costPrice: number;
  sellingPrice: number;
  recommendedStock: number;
  displayOrder: number;
  isActive: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItem>(
  {
    publicId: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, enum: ['FOOD', 'DRINK', 'SNACK'], required: true },
    costPrice: { type: Number, required: true },
    sellingPrice: { type: Number, required: true },
    recommendedStock: { type: Number, required: true },
    displayOrder: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Unique index for publicId
itemSchema.index({ publicId: 1 }, { unique: true });

// Case-insensitive unique index for name of active items
itemSchema.index(
  { name: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 },
    partialFilterExpression: { deletedAt: null },
  }
);

// Index for displayOrder
itemSchema.index({ displayOrder: 1 });

export const Item: Model<IItem> =
  mongoose.models.Item || mongoose.model<IItem>('Item', itemSchema);
