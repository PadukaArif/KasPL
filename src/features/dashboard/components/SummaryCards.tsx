import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { DollarSign, TrendingUp, TrendingDown, Receipt, ShoppingCart, Package, Activity, Users, School, Landmark } from 'lucide-react';
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
  const schoolShareToday = todaySummary.netProfit > 0 ? Math.round(todaySummary.netProfit * 0.4) : 0;
  const classShareToday = todaySummary.netProfit > 0 ? Math.round(todaySummary.netProfit * 0.6) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#1F4E79]">Ringkasan Penjualan Hari Ini</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Kotor</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(todaySummary.revenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">Status Sesi: {todaySummary.activeSessionPublicId ? 'Aktif' : 'Tutup'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laba Kotor</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(todaySummary.grossProfit)}</div>
              <p className="text-xs text-muted-foreground mt-1">Sebelum Pengeluaran</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengeluaran Hari Ini</CardTitle>
              <Receipt className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(todaySummary.expense)}</div>
              <p className="text-xs text-muted-foreground mt-1">Biaya Operasional</p>
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
              <p className="text-xs text-muted-foreground mt-1">Laba Kotor - Pengeluaran</p>
            </CardContent>
          </Card>

          {/* School Share & Class Share */}
          <Card className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-blue-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900">Bagi Hasil Sekolah (40%)</CardTitle>
              <School className="h-4 w-4 text-blue-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">{formatCurrency(schoolShareToday)}</div>
              <p className="text-xs text-blue-700/80 mt-1">Setoran Kantin Sekolah</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50/50 to-teal-50/30 border-emerald-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-900">Bagi Hasil Kelas (60%)</CardTitle>
              <Landmark className="h-4 w-4 text-emerald-700" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-900">{formatCurrency(classShareToday)}</div>
              <p className="text-xs text-emerald-700/80 mt-1">Kas Masuk Kelas</p>
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
              <CardTitle className="text-sm font-medium">Produk Terjual & Stok</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(todaySummary.itemsSold)} pcs</div>
              <p className="text-xs text-muted-foreground mt-1">Sisa Stok: {formatNumber(todaySummary.remainingInventory)} pcs</p>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-2 lg:col-span-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sesi Penjualan & Guardian Bertugas</CardTitle>
              <Activity className="h-4 w-4 text-[#1F4E79]" />
            </CardHeader>
            <CardContent>
              {todaySummary.activeSessionPublicId ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-[#1F4E79] font-mono">{todaySummary.activeSessionPublicId}</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Aktif
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4 text-[#1F4E79]" />
                    <span>Penjaga Bertugas: <strong className="text-foreground">{todaySummary.guardians.join(', ') || 'Belum diatur'}</strong></span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">Tidak ada sesi penjualan yang aktif saat ini.</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#1F4E79]">Ringkasan Penjualan Minggu Ini</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendapatan Mingguan</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(weekSummary.revenue)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laba Kotor Mingguan</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{formatCurrency(weekSummary.grossProfit)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pengeluaran Mingguan</CardTitle>
              <Receipt className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(weekSummary.expense)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Laba Bersih Mingguan</CardTitle>
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
