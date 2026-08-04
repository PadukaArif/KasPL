'use client';

import { useState, useEffect } from 'react';
import { SummaryCards } from '@/features/dashboard/components/SummaryCards';
import { DashboardCharts } from '@/features/dashboard/components/DashboardCharts';
import { TopSellingTable } from '@/features/dashboard/components/TopSellingTable';
import { LowStockTable } from '@/features/dashboard/components/LowStockTable';
import { RecentActivityTables } from '@/features/dashboard/components/RecentActivityTables';
import { DashboardData } from '@/features/dashboard/types/dashboard.types';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/dashboard');
      const json = await res.json();
      
      if (json.success) {
        setData(json.data);
      } else {
        setError(json.message || 'Gagal memuat data dashboard');
      }
    } catch {
      setError('Terjadi kesalahan koneksi saat memuat data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // We intentionally call this on mount, ignoring the lint rule if needed, or we just use a ref
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const json = await res.json();
        if (!mounted) return;
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'Gagal memuat data dashboard');
        }
      } catch {
        if (mounted) setError('Terjadi kesalahan koneksi saat memuat data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-[#1F4E79]" />
        <p className="text-muted-foreground animate-pulse">Mengumpulkan data dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Dashboard Analytics</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Kesalahan</AlertTitle>
          <AlertDescription>{error || 'Gagal memuat data'}</AlertDescription>
        </Alert>
        <Button onClick={fetchDashboardData} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Coba Lagi
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Dashboard Analytics</h1>
          <p className="text-sm text-muted-foreground">Ringkasan performa dan metrik utama bisnis kelas Anda.</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Segarkan
        </Button>
      </div>

      {!data.todaySummary.activeSessionPublicId && (
        <Alert className="bg-amber-50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Sesi Penjualan Tutup</AlertTitle>
          <AlertDescription className="text-amber-700">
            Tidak ada sesi penjualan yang aktif saat ini. Beberapa metrik mungkin tidak bertambah.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <SummaryCards todaySummary={data.todaySummary} weekSummary={data.weekSummary} />

      {/* Charts */}
      <DashboardCharts 
        dailyTrend={data.charts.dailyTrend} 
        salesByCategory={data.charts.salesByCategory} 
        expenseByCategory={data.charts.expenseByCategory} 
      />

      {/* Top Selling and Low Stock */}
      <div className="grid gap-4 md:grid-cols-2">
        <TopSellingTable items={data.topSelling} />
        <LowStockTable items={data.lowStock} />
      </div>

      {/* Recent Activity */}
      <RecentActivityTables transactions={data.recentTransactions} expenses={data.recentExpenses} />
    </div>
  );
}
