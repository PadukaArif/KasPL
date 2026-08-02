import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import { CheckoutPayload, CheckoutSuccessData } from '../types/transaction.types';
import { checkoutPayloadSchema } from '../validators/transaction.validator';
import { SessionService } from '@/features/session/services/session.service';
import { InventoryRepository } from '@/features/inventory/repositories/inventory.repository';
import { CounterRepository } from '../repositories/counter.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ActivityLogRepository } from '../repositories/activityLog.repository';
import { ServiceError } from '@/utils/errors';
import { ITransaction } from '../models/transaction.model';
import { ITransactionDetail } from '../models/transactionDetail.model';

export class TransactionService {
  static async checkout(payload: CheckoutPayload) {
    // 1. Zod Validation
    const parsedData = checkoutPayloadSchema.parse(payload);

    // 2. Validate Session
    const activeSession = await SessionService.getActiveSession();
    if (!activeSession) {
      throw new ServiceError('Tidak ada sesi penjualan yang aktif.', 'NO_ACTIVE_SESSION');
    }

    // Prepare variables for MongoDB transaction
    const businessDateStr = parsedData.businessDate.replace(/-/g, '');
    let result: CheckoutSuccessData | null = null;

    // Start MongoDB Session
    await connectToDatabase();
    const session = await mongoose.startSession();
    
    try {
      await session.withTransaction(async () => {
        let totalItems = 0;
        let totalQuantity = 0;
        let grossRevenue = 0;
        let grossCost = 0;

        const detailsData: Array<Partial<ITransactionDetail>> = [];

        // 3. Process Cart Items (Locking and validating inventory)
        for (const cartItem of parsedData.cart) {
          // Find and lock the inventory document
          const inventory = await InventoryRepository.findById(cartItem.inventoryId, session);
          if (!inventory) {
            throw new ServiceError(`Inventory ID ${cartItem.inventoryId} tidak ditemukan.`, 'INVENTORY_NOT_FOUND');
          }
          if (inventory.status === 'CLOSED') {
            throw new ServiceError(`Sesi untuk inventory ${inventory.itemNameSnapshot} sudah ditutup.`, 'CHECKOUT_FAILED');
          }
          if (inventory.remainingStock < cartItem.quantity) {
            throw new ServiceError(`Stok tidak cukup untuk ${inventory.itemNameSnapshot}.`, 'OUT_OF_STOCK');
          }

          // Calculate subtotals based on backend snapshot
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

          // Update stock atomically inside the transaction
          await InventoryRepository.updateRemainingStock(cartItem.inventoryId, cartItem.quantity, session);
        }

        const grossProfit = grossRevenue - grossCost;

        // 4. Generate Transaction Number using Counter
        const seq = await CounterRepository.getNextSequence('TRX', businessDateStr, session);
        const transactionPublicId = `TRX-${businessDateStr}-${String(seq).padStart(6, '0')}`;

        // 5. Check if it's the first transaction
        // Actually, locking inventory can be done unconditionally or by checking if the session was just created.
        // The business rule says: "If first transaction, Lock Daily Inventory".
        // Instead of querying transactions (which might be slow), we can simply call lockInventory.
        // It updates `OPEN` to `LOCKED`. If they are already `LOCKED`, it does nothing.
        await InventoryRepository.lockInventory(activeSession.id, session);

        // 6. Create Transaction Header
        const headerData: Partial<ITransaction> = {
          publicId: transactionPublicId,
          version: 1,
          businessDate: parsedData.businessDate,
          periodMonth: activeSession.periodMonth,
          periodWeek: activeSession.periodWeek,
          sessionId: new mongoose.Types.ObjectId(activeSession.id),
          sessionPublicId: activeSession.publicId,
          cashierMemberId: activeSession.guardians[0].publicId, // Fallback to first guardian if no explicit cashier
          cashierName: activeSession.guardians[0].name,
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

        // 7. Write to DB
        const txResult = await TransactionRepository.createTransaction(headerData, detailsData, session);

        // 8. Write Activity Logs
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
}
