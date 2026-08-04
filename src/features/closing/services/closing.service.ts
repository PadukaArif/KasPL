import mongoose from 'mongoose';
import connectToDatabase from '@/lib/db/mongodb';
import { SellingSession } from '@/features/session/models/session.model';
import { Transaction } from '@/features/transaction/models/transaction.model';
import { Expense } from '@/features/expense/models/expense.model';
import { DailyInventory } from '@/features/inventory/models/inventory.model';
import { ClosingSessionData, ClosingSummary } from '../types/closing.types';
import { ServiceError } from '@/utils/errors';

export class ClosingService {
  static async calculateSummary(sessionId: string): Promise<ClosingSummary> {
    await connectToDatabase();

    // 1. Get Session
    const session = await SellingSession.findById(sessionId);
    if (!session) {
      throw new ServiceError('Sesi tidak ditemukan', 'SESSION_NOT_FOUND');
    }

    // 2. Aggregate Transactions
    const transactions = await Transaction.find({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      status: 'SUCCESS',
    });

    let revenue = 0;
    let cost = 0;
    let grossProfit = 0;
    let itemsSold = 0;
    const transactionsCount = transactions.length;

    for (const tx of transactions) {
      revenue += tx.grossRevenue;
      cost += tx.grossCost;
      grossProfit += tx.grossProfit;
      itemsSold += tx.totalQuantity;
    }

    // 3. Aggregate Expenses
    const expenses = await Expense.find({
      sessionId: new mongoose.Types.ObjectId(sessionId),
      deletedAt: null,
    });

    let expenseTotal = 0;
    for (const exp of expenses) {
      expenseTotal += exp.amount;
    }

    // 4. Aggregate Remaining Inventory Stock
    const inventories = await DailyInventory.find({
      sessionId: new mongoose.Types.ObjectId(sessionId),
    });

    let remainingStock = 0;
    for (const inv of inventories) {
      remainingStock += inv.remainingStock ?? 0;
    }

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
    if (session.status === 'CLOSED') {
      throw new ServiceError('Sesi ini sudah ditutup', 'SESSION_ALREADY_CLOSED');
    }

    const summary = await this.calculateSummary(session._id.toString());

    session.status = 'CLOSED';
    session.set('closedAt', new Date());
    session.endDate = new Date();
    session.set('summary', summary);

    await session.save();

    await DailyInventory.updateMany(
      { sessionId: session._id },
      { status: 'CLOSED' }
    );

    return { summary };
  }
}

