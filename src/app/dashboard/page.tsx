'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { SummaryCards } from '@/features/dashboard/components/SummaryCards';
import { QuickActions } from '@/features/dashboard/components/QuickActions';
import { TopSellingTable } from '@/features/dashboard/components/TopSellingTable';
import { LowStockTable } from '@/features/dashboard/components/LowStockTable';
import { RecentActivityTables } from '@/features/dashboard/components/RecentActivityTables';
import { DashboardData } from '@/features/dashboard/types/dashboard.types';

const DashboardCharts = dynamic(
  () => import('@/features/dashboard/components/DashboardCharts').then((mod) => mod.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-lg flex items-center justify-center text-xs text-muted-foreground">
        Memuat Grafik Analytics...
      </div>
    ),
  }
);
import { DashboardSkeleton } from '@/components/shared/Skeletons';
import { ErrorState } from '@/components/shared/ErrorState';
import { AlertCircle, RefreshCw, PlusCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

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
    return <DashboardSkeleton />;
  }

  if (error || !data) {
    return (
      <ErrorState
        title="Gagal Memuat Dashboard"
        message={error || 'Terjadi kesalahan sistem saat mengambil metrik bisnis.'}
        onRetry={fetchDashboardData}
      />
    );
  }

  const exportSessionParam = data.todaySummary.activeSessionPublicId
    ? `?sessionId=${data.todaySummary.activeSessionPublicId}`
    : '';

  return (
    <div className="space-y-8 pb-10">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Dashboard Analytics</h1>
          <p className="text-sm text-muted-foreground">Ringkasan performa dan metrik utama kantin kelas Anda.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={fetchDashboardData} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" /> Segarkan Data
          </Button>
          <a href={`/api/export/excel${exportSessionParam}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
          </a>
          <a href={`/api/export/pdf${exportSessionParam}`} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100">
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
          </a>
        </div>
      </div>

      {/* Warning banner if no active session */}
      {!data.todaySummary.activeSessionPublicId && (
        <Alert className="bg-amber-50 border-amber-200 text-amber-900 flex items-start gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <AlertTitle className="font-semibold text-amber-900">Sesi Penjualan Tutup</AlertTitle>
            <AlertDescription className="text-xs text-amber-800 mt-1">
              Tidak ada sesi penjualan yang aktif saat ini. Mulai sesi penjualan baru untuk dapat melakukan transaksi di Kasir POS.
            </AlertDescription>
          </div>
          <Link href="/session/start">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1.5">
              <PlusCircle className="h-4 w-4" /> Mulai Sesi
            </Button>
          </Link>
        </Alert>
      )}

      {/* Quick Actions */}
      <QuickActions />

      {/* Summary Cards */}
      <SummaryCards todaySummary={data.todaySummary} weekSummary={data.weekSummary} />

      {/* Charts */}
      <DashboardCharts 
        dailyTrend={data.charts.dailyTrend} 
        salesByCategory={data.charts.salesByCategory} 
        expenseByCategory={data.charts.expenseByCategory} 
      />

      {/* Top Selling and Low Stock */}
      <div className="grid gap-6 md:grid-cols-2">
        <TopSellingTable items={data.topSelling} />
        <LowStockTable items={data.lowStock} />
      </div>

      {/* Recent Activity */}
      <RecentActivityTables transactions={data.recentTransactions} expenses={data.recentExpenses} />
    </div>
  );
}
