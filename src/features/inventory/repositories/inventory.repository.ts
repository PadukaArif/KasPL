import { ClientSession } from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import { DailyInventory, IDailyInventory } from '../models/inventory.model';

export class InventoryRepository {
  static async findBySession(sessionId: string): Promise<IDailyInventory | null> {
    await connectToDatabase();
    return DailyInventory.findOne({ sessionId });
  }

  static async findByItem(sessionId: string, itemId: string): Promise<IDailyInventory | null> {
    await connectToDatabase();
    return DailyInventory.findOne({ sessionId, itemId });
  }

  static async findById(id: string, session?: ClientSession): Promise<IDailyInventory | null> {
    await connectToDatabase();
    return DailyInventory.findById(id).session(session || null);
  }

  static async findAllBySession(sessionId: string): Promise<IDailyInventory[]> {
    await connectToDatabase();
    return DailyInventory.find({ sessionId }).sort({ displayOrderSnapshot: 1 });
  }

  static async createMany(data: Array<Partial<IDailyInventory>>): Promise<IDailyInventory[]> {
    await connectToDatabase();
    const result = await DailyInventory.insertMany(data);
    return result as unknown as IDailyInventory[];
  }

  static async updateOpeningStock(id: string, openingStock: number): Promise<IDailyInventory | null> {
    await connectToDatabase();
    return DailyInventory.findByIdAndUpdate(
      id,
      { openingStock, remainingStock: openingStock },
      { new: true }
    );
  }

  static async updateRemainingStock(
    id: string,
    quantityToDeduct: number,
    session: ClientSession
  ): Promise<IDailyInventory | null> {
    await connectToDatabase();
    return DailyInventory.findByIdAndUpdate(
      id,
      {
        $inc: {
          remainingStock: -quantityToDeduct,
          soldQuantity: quantityToDeduct,
        },
      },
      { new: true, session }
    );
  }

  static async lockInventory(sessionId: string, session?: ClientSession): Promise<void> {
    await connectToDatabase();
    await DailyInventory.updateMany({ sessionId, status: 'OPEN' }, { status: 'LOCKED' }, { session });
  }

  static async closeInventory(sessionId: string): Promise<void> {
    await connectToDatabase();
    await DailyInventory.updateMany({ sessionId, status: { $ne: 'CLOSED' } }, { status: 'CLOSED' });
  }

  static async existsBySession(sessionId: string): Promise<boolean> {
    await connectToDatabase();
    const count = await DailyInventory.countDocuments({ sessionId });
    return count > 0;
  }

  static async count(): Promise<number> {
    await connectToDatabase();
    return DailyInventory.countDocuments();
  }
}
