import mongoose, { ClientSession } from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import { DailyInventory, IDailyInventory } from '../models/inventory.model';
import { SellingSession } from '@/features/session/models/session.model';

async function resolveSessionId(sessionId: string | mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId | string> {
  if (!sessionId) return new mongoose.Types.ObjectId();
  if (sessionId instanceof mongoose.Types.ObjectId) return sessionId;
  if (typeof sessionId === 'string' && mongoose.Types.ObjectId.isValid(sessionId) && /^[0-9a-fA-F]{24}$/.test(sessionId)) {
    return new mongoose.Types.ObjectId(sessionId);
  }
  const s = await SellingSession.findOne({ publicId: sessionId }).select('_id').lean();
  return s ? s._id : new mongoose.Types.ObjectId();
}

export class InventoryRepository {
  static async findBySession(sessionId: string): Promise<IDailyInventory | null> {
    await connectToDatabase();
    const resolvedSessionId = await resolveSessionId(sessionId);
    return DailyInventory.findOne({ sessionId: resolvedSessionId }).lean();
  }

  static async findByItem(sessionId: string, itemId: string): Promise<IDailyInventory | null> {
    await connectToDatabase();
    const resolvedSessionId = await resolveSessionId(sessionId);
    const itemQuery = mongoose.Types.ObjectId.isValid(itemId)
      ? { $or: [{ itemId }, { itemPublicId: itemId }] }
      : { itemPublicId: itemId };
    return DailyInventory.findOne({ sessionId: resolvedSessionId, ...itemQuery }).lean();
  }

  static async findById(id: string, session?: ClientSession): Promise<IDailyInventory | null> {
    await connectToDatabase();
    const filter = mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)
      ? { $or: [{ _id: id }, { publicId: id }] }
      : { publicId: id };
    return DailyInventory.findOne(filter).session(session || null);
  }

  static async findManyByIds(ids: string[], session?: ClientSession): Promise<IDailyInventory[]> {
    await connectToDatabase();
    const objectIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id)).map((id) => new mongoose.Types.ObjectId(id));
    return DailyInventory.find({
      $or: [
        { _id: { $in: objectIds } },
        { publicId: { $in: ids } },
      ],
    }).session(session || null);
  }

  static async findAllBySession(sessionId: string): Promise<IDailyInventory[]> {
    await connectToDatabase();
    const resolvedSessionId = await resolveSessionId(sessionId);
    return DailyInventory.find({ sessionId: resolvedSessionId }).sort({ displayOrderSnapshot: 1, itemPublicId: 1 }).lean();
  }

  static async createMany(data: Array<Partial<IDailyInventory>>): Promise<IDailyInventory[]> {
    await connectToDatabase();
    const result = await DailyInventory.insertMany(data);
    return result as unknown as IDailyInventory[];
  }

  static async updateOpeningStock(id: string, openingStock: number): Promise<IDailyInventory | null> {
    await connectToDatabase();
    const filter = mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id)
      ? { $or: [{ _id: id }, { publicId: id }] }
      : { publicId: id };
    return DailyInventory.findOneAndUpdate(
      filter,
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
    const filter = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { publicId: id };
    return DailyInventory.findOneAndUpdate(
      filter,
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
    const resolvedSessionId = await resolveSessionId(sessionId);
    await DailyInventory.updateMany({ sessionId: resolvedSessionId, status: { $ne: 'CLOSED' } }, { status: 'LOCKED' }, { session });
  }

  static async closeInventory(sessionId: string): Promise<void> {
    await connectToDatabase();
    const resolvedSessionId = await resolveSessionId(sessionId);
    await DailyInventory.updateMany({ sessionId: resolvedSessionId, status: { $ne: 'CLOSED' } }, { status: 'CLOSED' });
  }

  static async existsBySession(sessionId: string): Promise<boolean> {
    await connectToDatabase();
    const resolvedSessionId = await resolveSessionId(sessionId);
    const count = await DailyInventory.countDocuments({ sessionId: resolvedSessionId });
    return count > 0;
  }

  static async count(): Promise<number> {
    await connectToDatabase();
    return DailyInventory.countDocuments();
  }

  static async findNextPublicIdSequence(): Promise<number> {
    await connectToDatabase();
    const lastItem = await DailyInventory.findOne({}).sort({ publicId: -1 }).select('publicId').lean();
    let nextSeq = 1;
    if (lastItem && lastItem.publicId) {
      const match = lastItem.publicId.match(/\d+$/);
      if (match) {
        nextSeq = parseInt(match[0], 10) + 1;
      }
    }
    const count = await DailyInventory.countDocuments();
    return Math.max(nextSeq, count + 1);
  }
}
