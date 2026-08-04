import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { DollarSign, TrendingUp, TrendingDown, Receipt, ShoppingCart, Package, Activity, Users } from 'lucide-react';
import { DashboardSummaryMetrics } from '../types/dashboard.types';

interface SummaryCardsProps {
  todaySummary: DashboardSummaryMetrics & {
    remainingInventory: number;
    activeSessionPublicId: string | null;
    guardians: string[];
  };
  weekSummary: DashboardSummaryMetrics;
}

export function SummaryCards({ todaySummary, weekSummary }: SummaryCardsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#1F4E79]">Ringkasan Hari Ini</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Kotor</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todaySummary.revenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laba Kotor</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(todaySummary.grossProfit)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
              <Receipt className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(todaySummary.expense)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
              {todaySummary.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-blue-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${todaySummary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(todaySummary.netProfit)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transaksi Hari Ini</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(todaySummary.transactionsCount)}</div>
              <p className="text-xs text-muted-foreground mt-1">Rata-rata: {formatCurrency(todaySummary.averageTransactionValue)}/Trx</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produk Terjual</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(todaySummary.itemsSold)}</div>
              <p className="text-xs text-muted-foreground mt-1">Sisa Stok: {formatNumber(todaySummary.remainingInventory)} pcs</p>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status Sesi Saat Ini</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {todaySummary.activeSessionPublicId ? (
                <div className="flex flex-col gap-1">
                  <div className="text-xl font-bold text-[#1F4E79]">{todaySummary.activeSessionPublicId}</div>
                  <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>Penjaga: {todaySummary.guardians.join(', ')}</span>
                  </div>
                </div>
              ) : (
                <div className="text-xl font-bold text-muted-foreground">Sesi Tutup</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#1F4E79]">Ringkasan Minggu Ini</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(weekSummary.revenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laba Kotor</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(weekSummary.grossProfit)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengeluaran</CardTitle>
              <Receipt className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(weekSummary.expense)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
              {weekSummary.netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-blue-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${weekSummary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {formatCurrency(weekSummary.netProfit)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
