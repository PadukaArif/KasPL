import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { PeriodSummary } from '../types/report.types';
import { DollarSign, TrendingUp, TrendingDown, Receipt, ShoppingCart, Package, Calendar } from 'lucide-react';

interface PeriodSummaryCardsProps {
  summary: PeriodSummary;
}

export function PeriodSummaryCards({ summary }: PeriodSummaryCardsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.revenue)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba Kotor</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.grossProfit)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <Receipt className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary.expense)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Laba Bersih</CardTitle>
            {summary.netProfit >= 0 ? (
              <TrendingUp className="h-4 w-4 text-blue-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {formatCurrency(summary.netProfit)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transaksi</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.transactionsCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Rata-rata: {formatCurrency(summary.averageTransactionValue)}/Trx</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Produk Terjual</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.itemsSold)}</div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Paling Menguntungkan</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summary.mostProfitableDay ? (
              <div className="flex flex-col gap-1">
                <div className="text-xl font-bold text-[#1F4E79]">
                  {new Date(summary.mostProfitableDay.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
                <div className="flex items-center gap-2 mt-1 text-sm text-green-600 font-medium">
                  <TrendingUp className="h-3 w-3" />
                  <span>Profit: {formatCurrency(summary.mostProfitableDay.value)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xl font-bold text-muted-foreground">Belum ada data</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
