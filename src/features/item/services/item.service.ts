import { ItemRepository } from '../repositories/item.repository';
import { createItemSchema, updateItemSchema, CreateItemInput, UpdateItemInput } from '../validators/item.validator';
import { ActivityLogService } from '@/features/activityLog/services/activityLog.service';

export class ItemServiceError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    Object.setPrototypeOf(this, ItemServiceError.prototype);
  }
}

export class ItemService {
  static async getItems(options: { search?: string; category?: string; page: number; limit: number }) {
    const skip = (options.page - 1) * options.limit;
    const { items, total } = await ItemRepository.findAll({
      search: options.search,
      category: options.category,
      skip,
      limit: options.limit,
    });

    return {
      items: items.map((item) => ({
        id: item._id.toString(),
        publicId: item.publicId,
        name: item.name,
        category: item.category,
        costPrice: item.costPrice,
        sellingPrice: item.sellingPrice,
        recommendedStock: item.recommendedStock,
        displayOrder: item.displayOrder,
        isActive: item.isActive,
        createdAt: item.createdAt,
      })),
      total,
      page: options.page,
      limit: options.limit,
    };
  }

  static async getItemById(id: string) {
    if (!id) {
      throw new ItemServiceError('Item tidak ditemukan', 'ITEM_NOT_FOUND');
    }
    const item = await ItemRepository.findById(id);
    if (!item) {
      throw new ItemServiceError('Item tidak ditemukan', 'ITEM_NOT_FOUND');
    }
    return {
      id: item._id.toString(),
      publicId: item.publicId,
      name: item.name,
      category: item.category,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      recommendedStock: item.recommendedStock,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    };
  }

  static async createItem(data: CreateItemInput) {
    // 1. Zod Validation
    const parsed = createItemSchema.parse(data);

    // 2. Duplicate checking (ignores case/spaces)
    const normalizedName = parsed.name.trim();
    const existing = await ItemRepository.findByName(normalizedName);
    if (existing) {
      throw new ItemServiceError('Barang dengan nama tersebut sudah terdaftar', 'ITEM_ALREADY_EXISTS');
    }

    // 3. Generate public ID safely
    const publicId = await ItemRepository.findNextPublicId();

    // 4. Save
    const item = await ItemRepository.create({
      ...parsed,
      publicId,
    });

    // 5. Activity Log
    await ActivityLogService.log('CREATE_ITEM', {
      itemId: item._id.toString(),
      publicId: item.publicId,
      name: item.name,
    });

    return {
      id: item._id.toString(),
      publicId: item.publicId,
      name: item.name,
      category: item.category,
      costPrice: item.costPrice,
      sellingPrice: item.sellingPrice,
      recommendedStock: item.recommendedStock,
      displayOrder: item.displayOrder,
      isActive: item.isActive,
      createdAt: item.createdAt,
    };
  }

  static async updateItem(id: string, data: UpdateItemInput) {
    if (!id) {
      throw new ItemServiceError('Item tidak ditemukan', 'ITEM_NOT_FOUND');
    }

    // 1. Zod Validation
    const parsed = updateItemSchema.parse(data);

    // 2. Fetch current item
    const current = await ItemRepository.findById(id);
    if (!current) {
      throw new ItemServiceError('Item tidak ditemukan', 'ITEM_NOT_FOUND');
    }

    // 3. Name duplicate checking if name changed
    if (parsed.name && parsed.name.trim().toLowerCase() !== current.name.toLowerCase()) {
      const normalizedName = parsed.name.trim();
      const existing = await ItemRepository.findByName(normalizedName);
      if (existing && existing._id.toString() !== current._id.toString()) {
        throw new ItemServiceError('Barang dengan nama tersebut sudah terdaftar', 'ITEM_ALREADY_EXISTS');
      }
    }

    // 4. Validate price relationships on update if updated
    const finalCostPrice = parsed.costPrice ?? current.costPrice;
    const finalSellingPrice = parsed.sellingPrice ?? current.sellingPrice;
    if (finalSellingPrice < finalCostPrice) {
      throw new ItemServiceError('Harga jual tidak boleh lebih kecil dari harga modal', 'INVALID_PRICE');
    }

    // 5. Update
    const updated = await ItemRepository.update(current._id.toString(), parsed);
    if (!updated) {
      throw new ItemServiceError('Item tidak ditemukan', 'ITEM_NOT_FOUND');
    }

    // 6. Activity Log
    await ActivityLogService.log('UPDATE_ITEM', {
      itemId: updated._id.toString(),
      publicId: updated.publicId,
      changes: parsed,
    });

    return {
      id: updated._id.toString(),
      publicId: updated.publicId,
      name: updated.name,
      category: updated.category,
      costPrice: updated.costPrice,
      sellingPrice: updated.sellingPrice,
      recommendedStock: updated.recommendedStock,
      displayOrder: updated.displayOrder,
      isActive: updated.isActive,
    };
  }

  static async deactivateItem(id: string) {
    if (!id) {
      throw new ItemServiceError('Item tidak ditemukan', 'ITEM_NOT_FOUND');
    }

    const current = await ItemRepository.findById(id);
    if (!current) {
      throw new ItemServiceError('Item tidak ditemukan', 'ITEM_NOT_FOUND');
    }

    const deactivated = await ItemRepository.deactivate(current._id.toString());
    if (!deactivated) {
      throw new ItemServiceError('Item tidak ditemukan', 'ITEM_NOT_FOUND');
    }

    // Activity Log
    await ActivityLogService.log('DEACTIVATE_ITEM', {
      itemId: deactivated._id.toString(),
      publicId: deactivated.publicId,
      name: deactivated.name,
    });

    return {
      id: deactivated._id.toString(),
      publicId: deactivated.publicId,
      name: deactivated.name,
      isActive: deactivated.isActive,
      deletedAt: deactivated.deletedAt,
    };
  }
}
