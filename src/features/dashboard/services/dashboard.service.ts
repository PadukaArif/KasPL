import mongoose from 'mongoose';
import { Transaction } from '@/features/transaction/models/transaction.model';
import { TransactionDetail } from '@/features/transaction/models/transactionDetail.model';
import { Expense } from '@/features/expense/models/expense.model';
import { DailyInventory } from '@/features/inventory/models/inventory.model';
import { SessionService } from '@/features/session/services/session.service';
import { SellingSession } from '@/features/session/models/session.model';
import { DashboardData, DashboardSummaryMetrics } from '../types/dashboard.types';
import connectToDatabase from '@/lib/db/mongodb';

export class DashboardService {
  static async getDashboardData(): Promise<DashboardData> {
    await connectToDatabase();
    
    // Operational dashboard MUST filter ONLY by currently ACTIVE session
    const activeSession = await SessionService.getActiveSession();
    
    if (!activeSession) {
      const zeroMetrics: DashboardSummaryMetrics = {
        revenue: 0,
        expense: 0,
        grossProfit: 0,
        netProfit: 0,
        transactionsCount: 0,
        itemsSold: 0,
        averageTransactionValue: 0,
        schoolShare: 0,
        classShare: 0,
      };

      return {
        todaySummary: {
          ...zeroMetrics,
          remainingInventory: 0,
          activeSessionPublicId: null,
          guardians: [],
        },
        weekSummary: zeroMetrics,
        charts: {
          dailyTrend: [],
          salesByCategory: [],
          expenseByCategory: [],
        },
        topSelling: [],
        lowStock: [],
        recentTransactions: [],
        recentExpenses: [],
      };
    }

    const activeSessionObjId = new mongoose.Types.ObjectId(activeSession.id);

    // Fetch all session IDs for the current week to calculate weekly metrics
    const currentWeekSessions = await SellingSession.find({
      periodMonth: activeSession.periodMonth,
      periodWeek: activeSession.periodWeek
    }).select('_id').lean();

    const currentWeekSessionIds = currentWeekSessions.map(s => s._id);

    // Fetch transaction IDs belonging exclusively to this active session
    const activeTxList = await Transaction.find({ sessionId: activeSessionObjId, status: 'SUCCESS' }).select('_id').lean();
    const activeTxIds = activeTxList.map((t) => t._id);

    const [
      txFacet,
      expFacet,
      remainingInventoryStats,
      txDetailFacet,
      lowStockItems,
      recentTx,
      recentExp,
      weeklyTxStats,
      weeklyExpenseStats
    ] = await Promise.all([
      // 1. Active Session Transaction Summary & Trend
      Transaction.aggregate([
        { $match: { sessionId: activeSessionObjId, status: 'SUCCESS' } },
        {
          $facet: {
            summary: [{
              $group: {
                _id: null,
                revenue: { $sum: '$grossRevenue' },
                grossProfit: { $sum: '$grossProfit' },
                netProfit: { $sum: '$netProfit' },
                transactionsCount: { $sum: 1 },
                itemsSold: { $sum: '$totalQuantity' },
              }
            }],
            trend: [
              {
                $group: {
                  _id: '$businessDate',
                  revenue: { $sum: '$grossRevenue' },
                  profit: { $sum: '$grossProfit' },
                  transactions: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ]
          }
        }
      ]),

      // 2. Active Session Expense Summary, Trend & Category
      Expense.aggregate([
        { $match: { sessionId: activeSessionObjId, deletedAt: null } },
        {
          $facet: {
            summary: [{
              $group: {
                _id: null,
                totalExpense: { $sum: '$amount' }
              }
            }],
            trend: [
              {
                $group: {
                  _id: { $dateToString: { format: "%Y-%m-%d", date: "$expenseDate" } },
                  expense: { $sum: '$amount' }
                }
              },
              { $sort: { _id: 1 } }
            ],
            byCategory: [{
              $group: {
                _id: '$category',
                value: { $sum: '$amount' }
              }
            }]
          }
        }
      ]),

      // 3. Remaining Inventory for Active Session
      DailyInventory.aggregate([
        { $match: { sessionId: activeSessionObjId } },
        {
          $group: {
            _id: null,
            totalRemaining: { $sum: '$remainingStock' }
          }
        }
      ]),

      // 4. Active Session Sales by Category & Top Selling
      activeTxIds.length > 0
        ? TransactionDetail.aggregate([
            { $match: { transactionId: { $in: activeTxIds } } },
            {
              $facet: {
                byCategory: [{
                  $group: {
                    _id: '$categorySnapshot',
                    value: { $sum: '$subtotalRevenue' }
                  }
                }],
                topSelling: [
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
                ]
              }
            }
          ])
        : Promise.resolve([{ byCategory: [], topSelling: [] }]),

      // 5. Low Stock (Active Session)
      DailyInventory.find({ sessionId: activeSessionObjId })
        .sort({ remainingStock: 1 })
        .limit(10)
        .lean(),

      // 6. Recent Transactions (Active Session)
      Transaction.find({ sessionId: activeSessionObjId, status: 'SUCCESS' })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // 7. Recent Expenses (Active Session)
      Expense.find({ sessionId: activeSessionObjId, deletedAt: null })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // 8. Weekly Transaction Summary
      Transaction.aggregate([
        { $match: { sessionId: { $in: currentWeekSessionIds }, status: 'SUCCESS' } },
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

      // 9. Weekly Expense Summary
      Expense.aggregate([
        { $match: { sessionId: { $in: currentWeekSessionIds }, deletedAt: null } },
        {
          $group: {
            _id: null,
            totalExpense: { $sum: '$amount' }
          }
        }
      ])
    ]);

    const txStats = txFacet[0]?.summary || [];
    const chartsTxTrend = txFacet[0]?.trend || [];
    const expenseStats = expFacet[0]?.summary || [];
    const chartsExpenseTrend = expFacet[0]?.trend || [];
    const chartsExpenseCategory = expFacet[0]?.byCategory || [];
    const chartsSalesCategory = txDetailFacet[0]?.byCategory || [];
    const topSellingItems = txDetailFacet[0]?.topSelling || [];

    // Format Metrics for Active Session
    const activeTx = txStats[0] || { revenue: 0, grossProfit: 0, netProfit: 0, transactionsCount: 0, itemsSold: 0 };
    const activeExp = expenseStats[0] || { totalExpense: 0 };
    const activeNet = activeTx.grossProfit - activeExp.totalExpense;

    const sessionSummaryMetrics: DashboardSummaryMetrics = {
      revenue: activeTx.revenue,
      expense: activeExp.totalExpense,
      grossProfit: activeTx.grossProfit,
      netProfit: activeNet,
      transactionsCount: activeTx.transactionsCount,
      itemsSold: activeTx.itemsSold,
      averageTransactionValue: activeTx.transactionsCount > 0 ? Math.round(activeTx.revenue / activeTx.transactionsCount) : 0,
      schoolShare: activeNet > 0 ? Math.round(activeNet * 0.4) : 0,
      classShare: activeNet > 0 ? Math.round(activeNet * 0.6) : 0,
    };

    const todaySummary: DashboardData['todaySummary'] = {
      ...sessionSummaryMetrics,
      remainingInventory: remainingInventoryStats[0]?.totalRemaining || 0,
      activeSessionPublicId: activeSession.publicId,
      guardians: activeSession.guardians.map((g) => g.name)
    };

    // Format Metrics for Weekly Session
    const weeklyTx = weeklyTxStats[0] || { revenue: 0, grossProfit: 0, netProfit: 0, transactionsCount: 0, itemsSold: 0 };
    const weeklyExp = weeklyExpenseStats[0] || { totalExpense: 0 };
    const weeklyNet = weeklyTx.grossProfit - weeklyExp.totalExpense;

    const weekSummaryMetrics: DashboardSummaryMetrics = {
      revenue: weeklyTx.revenue,
      expense: weeklyExp.totalExpense,
      grossProfit: weeklyTx.grossProfit,
      netProfit: weeklyNet,
      transactionsCount: weeklyTx.transactionsCount,
      itemsSold: weeklyTx.itemsSold,
      averageTransactionValue: weeklyTx.transactionsCount > 0 ? Math.round(weeklyTx.revenue / weeklyTx.transactionsCount) : 0,
      schoolShare: weeklyNet > 0 ? Math.round(weeklyNet * 0.4) : 0,
      classShare: weeklyNet > 0 ? Math.round(weeklyNet * 0.6) : 0,
    };

    // Build Daily Trend chart data from active session transaction and expense trends
    const dailyMap = new Map<string, { date: string; revenue: number; profit: number; expense: number; transactions: number }>();

    chartsTxTrend.forEach((tx: { _id: string; revenue: number; profit: number; transactions: number }) => {
      if (tx._id) {
        dailyMap.set(tx._id, { date: tx._id, revenue: tx.revenue, profit: tx.profit, expense: 0, transactions: tx.transactions });
      }
    });

    chartsExpenseTrend.forEach((ex: { _id: string; expense: number }) => {
      if (ex._id) {
        const existing = dailyMap.get(ex._id) || { date: ex._id, revenue: 0, profit: 0, expense: 0, transactions: 0 };
        existing.expense = ex.expense;
        dailyMap.set(ex._id, existing);
      }
    });

    const dailyTrend = Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    return {
      todaySummary,
      weekSummary: weekSummaryMetrics,
      charts: {
        dailyTrend,
        salesByCategory: chartsSalesCategory.map((c: { _id: string; value: number }) => ({ category: c._id, value: c.value })),
        expenseByCategory: chartsExpenseCategory.map((c: { _id: string; value: number }) => ({ category: c._id, value: c.value })),
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
