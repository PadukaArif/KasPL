export interface ReportSummaryMetrics {
  revenue: number;
  cost: number;
  grossProfit: number;
  expense: number;
  netProfit: number;
  transactionsCount: number;
  itemsSold: number;
  averageTransactionValue: number;
}

export interface DaySummary extends ReportSummaryMetrics {
  date: string; // YYYY-MM-DD
  remainingStock?: number;
}

export interface WeekSummary extends ReportSummaryMetrics {
  weekNumber: number;
  days: DaySummary[];
  bestSellingItem?: {
    name: string;
    quantity: number;
  };
}

export interface PeriodSummary extends ReportSummaryMetrics {
  periodMonth: number;
  weeks: WeekSummary[];
  mostProfitableDay?: { date: string; value: number };
  highestRevenueDay?: { date: string; value: number };
  lowestRevenueDay?: { date: string; value: number };
}

export interface ReportTransactionDetail {
  id: string;
  publicId: string;
  time: string; // ISO String
  itemsCount: number;
  revenue: number;
  profit: number;
  cashierName: string;
}

export interface ReportExpenseDetail {
  id: string;
  title: string;
  category: string;
  amount: number;
  time: string; // ISO String
}

export interface TopSellingItemDetail {
  id: string;
  name: string;
  quantitySold: number;
  revenue: number;
  profit: number;
}

export interface DayDetail {
  date: string;
  transactions: ReportTransactionDetail[];
  expenses: ReportExpenseDetail[];
  topSellingItems: TopSellingItemDetail[];
  profitBreakdown: {
    revenue: number;
    cost: number;
    expense: number;
    netProfit: number;
  };
}
