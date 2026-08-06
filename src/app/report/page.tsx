'use client';

import { useState, useEffect } from 'react';
import { PeriodSummaryCards } from '@/features/report/components/PeriodSummaryCards';
import { WeekReportTable } from '@/features/report/components/WeekReportTable';
import { ReportFilter } from '@/features/report/components/ReportFilter';
import { PeriodSummary } from '@/features/report/types/report.types';
import { Loader2, FileText, AlertCircle, FileSpreadsheet, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ReportPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<PeriodSummary | null>(null);
  
  // Use current month (1-12) as default
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth() + 1);

  useEffect(() => {
    let isMounted = true;

    async function fetchReport() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/report?month=${currentMonth}`);
        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Gagal memuat laporan');
        }
        
        if (isMounted) setSummary(json.data);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchReport();
    
    return () => {
      isMounted = false;
    };
  }, [currentMonth]);

  return (
    <div className="container mx-auto py-8 max-w-7xl px-4 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1F4E79] flex items-center gap-2">
            <FileText className="h-8 w-8" />
            Laporan Keuangan
          </h1>
          <p className="text-muted-foreground mt-1">
            Ringkasan pendapatan, pengeluaran, dan laba bersih per periode.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <ReportFilter 
            currentMonth={currentMonth} 
            onMonthChange={setCurrentMonth} 
          />
          <a href="/api/export/excel" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 text-emerald-700 border-emerald-200 bg-emerald-50 hover:bg-emerald-100">
              <FileSpreadsheet className="h-4 w-4" /> Export Excel
            </Button>
          </a>
          <a href="/api/export/pdf" target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5 text-blue-700 border-blue-200 bg-blue-50 hover:bg-blue-100">
              <Printer className="h-4 w-4" /> Print / PDF
            </Button>
          </a>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-lg border shadow-sm">
          <Loader2 className="h-10 w-10 animate-spin text-[#1F4E79]" />
          <p className="mt-4 text-muted-foreground font-medium">Memuat data laporan...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-8 rounded-lg flex flex-col items-center justify-center text-center border border-red-200">
          <AlertCircle className="h-10 w-10 mb-4 text-red-500" />
          <p className="font-bold text-lg mb-2">Terjadi Kesalahan</p>
          <p>{error}</p>
        </div>
      ) : summary ? (
        <div className="space-y-8">
          <PeriodSummaryCards summary={summary} />
          
          <div>
            <h2 className="text-xl font-bold text-[#1F4E79] mb-4">Rincian Mingguan</h2>
            <WeekReportTable weeks={summary.weeks} />
          </div>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <FileText className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">Tidak Ada Data</h3>
          <p className="text-muted-foreground">Tidak ditemukan laporan untuk periode yang dipilih.</p>
        </div>
      )}
    </div>
  );
}
