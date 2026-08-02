import { InventoryRepository } from '../repositories/inventory.repository';
import { ItemRepository } from '@/features/item/repositories/item.repository';
import { SessionRepository } from '@/features/session/repositories/session.repository';
import { ActivityLogService } from '@/features/activityLog/services/activityLog.service';
import { initializeInventorySchema, updateOpeningStockSchema, InitializeInventoryInput, UpdateOpeningStockInput } from '../validators/inventory.validator';

export class InventoryServiceError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, InventoryServiceError.prototype);
  }
}

export class InventoryService {
  static async getInventoryBySession(sessionId: string) {
    const records = await InventoryRepository.findAllBySession(sessionId);
    return records.map((r) => ({
      id: r._id.toString(),
      publicId: r.publicId,
      sessionId: r.sessionId.toString(),
      itemId: r.itemId.toString(),
      itemPublicId: r.itemPublicId,
      itemNameSnapshot: r.itemNameSnapshot,
      categorySnapshot: r.categorySnapshot,
      costPriceSnapshot: r.costPriceSnapshot,
      sellingPriceSnapshot: r.sellingPriceSnapshot,
      displayOrderSnapshot: r.displayOrderSnapshot,
      openingStock: r.openingStock,
      remainingStock: r.remainingStock,
      soldQuantity: r.soldQuantity,
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  static async initializeInventory(data: InitializeInventoryInput) {
    // 1. Zod Validation
    const parsed = initializeInventorySchema.parse(data);

    // 2. Validate Session
    const activeSession = await SessionRepository.findActiveSession();
    if (!activeSession || activeSession._id.toString() !== parsed.sessionId) {
      throw new InventoryServiceError('Tidak ada sesi penjualan aktif yang cocok.', 'NO_ACTIVE_SESSION');
    }

    // 3. Prevent Duplicate Initialization
    const exists = await InventoryRepository.existsBySession(parsed.sessionId);
    if (exists) {
      throw new InventoryServiceError('Persiapan stock hari ini sudah diinisialisasi.', 'INVENTORY_ALREADY_INITIALIZED');
    }

    // 4. Load Active Items from Master Item
    const { items } = await ItemRepository.findAll({ skip: 0, limit: 1000 });
    const activeItems = items.filter((item) => item.isActive);

    if (activeItems.length === 0) {
      throw new InventoryServiceError('Tidak ada master barang aktif yang dapat diinisialisasi.', 'VALIDATION_ERROR');
    }

    // Create a map for easy lookup
    const activeItemsMap = new Map(activeItems.map((item) => [item._id.toString(), item]));

    // 5. Generate Snapshot and validate inputs
    const count = await InventoryRepository.count();
    let currentSeq = count;

    const inventoriesToCreate = [];

    for (const inputItem of parsed.items) {
      const masterItem = activeItemsMap.get(inputItem.itemId);
      if (!masterItem) {
        throw new InventoryServiceError(`Barang dengan ID ${inputItem.itemId} tidak ditemukan atau tidak aktif.`, 'VALIDATION_ERROR');
      }

      currentSeq++;
      const publicId = `KSP-INV-${String(currentSeq).padStart(6, '0')}`;

      inventoriesToCreate.push({
        publicId,
        sessionId: activeSession._id as import('mongoose').Types.ObjectId,
        itemId: masterItem._id as import('mongoose').Types.ObjectId,
        itemPublicId: masterItem.publicId,
        itemNameSnapshot: masterItem.name,
        categorySnapshot: masterItem.category,
        costPriceSnapshot: masterItem.costPrice,
        sellingPriceSnapshot: masterItem.sellingPrice,
        displayOrderSnapshot: masterItem.displayOrder,
        openingStock: inputItem.openingStock,
        remainingStock: inputItem.openingStock,
        soldQuantity: 0,
        status: 'OPEN' as const,
      });
    }

    // 6. Save
    const created = await InventoryRepository.createMany(inventoriesToCreate);

    // 7. Activity Log
    await ActivityLogService.log('INITIALIZE_DAILY_INVENTORY', {
      sessionId: parsed.sessionId,
      itemCount: created.length,
    });

    return created;
  }

  static async updateOpeningStock(id: string, data: UpdateOpeningStockInput) {
    // 1. Zod Validation
    const parsed = updateOpeningStockSchema.parse(data);

    // 2. Fetch inventory
    const inventory = await InventoryRepository.findById(id);
    if (!inventory) {
      throw new InventoryServiceError('Data inventory tidak ditemukan.', 'INVENTORY_NOT_FOUND');
    }

    // 3. Lock Rule
    if (inventory.status === 'LOCKED' || inventory.status === 'CLOSED') {
      throw new InventoryServiceError('Opening stock tidak dapat diubah karena inventory sudah dikunci atau ditutup.', 'INVENTORY_LOCKED');
    }

    // 4. Update
    const updated = await InventoryRepository.updateOpeningStock(id, parsed.openingStock);

    // 5. Activity Log
    if (updated) {
      await ActivityLogService.log('UPDATE_OPENING_STOCK', {
        inventoryId: id,
        itemPublicId: updated.itemPublicId,
        oldOpeningStock: inventory.openingStock,
        newOpeningStock: parsed.openingStock,
      });
    }

    return updated;
  }

  static async lockInventory(sessionId: string) {
    const exists = await InventoryRepository.existsBySession(sessionId);
    if (!exists) {
      throw new InventoryServiceError('Data inventory tidak ditemukan untuk sesi ini.', 'INVENTORY_NOT_FOUND');
    }

    await InventoryRepository.lockInventory(sessionId);

    await ActivityLogService.log('LOCK_DAILY_INVENTORY', {
      sessionId,
    });
  }

  static async closeInventory(sessionId: string) {
    const exists = await InventoryRepository.existsBySession(sessionId);
    if (!exists) {
      throw new InventoryServiceError('Data inventory tidak ditemukan untuk sesi ini.', 'INVENTORY_NOT_FOUND');
    }

    await InventoryRepository.closeInventory(sessionId);

    await ActivityLogService.log('CLOSE_DAILY_INVENTORY', {
      sessionId,
    });
  }
}
