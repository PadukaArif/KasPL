import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import { CheckoutPayload, CheckoutSuccessData } from '../types/transaction.types';
import { checkoutPayloadSchema } from '../validators/transaction.validator';
import { SessionService } from '@/features/session/services/session.service';
import { InventoryRepository } from '@/features/inventory/repositories/inventory.repository';
import { CounterRepository } from '../repositories/counter.repository';
import { TransactionRepository, TransactionQueryFilters } from '../repositories/transaction.repository';
import { ActivityLogRepository } from '../repositories/activityLog.repository';
import { ServiceError } from '@/utils/errors';
import { IDailyInventory } from '@/features/inventory/models/inventory.model';
import { ITransaction, Transaction } from '../models/transaction.model';
import { ITransactionDetail } from '../models/transactionDetail.model';

export class TransactionService {
  static async checkout(payload: CheckoutPayload) {
    const parsedData = checkoutPayloadSchema.parse(payload);

    const activeSession = await SessionService.getActiveSession();
    if (!activeSession) {
      throw new ServiceError('Tidak ada sesi penjualan yang aktif.', 'NO_ACTIVE_SESSION');
    }

    const businessDateStr = parsedData.businessDate.replace(/-/g, '');
    let result: CheckoutSuccessData | null = null;

    await connectToDatabase();
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        let totalItems = 0;
        let totalQuantity = 0;
        let grossRevenue = 0;
        let grossCost = 0;

        const detailsData: Array<Partial<ITransactionDetail>> = [];

        // Pre-fetch all cart inventory items in a single query
        const inventoryIds = parsedData.cart.map((c) => c.inventoryId);
        const inventories = await InventoryRepository.findManyByIds(inventoryIds, session);
        const inventoryMap = new Map<string, IDailyInventory>();
        inventories.forEach((inv) => {
          inventoryMap.set((inv._id as mongoose.Types.ObjectId).toString(), inv);
          if (inv.publicId) inventoryMap.set(inv.publicId, inv);
        });

        for (const cartItem of parsedData.cart) {
          const inventory = inventoryMap.get(cartItem.inventoryId);
          if (!inventory) {
            throw new ServiceError(`Inventory ID ${cartItem.inventoryId} tidak ditemukan.`, 'INVENTORY_NOT_FOUND');
          }
          if (inventory.status === 'CLOSED') {
            throw new ServiceError(`Sesi untuk inventory ${inventory.itemNameSnapshot} sudah ditutup.`, 'CHECKOUT_FAILED');
          }
          if (inventory.remainingStock < cartItem.quantity) {
            throw new ServiceError(`Stok tidak cukup untuk ${inventory.itemNameSnapshot}.`, 'OUT_OF_STOCK');
          }

          const subtotalRevenue = inventory.sellingPriceSnapshot * cartItem.quantity;
          const subtotalCost = inventory.costPriceSnapshot * cartItem.quantity;
          const subtotalProfit = subtotalRevenue - subtotalCost;

          detailsData.push({
            inventoryId: inventory._id as mongoose.Types.ObjectId,
            itemId: inventory.itemId,
            itemPublicId: inventory.itemPublicId,
            itemNameSnapshot: inventory.itemNameSnapshot,
            categorySnapshot: inventory.categorySnapshot,
            costPriceSnapshot: inventory.costPriceSnapshot,
            sellingPriceSnapshot: inventory.sellingPriceSnapshot,
            quantity: cartItem.quantity,
            subtotalRevenue,
            subtotalCost,
            subtotalProfit,
          });

          totalItems += 1;
          totalQuantity += cartItem.quantity;
          grossRevenue += subtotalRevenue;
          grossCost += subtotalCost;

          await InventoryRepository.updateRemainingStock(cartItem.inventoryId, cartItem.quantity, session);
        }

        const grossProfit = grossRevenue - grossCost;

        const seq = await CounterRepository.getNextSequence('TRX', businessDateStr, session);
        const transactionPublicId = `TRX-${businessDateStr}-${String(seq).padStart(6, '0')}`;

        await InventoryRepository.lockInventory(activeSession.id, session);

        const cashier = activeSession.guardians && activeSession.guardians[0];
        const cashierMemberId = cashier?.publicId || '';
        const cashierName = cashier?.name || 'Penjaga Sesi';

        const headerData: Partial<ITransaction> = {
          publicId: transactionPublicId,
          version: 1,
          businessDate: parsedData.businessDate,
          periodMonth: activeSession.periodMonth,
          periodWeek: activeSession.periodWeek,
          sessionId: new mongoose.Types.ObjectId(activeSession.id),
          sessionPublicId: activeSession.publicId,
          cashierMemberId,
          cashierName,
          guardianMemberIds: activeSession.guardians.map(g => g.publicId),
          guardianNames: activeSession.guardians.map(g => g.name),
          paymentMethod: 'CASH',
          totalItems,
          totalQuantity,
          grossRevenue,
          grossCost,
          grossProfit,
          netProfit: grossProfit,
          status: 'SUCCESS',
        };

        const txResult = await TransactionRepository.createTransaction(headerData, detailsData, session);

        await ActivityLogRepository.log({
          action: 'CREATE_TRANSACTION',
          entity: 'Transaction',
          entityId: txResult.header._id.toString(),
          performedBy: activeSession.guardians[0].name,
          sessionId: new mongoose.Types.ObjectId(activeSession.id),
          after: { transactionPublicId },
        }, session);

        result = {
          transactionId: txResult.header._id.toString(),
          transactionNumber: transactionPublicId,
          businessDate: parsedData.businessDate,
          totalItems,
          totalQuantity,
          grossRevenue,
          grossCost,
          grossProfit,
          netProfit: grossProfit,
        };
      });
    } finally {
      await session.endSession();
    }

    return result;
  }

  static async getTransactions(filters: TransactionQueryFilters) {
    return TransactionRepository.findPaginated(filters);
  }

  static async getTransactionDetail(idOrPublicId: string) {
    await connectToDatabase();
    let header = null;
    if (mongoose.Types.ObjectId.isValid(idOrPublicId)) {
      header = await Transaction.findById(idOrPublicId).lean();
    }
    if (!header) {
      header = await Transaction.findOne({ publicId: idOrPublicId }).lean();
    }
    if (!header) {
      throw new ServiceError('Transaksi tidak ditemukan', 'NOT_FOUND');
    }

    const details = await TransactionRepository.getDetailsByTransactionId(header._id.toString());
    return { header, details };
  }
}
