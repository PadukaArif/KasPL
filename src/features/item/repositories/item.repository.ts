import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import { Item, IItem } from '../models/item.model';


export class ItemRepository {
  static async findAll(options: {
    search?: string;
    category?: string;
    skip: number;
    limit: number;
  }): Promise<{ items: IItem[]; total: number }> {
    await connectToDatabase();
    
    const filter: {
      deletedAt: null | Date;
      category?: 'FOOD' | 'DRINK' | 'SNACK';
      $or?: Array<{
        name?: { $regex: string; $options: string };
        publicId?: { $regex: string; $options: string };
      }>;
    } = { deletedAt: null };
    
    if (options.category) {
      filter.category = options.category as 'FOOD' | 'DRINK' | 'SNACK';
    }
    
    if (options.search) {
      filter.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { publicId: { $regex: options.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      Item.find(filter)
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(options.skip)
        .limit(options.limit)
        .lean(),
      Item.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async findById(id: string): Promise<IItem | null> {
    await connectToDatabase();
    const filter = mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)
      ? { $or: [{ _id: id }, { publicId: id }], deletedAt: null }
      : { publicId: id, deletedAt: null };
    return Item.findOne(filter).lean();
  }

  static async findByPublicId(publicId: string): Promise<IItem | null> {
    await connectToDatabase();
    return Item.findOne({ publicId, deletedAt: null }).lean();
  }

  static async findByName(name: string): Promise<IItem | null> {
    await connectToDatabase();
    return Item.findOne({ name, deletedAt: null }).collation({ locale: 'en', strength: 2 }).lean();
  }

  static async create(data: Partial<IItem>): Promise<IItem> {
    await connectToDatabase();
    const item = new Item(data);
    return item.save();
  }

  static async update(id: string, data: Partial<IItem>): Promise<IItem | null> {
    await connectToDatabase();
    const filter = mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)
      ? { $or: [{ _id: id }, { publicId: id }], deletedAt: null }
      : { publicId: id, deletedAt: null };
    return Item.findOneAndUpdate(filter, data, { new: true }).lean();
  }

  static async deactivate(id: string): Promise<IItem | null> {
    await connectToDatabase();
    const filter = mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)
      ? { $or: [{ _id: id }, { publicId: id }], deletedAt: null }
      : { publicId: id, deletedAt: null };
    return Item.findOneAndUpdate(
      filter,
      { deletedAt: new Date(), isActive: false },
      { new: true }
    ).lean();
  }

  static async count(): Promise<number> {
    await connectToDatabase();
    return Item.countDocuments();
  }

  static async findNextPublicId(): Promise<string> {
    await connectToDatabase();
    const lastItem = await Item.findOne({}).sort({ publicId: -1 }).select('publicId').lean();
    let nextSeq = 1;
    if (lastItem && lastItem.publicId) {
      const match = lastItem.publicId.match(/\d+$/);
      if (match) {
        nextSeq = parseInt(match[0], 10) + 1;
      }
    }
    const count = await Item.countDocuments();
    nextSeq = Math.max(nextSeq, count + 1);
    return `KSP-ITEM-${String(nextSeq).padStart(4, '0')}`;
  }
}
