import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import { SellingSession } from '@/features/session/models/session.model';
import { Transaction } from '@/features/transaction/models/transaction.model';
import { Expense } from '@/features/expense/models/expense.model';
import { DailyInventory } from '@/features/inventory/models/inventory.model';
import { InventoryRepository } from '@/features/inventory/repositories/inventory.repository';
import { ActivityLogService } from '@/features/activityLog/services/activityLog.service';
import { ClosingSessionData, ClosingSummary } from '../types/closing.types';
import { ServiceError } from '@/utils/errors';

export class ClosingService {
  static async calculateSummary(sessionId: string): Promise<ClosingSummary> {
    await connectToDatabase();

    // 1. Get Session
    const session = await SellingSession.findById(sessionId).select('_id publicId periodMonth periodWeek startDate endDate status guardians').lean();
    if (!session) {
      throw new ServiceError('Sesi tidak ditemukan', 'SESSION_NOT_FOUND');
    }

    // 2. Aggregate Transactions, Expenses, and Inventories in parallel via MongoDB pipelines
    const sessionObjId = session._id;

    const [txAgg, expAgg, invAgg] = await Promise.all([
      Transaction.aggregate([
        { $match: { sessionId: sessionObjId, status: 'SUCCESS' } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$grossRevenue' },
            cost: { $sum: '$grossCost' },
            grossProfit: { $sum: '$grossProfit' },
            itemsSold: { $sum: '$totalQuantity' },
            transactionsCount: { $sum: 1 },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { sessionId: sessionObjId, deletedAt: null } },
        {
          $group: {
            _id: null,
            expenseTotal: { $sum: '$amount' },
          },
        },
      ]),
      DailyInventory.aggregate([
        { $match: { sessionId: sessionObjId } },
        {
          $group: {
            _id: null,
            remainingStock: { $sum: '$remainingStock' },
          },
        },
      ]),
    ]);

    const revenue = txAgg[0]?.revenue || 0;
    const cost = txAgg[0]?.cost || 0;
    const grossProfit = txAgg[0]?.grossProfit || 0;
    const itemsSold = txAgg[0]?.itemsSold || 0;
    const transactionsCount = txAgg[0]?.transactionsCount || 0;

    const expenseTotal = expAgg[0]?.expenseTotal || 0;
    const remainingStock = invAgg[0]?.remainingStock || 0;

    // 5. Calculate Final Numbers
    const netProfit = grossProfit - expenseTotal;

    // School Share = 40% of netProfit (only if positive)
    // Class Share = 60% of netProfit (only if positive)
    const schoolShare = netProfit > 0 ? Math.round(netProfit * 0.4) : 0;
    const classShare = netProfit > 0 ? Math.round(netProfit * 0.6) : 0;

    return {
      revenue,
      cost,
      grossProfit,
      expense: expenseTotal,
      netProfit,
      itemsSold,
      transactionsCount,
      remainingStock,
      schoolShare,
      classShare,
      share: {
        schoolShare,
        classShare,
      },
    };
  }

  static async getSummary(sessionIdOrPublicId: string): Promise<ClosingSessionData> {
    await connectToDatabase();

    let session = null;
    if (mongoose.Types.ObjectId.isValid(sessionIdOrPublicId)) {
      session = await SellingSession.findById(sessionIdOrPublicId).populate('guardians');
    }
    if (!session) {
      session = await SellingSession.findOne({ publicId: sessionIdOrPublicId }).populate('guardians');
    }
    if (!session) {
      throw new ServiceError('Sesi tidak ditemukan', 'SESSION_NOT_FOUND');
    }

    const summary = await this.calculateSummary(session._id.toString());

    const guardians = (session.guardians || []).map((g: { publicId?: string; _id?: mongoose.Types.ObjectId; name?: string }) => ({
      publicId: g.publicId || g._id?.toString() || '',
      name: g.name || '',
    }));

    return {
      sessionId: session._id.toString(),
      sessionPublicId: session.publicId,
      periodMonth: session.periodMonth,
      periodWeek: session.periodWeek,
      startDate: session.startDate,
      endDate: session.endDate,
      status: session.status,
      guardians,
      summary,
    };
  }

  static async closeSession(sessionIdOrPublicId: string): Promise<{ summary: ClosingSummary }> {
    await connectToDatabase();

    let session = null;
    if (mongoose.Types.ObjectId.isValid(sessionIdOrPublicId)) {
      session = await SellingSession.findById(sessionIdOrPublicId);
    }
    if (!session) {
      session = await SellingSession.findOne({ publicId: sessionIdOrPublicId });
    }
    if (!session) {
      throw new ServiceError('Sesi tidak ditemukan', 'SESSION_NOT_FOUND');
    }
    if (session.status !== 'ACTIVE') {
      throw new ServiceError('Hanya sesi aktif yang dapat ditutup', 'SESSION_NOT_ACTIVE');
    }

    const summary = await this.calculateSummary(session._id.toString());

    session.status = 'CLOSED';
    session.set('closedAt', new Date());
    session.endDate = new Date();
    session.set('summary', summary);

    await session.save();

    await InventoryRepository.closeInventory(session._id.toString());

    await ActivityLogService.log('CLOSE_SESSION', {
      sessionId: session._id.toString(),
      publicId: session.publicId,
    });

    return { summary };
  }
}

