export interface DashboardSummaryMetrics {
  revenue: number;
  expense: number;
  grossProfit: number;
  netProfit: number;
  transactionsCount: number;
  itemsSold: number;
  averageTransactionValue: number;
}

export interface ChartData {
  date: string;
  revenue: number;
  profit: number;
  expense: number;
  transactions: number;
}

export interface CategoryData {
  category: string;
  value: number;
}

export interface TopSellingItem {
  id: string;
  rank: number;
  name: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export interface LowStockItem {
  id: string;
  name: string;
  openingStock: number;
  remainingStock: number;
  percentage: number;
}

export interface RecentTransaction {
  id: string;
  publicId: string;
  time: string;
  itemsCount: number;
  revenue: number;
  cashierName: string;
}

export interface RecentExpense {
  id: string;
  date: string;
  title: string;
  category: string;
  amount: number;
}

export interface DashboardData {
  todaySummary: DashboardSummaryMetrics & {
    remainingInventory: number;
    activeSessionPublicId: string | null;
    guardians: string[];
  };
  weekSummary: DashboardSummaryMetrics;
  charts: {
    dailyTrend: ChartData[];
    salesByCategory: CategoryData[];
    expenseByCategory: CategoryData[];
  };
  topSelling: TopSellingItem[];
  lowStock: LowStockItem[];
  recentTransactions: RecentTransaction[];
  recentExpenses: RecentExpense[];
}
