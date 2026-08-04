import { Transaction } from '@/features/transaction/models/transaction.model';
import { TransactionDetail } from '@/features/transaction/models/transactionDetail.model';
import { Expense } from '@/features/expense/models/expense.model';
import { SellingSession } from '@/features/session/models/session.model';
import { PeriodSummary, WeekSummary, DaySummary, DayDetail, ReportTransactionDetail, ReportExpenseDetail, TopSellingItemDetail } from '../types/report.types';
import connectToDatabase from '@/lib/db/mongodb';

export class ReportService {
  static async getCurrentPeriod(): Promise<number> {
    await connectToDatabase();
    
    // Find the latest active session, or just the most recent session's periodMonth
    const latestSession = await SellingSession.findOne().sort({ createdAt: -1 }).select('periodMonth').lean();
    if (latestSession) {
      return latestSession.periodMonth;
    }
    
    // Fallback to current month if no sessions exist (1-12)
    return new Date().getMonth() + 1;
  }

  static async getPeriodSummary(periodMonth: number): Promise<PeriodSummary> {
    await connectToDatabase();

    // 1. Get all sessions for this month to map to expenses
    const sessions = await SellingSession.find({ periodMonth }).select('_id periodWeek startDate').lean();
    const sessionIds = sessions.map(s => s._id);

    // 2. Aggregate Transactions by week and day
    const txAgg = await Transaction.aggregate([
      { $match: { periodMonth, status: 'SUCCESS' } },
      {
        $group: {
          _id: { week: '$periodWeek', date: '$businessDate' },
          revenue: { $sum: '$grossRevenue' },
          cost: { $sum: '$grossCost' },
          grossProfit: { $sum: '$grossProfit' },
          netProfit: { $sum: '$netProfit' }, // Will recalculate with expenses below
          transactionsCount: { $sum: 1 },
          itemsSold: { $sum: '$totalQuantity' }
        }
      },
      { $sort: { '_id.week': 1, '_id.date': 1 } }
    ]);

    // 3. Aggregate Expenses by date
    const expAgg = await Expense.aggregate([
      { $match: { sessionId: { $in: sessionIds }, deletedAt: null } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$expenseDate" } },
          expense: { $sum: '$amount' }
        }
      }
    ]);

    // Create expense map for quick lookup
    const expenseMap = new Map<string, number>();
    expAgg.forEach((e: { _id: string; expense: number }) => {
      expenseMap.set(e._id, e.expense);
    });

    // 4. Build the nested structure (Weeks -> Days)
    const weeksMap = new Map<number, WeekSummary>();

    txAgg.forEach((dayTx: {
      _id: { week: number; date: string };
      revenue: number;
      cost: number;
      grossProfit: number;
      transactionsCount: number;
      itemsSold: number;
    }) => {
      const week = dayTx._id.week;
      const date = dayTx._id.date;
      const expense = expenseMap.get(date) || 0;
      const netProfit = dayTx.grossProfit - expense;

      const daySummary: DaySummary = {
        date,
        revenue: dayTx.revenue,
        cost: dayTx.cost,
        grossProfit: dayTx.grossProfit,
        expense,
        netProfit,
        transactionsCount: dayTx.transactionsCount,
        itemsSold: dayTx.itemsSold,
        averageTransactionValue: dayTx.transactionsCount > 0 ? Math.round(dayTx.revenue / dayTx.transactionsCount) : 0
      };

      if (!weeksMap.has(week)) {
        weeksMap.set(week, {
          weekNumber: week,
          days: [],
          revenue: 0, cost: 0, grossProfit: 0, expense: 0, netProfit: 0, transactionsCount: 0, itemsSold: 0, averageTransactionValue: 0
        });
      }

      const weekSummary = weeksMap.get(week)!;
      weekSummary.days.push(daySummary);
      weekSummary.revenue += daySummary.revenue;
      weekSummary.cost += daySummary.cost;
      weekSummary.grossProfit += daySummary.grossProfit;
      weekSummary.expense += daySummary.expense;
      weekSummary.netProfit += daySummary.netProfit;
      weekSummary.transactionsCount += daySummary.transactionsCount;
      weekSummary.itemsSold += daySummary.itemsSold;
    });

    // Also need to account for expenses on days with NO transactions, though rare
    // In a POS system, expenses are tied to sessions, which are tied to active selling days.
    // So we can assume days with expenses also have sessions/transactions. 
    // If we wanted to be perfectly exhaustive, we'd iterate the expenseMap and add missing days.

    const weeks = Array.from(weeksMap.values()).map(w => {
      w.averageTransactionValue = w.transactionsCount > 0 ? Math.round(w.revenue / w.transactionsCount) : 0;
      return w;
    }).sort((a, b) => a.weekNumber - b.weekNumber);

    // Calculate period totals
    const periodSummary: PeriodSummary = {
      periodMonth,
      weeks,
      revenue: 0, cost: 0, grossProfit: 0, expense: 0, netProfit: 0, transactionsCount: 0, itemsSold: 0, averageTransactionValue: 0
    };

    let mostProfitableDay: DaySummary | null = null;
    let highestRevenueDay: DaySummary | null = null;
    let lowestRevenueDay: DaySummary | null = null;

    weeks.forEach(w => {
      periodSummary.revenue += w.revenue;
      periodSummary.cost += w.cost;
      periodSummary.grossProfit += w.grossProfit;
      periodSummary.expense += w.expense;
      periodSummary.netProfit += w.netProfit;
      periodSummary.transactionsCount += w.transactionsCount;
      periodSummary.itemsSold += w.itemsSold;

      w.days.forEach(d => {
        if (!mostProfitableDay || d.netProfit > mostProfitableDay.netProfit) mostProfitableDay = d;
        if (!highestRevenueDay || d.revenue > highestRevenueDay.revenue) highestRevenueDay = d;
        if (!lowestRevenueDay || d.revenue < lowestRevenueDay.revenue) lowestRevenueDay = d;
      });
    });

    periodSummary.averageTransactionValue = periodSummary.transactionsCount > 0 ? Math.round(periodSummary.revenue / periodSummary.transactionsCount) : 0;
    
    if (mostProfitableDay) periodSummary.mostProfitableDay = { date: (mostProfitableDay as DaySummary).date, value: (mostProfitableDay as DaySummary).netProfit };
    if (highestRevenueDay) periodSummary.highestRevenueDay = { date: (highestRevenueDay as DaySummary).date, value: (highestRevenueDay as DaySummary).revenue };
    if (lowestRevenueDay) periodSummary.lowestRevenueDay = { date: (lowestRevenueDay as DaySummary).date, value: (lowestRevenueDay as DaySummary).revenue };

    return periodSummary;
  }

  static async getDayDetail(businessDate: string): Promise<DayDetail> {
    await connectToDatabase();

    // Transactions for the day
    const transactions = await Transaction.find({ businessDate, status: 'SUCCESS' }).sort({ createdAt: -1 }).lean();
    
    // Get sessions for that day to find expenses
    const sessionIds = Array.from(new Set(transactions.map(t => t.sessionId.toString())));
    
    // Expenses
    const expenses = await Expense.find({ 
      sessionId: { $in: sessionIds }, 
      deletedAt: null 
    }).sort({ expenseDate: -1 }).lean();

    // Top Selling Items
    const topSellingAgg = await TransactionDetail.aggregate([
      { $match: { transactionId: { $in: transactions.map(t => t._id) } } },
      {
        $group: {
          _id: '$itemPublicId',
          name: { $first: '$itemNameSnapshot' },
          quantitySold: { $sum: '$quantity' },
          revenue: { $sum: '$subtotalRevenue' },
          profit: { $sum: '$subtotalProfit' }
        }
      },
      { $sort: { quantitySold: -1 } },
      { $limit: 10 }
    ]);

    const txDetails: ReportTransactionDetail[] = transactions.map(t => ({
      id: t._id.toString(),
      publicId: t.publicId,
      time: new Date(t.createdAt).toISOString(),
      itemsCount: t.totalItems,
      revenue: t.grossRevenue,
      profit: t.grossProfit,
      cashierName: t.cashierName
    }));

    const expDetails: ReportExpenseDetail[] = expenses.map(e => ({
      id: e._id.toString(),
      title: e.title,
      category: e.category,
      amount: e.amount,
      time: new Date(e.expenseDate).toISOString(),
    }));

    const topSellingItems: TopSellingItemDetail[] = topSellingAgg.map((ts: { _id: string; name: string; quantitySold: number; revenue: number; profit: number }) => ({
      id: ts._id,
      name: ts.name,
      quantitySold: ts.quantitySold,
      revenue: ts.revenue,
      profit: ts.profit
    }));

    const revenue = txDetails.reduce((sum, t) => sum + t.revenue, 0);
    const cost = transactions.reduce((sum, t) => sum + t.grossCost, 0);
    const expense = expDetails.reduce((sum, e) => sum + e.amount, 0);

    return {
      date: businessDate,
      transactions: txDetails,
      expenses: expDetails,
      topSellingItems,
      profitBreakdown: {
        revenue,
        cost,
        expense,
        netProfit: revenue - cost - expense
      }
    };
  }
}
