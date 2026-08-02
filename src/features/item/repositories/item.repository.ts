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
        .limit(options.limit),
      Item.countDocuments(filter),
    ]);

    return { items, total };
  }

  static async findById(id: string): Promise<IItem | null> {
    await connectToDatabase();
    return Item.findOne({ _id: id, deletedAt: null });
  }

  static async findByPublicId(publicId: string): Promise<IItem | null> {
    await connectToDatabase();
    return Item.findOne({ publicId, deletedAt: null });
  }

  static async findByName(name: string): Promise<IItem | null> {
    await connectToDatabase();
    return Item.findOne({ name, deletedAt: null }).collation({ locale: 'en', strength: 2 });
  }

  static async create(data: Partial<IItem>): Promise<IItem> {
    await connectToDatabase();
    const item = new Item(data);
    return item.save();
  }

  static async update(id: string, data: Partial<IItem>): Promise<IItem | null> {
    await connectToDatabase();
    return Item.findOneAndUpdate({ _id: id, deletedAt: null }, data, { new: true });
  }

  static async deactivate(id: string): Promise<IItem | null> {
    await connectToDatabase();
    return Item.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date(), isActive: false },
      { new: true }
    );
  }

  static async count(): Promise<number> {
    await connectToDatabase();
    return Item.countDocuments();
  }
}
