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
  static async syncInventory(sessionId: string) {
    const existingRecords = await InventoryRepository.findAllBySession(sessionId);
    if (!existingRecords || existingRecords.length === 0) {
      return [];
    }

    const existingItemIds = new Set(existingRecords.map((r) => r.itemId.toString()));
    const existingItemPublicIds = new Set(existingRecords.map((r) => r.itemPublicId));

    let sessionStatus: 'OPEN' | 'LOCKED' | 'CLOSED' = 'OPEN';
    if (existingRecords.some((r) => r.status === 'CLOSED')) {
      sessionStatus = 'CLOSED';
    } else if (existingRecords.some((r) => r.status === 'LOCKED')) {
      sessionStatus = 'LOCKED';
    }

    const recordsNeedingStatusUpdate = existingRecords.filter((r) => r.status !== sessionStatus);
    if (recordsNeedingStatusUpdate.length > 0) {
      if (sessionStatus === 'LOCKED') {
        await InventoryRepository.lockInventory(sessionId);
      } else if (sessionStatus === 'CLOSED') {
        await InventoryRepository.closeInventory(sessionId);
      }
    }

    const { items } = await ItemRepository.findAll({ skip: 0, limit: 1000 });
    const activeMasterItems = items.filter((item) => item.isActive);

    const missingMasterItems = activeMasterItems.filter(
      (item) => !existingItemIds.has(item._id.toString()) && !existingItemPublicIds.has(item.publicId)
    );

    if (missingMasterItems.length > 0) {
      let currentSeq = await InventoryRepository.findNextPublicIdSequence();
      const sessionObjectId = existingRecords[0].sessionId;

      const newInventories = missingMasterItems.map((masterItem) => {
        const publicId = `KSP-INV-${String(currentSeq).padStart(6, '0')}`;
        currentSeq++;

        return {
          publicId,
          sessionId: sessionObjectId,
          itemId: masterItem._id as import('mongoose').Types.ObjectId,
          itemPublicId: masterItem.publicId,
          itemNameSnapshot: masterItem.name,
          categorySnapshot: masterItem.category,
          costPriceSnapshot: masterItem.costPrice,
          sellingPriceSnapshot: masterItem.sellingPrice,
          displayOrderSnapshot: masterItem.displayOrder,
          openingStock: masterItem.recommendedStock,
          remainingStock: masterItem.recommendedStock,
          soldQuantity: 0,
          status: sessionStatus,
        };
      });

      await InventoryRepository.createMany(newInventories);

      await ActivityLogService.log('SYNC_DAILY_INVENTORY', {
        sessionId,
        syncedItemCount: newInventories.length,
        items: newInventories.map((i) => i.itemNameSnapshot),
      });
    }

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

  static async getInventoryBySession(sessionId: string) {
    return this.syncInventory(sessionId);
  }

  static async initializeInventory(data: InitializeInventoryInput) {
    // 1. Zod Validation
    const parsed = initializeInventorySchema.parse(data);

    // 2. Validate Session
    const activeSession = await SessionRepository.findActiveSession();
    if (!activeSession || (activeSession._id.toString() !== parsed.sessionId && activeSession.publicId !== parsed.sessionId)) {
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
    let currentSeq = await InventoryRepository.findNextPublicIdSequence();

    const inventoriesToCreate = [];

    for (const inputItem of parsed.items) {
      const masterItem = activeItemsMap.get(inputItem.itemId) || activeItems.find((i) => i.publicId === inputItem.itemId);
      if (!masterItem) {
        throw new InventoryServiceError(`Barang dengan ID ${inputItem.itemId} tidak ditemukan atau tidak aktif.`, 'VALIDATION_ERROR');
      }

      const publicId = `KSP-INV-${String(currentSeq).padStart(6, '0')}`;
      currentSeq++;

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
        status: 'LOCKED' as const,
      });
    }

    // 6. Save
    const created = await InventoryRepository.createMany(inventoriesToCreate);

    // 7. Activity Log
    await ActivityLogService.log('INITIALIZE_DAILY_INVENTORY', {
      sessionId: parsed.sessionId,
      itemCount: created.length,
    });

    return created.map((rec) => ({
      id: rec._id.toString(),
      publicId: rec.publicId,
      sessionId: rec.sessionId.toString(),
      itemId: rec.itemId.toString(),
      itemPublicId: rec.itemPublicId,
      itemNameSnapshot: rec.itemNameSnapshot,
      categorySnapshot: rec.categorySnapshot,
      costPriceSnapshot: rec.costPriceSnapshot,
      sellingPriceSnapshot: rec.sellingPriceSnapshot,
      displayOrderSnapshot: rec.displayOrderSnapshot,
      openingStock: rec.openingStock,
      remainingStock: rec.remainingStock,
      soldQuantity: rec.soldQuantity,
      status: rec.status,
      createdAt: rec.createdAt,
    }));
  }

  static async updateOpeningStock(id: string, data: UpdateOpeningStockInput) {
    if (!id || id.length !== 24) {
      throw new InventoryServiceError('Data inventory tidak ditemukan.', 'INVENTORY_NOT_FOUND');
    }

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

    const sessionRecords = await InventoryRepository.findAllBySession(inventory.sessionId.toString());
    const isAnyLockedOrClosed = sessionRecords.some((r) => r.status === 'LOCKED' || r.status === 'CLOSED');
    if (isAnyLockedOrClosed) {
      throw new InventoryServiceError('Opening stock tidak dapat diubah karena inventory sesi ini sudah dikunci atau ditutup.', 'INVENTORY_LOCKED');
    }

    // 4. Update
    const updated = await InventoryRepository.updateOpeningStock(id, parsed.openingStock);
    if (!updated) {
      throw new InventoryServiceError('Data inventory tidak ditemukan.', 'INVENTORY_NOT_FOUND');
    }

    // 5. Activity Log
    await ActivityLogService.log('UPDATE_OPENING_STOCK', {
      inventoryId: id,
      itemPublicId: updated.itemPublicId,
      oldOpeningStock: inventory.openingStock,
      newOpeningStock: parsed.openingStock,
    });

    return {
      id: updated._id.toString(),
      publicId: updated.publicId,
      sessionId: updated.sessionId.toString(),
      itemId: updated.itemId.toString(),
      itemPublicId: updated.itemPublicId,
      itemNameSnapshot: updated.itemNameSnapshot,
      categorySnapshot: updated.categorySnapshot,
      costPriceSnapshot: updated.costPriceSnapshot,
      sellingPriceSnapshot: updated.sellingPriceSnapshot,
      displayOrderSnapshot: updated.displayOrderSnapshot,
      openingStock: updated.openingStock,
      remainingStock: updated.remainingStock,
      soldQuantity: updated.soldQuantity,
      status: updated.status,
      createdAt: updated.createdAt,
    };
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
