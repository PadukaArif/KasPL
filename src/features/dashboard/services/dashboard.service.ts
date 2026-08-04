import { Transaction } from '@/features/transaction/models/transaction.model';
import { TransactionDetail } from '@/features/transaction/models/transactionDetail.model';
import { Expense } from '@/features/expense/models/expense.model';
import { DailyInventory } from '@/features/inventory/models/inventory.model';
import { SessionService } from '@/features/session/services/session.service';
import { DashboardData, DashboardSummaryMetrics } from '../types/dashboard.types';
import connectToDatabase from '@/lib/db/mongodb';

export class DashboardService {
  static async getDashboardData(): Promise<DashboardData> {
    await connectToDatabase();
    
    const today = new Date();
    // businessDate format: YYYY-MM-DD
    const todayStr = today.toISOString().split('T')[0];
    
    // For week summary, use periodWeek from active session if possible, or calculate current week
    const activeSession = await SessionService.getActiveSession();
    
    // Get start of today and end of today for Expense dates
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    // Get start of week (Sunday) and end of week (Saturday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const [
      todayTxStats,
      todayExpenseStats,
      weekTxStats,
      weekExpenseStats,
      remainingInventoryStats,
      chartsTxTrend,
      chartsExpenseTrend,
      chartsSalesCategory,
      chartsExpenseCategory,
      topSellingItems,
      lowStockItems,
      recentTx,
      recentExp
    ] = await Promise.all([
      // 1. Today Transaction Summary
      Transaction.aggregate([
        { $match: { businessDate: todayStr, status: 'SUCCESS' } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$grossRevenue' },
            grossProfit: { $sum: '$grossProfit' },
            netProfit: { $sum: '$netProfit' },
            transactionsCount: { $sum: 1 },
            itemsSold: { $sum: '$totalQuantity' },
          }
        }
      ]),

      // 2. Today Expense Summary
      Expense.aggregate([
        { $match: { expenseDate: { $gte: startOfToday, $lt: endOfToday }, deletedAt: null } },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: '$amount' }
          }
        }
      ]),

      // 3. Week Transaction Summary
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startOfWeek, $lt: endOfWeek }, status: 'SUCCESS' } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$grossRevenue' },
            grossProfit: { $sum: '$grossProfit' },
            netProfit: { $sum: '$netProfit' },
            transactionsCount: { $sum: 1 },
            itemsSold: { $sum: '$totalQuantity' },
          }
        }
      ]),

      // 4. Week Expense Summary
      Expense.aggregate([
        { $match: { expenseDate: { $gte: startOfWeek, $lt: endOfWeek }, deletedAt: null } },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: '$amount' }
          }
        }
      ]),

      // 5. Remaining Inventory (for today's active session or just all OPEN/LOCKED)
      DailyInventory.aggregate([
        { $match: { status: { $in: ['OPEN', 'LOCKED'] } } },
        {
          $group: {
            _id: null,
            totalRemaining: { $sum: '$remainingStock' }
          }
        }
      ]),

      // 6. Charts: Transaction trend (last 7 days)
      Transaction.aggregate([
        { $match: { createdAt: { $gte: startOfWeek, $lt: endOfWeek }, status: 'SUCCESS' } },
        {
          $group: {
            _id: '$businessDate',
            revenue: { $sum: '$grossRevenue' },
            profit: { $sum: '$grossProfit' },
            transactions: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 7. Charts: Expense trend (last 7 days)
      Expense.aggregate([
        { $match: { expenseDate: { $gte: startOfWeek, $lt: endOfWeek }, deletedAt: null } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$expenseDate" } },
            expense: { $sum: '$amount' }
          }
        },
        { $sort: { _id: 1 } }
      ]),

      // 8. Charts: Sales by Category (current week)
      TransactionDetail.aggregate([
        { $match: { createdAt: { $gte: startOfWeek, $lt: endOfWeek } } },
        {
          $group: {
            _id: '$categorySnapshot',
            value: { $sum: '$subtotalRevenue' }
          }
        }
      ]),

      // 9. Charts: Expense by Category (current week)
      Expense.aggregate([
        { $match: { expenseDate: { $gte: startOfWeek, $lt: endOfWeek }, deletedAt: null } },
        {
          $group: {
            _id: '$category',
            value: { $sum: '$amount' }
          }
        }
      ]),

      // 10. Top Selling Items (current week)
      TransactionDetail.aggregate([
        { $match: { createdAt: { $gte: startOfWeek, $lt: endOfWeek } } },
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
      ]),

      // 11. Low Stock (Current Active Session)
      DailyInventory.find({ status: { $in: ['OPEN', 'LOCKED'] } })
        .sort({ remainingStock: 1 })
        .limit(10)
        .lean(),

      // 12. Recent Transactions
      Transaction.find({ status: 'SUCCESS' })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // 13. Recent Expenses
      Expense.find({ deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean()
    ]);

    // Format Today Metrics
    const todayTx = todayTxStats[0] || { revenue: 0, grossProfit: 0, netProfit: 0, transactionsCount: 0, itemsSold: 0 };
    const todayExp = todayExpenseStats[0] || { totalExpense: 0 };
    
    const todaySummary: DashboardData['todaySummary'] = {
      revenue: todayTx.revenue,
      expense: todayExp.totalExpense,
      grossProfit: todayTx.grossProfit,
      netProfit: todayTx.grossProfit - todayExp.totalExpense, // net profit dynamically calculated if not stored as sum
      transactionsCount: todayTx.transactionsCount,
      itemsSold: todayTx.itemsSold,
      averageTransactionValue: todayTx.transactionsCount > 0 ? Math.round(todayTx.revenue / todayTx.transactionsCount) : 0,
      remainingInventory: remainingInventoryStats[0]?.totalRemaining || 0,
      activeSessionPublicId: activeSession ? activeSession.publicId : null,
      guardians: activeSession ? activeSession.guardians.map(g => g.name) : []
    };

    // Format Week Metrics
    const weekTx = weekTxStats[0] || { revenue: 0, grossProfit: 0, netProfit: 0, transactionsCount: 0, itemsSold: 0 };
    const weekExp = weekExpenseStats[0] || { totalExpense: 0 };

    const weekSummary: DashboardSummaryMetrics = {
      revenue: weekTx.revenue,
      expense: weekExp.totalExpense,
      grossProfit: weekTx.grossProfit,
      netProfit: weekTx.grossProfit - weekExp.totalExpense,
      transactionsCount: weekTx.transactionsCount,
      itemsSold: weekTx.itemsSold,
      averageTransactionValue: weekTx.transactionsCount > 0 ? Math.round(weekTx.revenue / weekTx.transactionsCount) : 0,
    };

    // Merge Charts Data
    // We want a unified array for Daily Trend
    const dailyMap = new Map<string, { date: string; revenue: number; profit: number; expense: number; transactions: number }>();
    
    // Initialize map with dates from startOfWeek to endOfWeek
    for (let d = new Date(startOfWeek); d < endOfWeek; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        dailyMap.set(dateStr, { date: dateStr, revenue: 0, profit: 0, expense: 0, transactions: 0 });
    }

    chartsTxTrend.forEach((tx: { _id: string; revenue: number; profit: number; transactions: number }) => {
      const entry = dailyMap.get(tx._id);
      if (entry) {
        entry.revenue = tx.revenue;
        entry.profit = tx.profit;
        entry.transactions = tx.transactions;
      }
    });

    chartsExpenseTrend.forEach((ex: { _id: string; expense: number }) => {
      const entry = dailyMap.get(ex._id);
      if (entry) {
        entry.expense = ex.expense;
      }
    });

    const dailyTrend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Format Categories
    const salesByCategory = chartsSalesCategory.map((c: { _id: string; value: number }) => ({ category: c._id, value: c.value }));
    const expenseByCategory = chartsExpenseCategory.map((c: { _id: string; value: number }) => ({ category: c._id, value: c.value }));

    return {
      todaySummary,
      weekSummary,
      charts: {
        dailyTrend,
        salesByCategory,
        expenseByCategory
      },
      topSelling: topSellingItems.map((item: { _id: string; name: string; quantitySold: number; revenue: number; profit: number }, index: number) => ({
        id: item._id,
        rank: index + 1,
        name: item.name,
        quantitySold: item.quantitySold,
        revenue: item.revenue,
        profit: item.profit
      })),
      lowStock: lowStockItems.map((item: { _id: import('mongoose').Types.ObjectId; itemNameSnapshot: string; openingStock: number; remainingStock: number }) => ({
        id: item._id.toString(),
        name: item.itemNameSnapshot,
        openingStock: item.openingStock,
        remainingStock: item.remainingStock,
        percentage: item.openingStock > 0 ? Math.round((item.remainingStock / item.openingStock) * 100) : 0
      })),
      recentTransactions: recentTx.map((tx: { _id: import('mongoose').Types.ObjectId; publicId: string; createdAt: Date; totalItems: number; grossRevenue: number; cashierName: string }) => ({
        id: tx._id.toString(),
        publicId: tx.publicId,
        time: new Date(tx.createdAt).toISOString(),
        itemsCount: tx.totalItems,
        revenue: tx.grossRevenue,
        cashierName: tx.cashierName
      })),
      recentExpenses: recentExp.map((ex: { _id: import('mongoose').Types.ObjectId; expenseDate: Date; title: string; category: string; amount: number }) => ({
        id: ex._id.toString(),
        date: new Date(ex.expenseDate).toISOString(),
        title: ex.title,
        category: ex.category,
        amount: ex.amount
      }))
    };
  }
}
