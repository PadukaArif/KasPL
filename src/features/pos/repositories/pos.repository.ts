import { DailyInventory } from '@/features/inventory/models/inventory.model';
import { Types } from 'mongoose';
import { POSItemSnapshot } from '../types/pos.types';

export class POSRepository {
  /**
   * Fetch all sellable inventory items for a given session.
   * Only returns items with remainingStock > 0? No, let's return all items
   * that are in the session, and the UI can handle if it's out of stock.
   */
  static async getSellableItems(sessionId: string): Promise<POSItemSnapshot[]> {
    const inventoryItems = await DailyInventory.find({
      sessionId: new Types.ObjectId(sessionId),
    }).sort({ displayOrderSnapshot: 1 }).lean();

    return inventoryItems.map((item) => ({
      id: item._id.toString(),
      publicId: item.publicId,
      itemId: item.itemId.toString(),
      itemPublicId: item.itemPublicId,
      itemName: item.itemNameSnapshot,
      category: item.categorySnapshot,
      sellingPrice: item.sellingPriceSnapshot,
      remainingStock: item.remainingStock,
    }));
  }
}
