'use client';

import { useState } from 'react';
import { ClosingSessionData, GuardianData } from '../types/closing.types';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Printer, FileSpreadsheet, Lock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

export default function ClosingSummaryView({
  sessionData,
}: {
  sessionData: ClosingSessionData;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isClosing, setIsClosing] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCloseSession = async () => {
    setIsClosing(true);
    try {
      const res = await fetch('/api/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionPublicId: sessionData.sessionPublicId }),
      });
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: 'Sesi Penjualan Ditutup!',
          message: `Sesi ${sessionData.sessionPublicId} telah resmi ditutup dan dikunci.`,
          variant: 'success',
        });
        setConfirmOpen(false);
        router.refresh();
      } else {
        toast({
          title: 'Gagal Menutup Sesi',
          message: data.message || 'Terjadi kesalahan sistem.',
          variant: 'error',
        });
      }
    } catch {
      toast({
        title: 'Kesalahan Jaringan',
        message: 'Koneksi ke server terputus.',
        variant: 'error',
      });
    } finally {
      setIsClosing(false);
    }
  };

  const isClosed = sessionData.status === 'CLOSED';

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79] flex items-center gap-2">
            <Lock className="h-6 w-6" />
            Penutupan Sesi Penjualan & Bagi Hasil
          </h1>
          <p className="text-sm text-muted-foreground">
            Ringkasan sesi penjualan <strong className="font-mono text-foreground">{sessionData.sessionPublicId}</strong>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isClosed ? (
            <>
              <a
                href={`/api/export/print?sessionId=${sessionData.sessionPublicId}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Printer className="h-4 w-4" /> Print / PDF
                </Button>
              </a>
              <a
                href={`/api/export/excel?sessionId=${sessionData.sessionPublicId}`}
              >
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                  <FileSpreadsheet className="h-4 w-4" /> Export Excel
                </Button>
              </a>
            </>
          ) : (
            <Button
              onClick={() => setConfirmOpen(true)}
              disabled={isClosing}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
            >
              <Lock className="h-4 w-4" />
              Tutup Sesi Sekarang
            </Button>
          )}
        </div>
      </div>

      {!isClosed ? (
        <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h3 className="font-semibold">Perhatian Sebelum Menutup Sesi:</h3>
            <ul className="mt-1 list-disc pl-5 text-xs text-amber-800 space-y-0.5">
              <li>Pastikan semua transaksi telah dimasukkan ke kasir.</li>
              <li>Pastikan semua pengeluaran operasional telah dicatat.</li>
              <li>Setelah sesi ditutup, transaksi dan stok harian akan dikunci permanen.</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 text-emerald-900 flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">Sesi Penjualan Selesai & Terkunci.</span> Seluruh laporan dan pembagian hasil telah dihitung dan disimpan.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-[#F5F7FA] px-6 py-4">
              <h3 className="text-base font-bold text-[#1F4E79]">Ringkasan Keuangan</h3>
            </div>
            <div className="p-6">
              <dl className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pendapatan Kotor</dt>
                  <dd className="font-bold text-emerald-600 font-mono text-base">{formatCurrency(sessionData.summary.revenue)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Harga Pokok Penjualan (HPP / Modal)</dt>
                  <dd className="font-mono text-foreground">- {formatCurrency(sessionData.summary.cost)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4">
                  <dt className="font-medium text-foreground">Laba Kotor</dt>
                  <dd className="font-bold text-foreground font-mono">{formatCurrency(sessionData.summary.grossProfit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Pengeluaran Operasional</dt>
                  <dd className="font-mono text-red-600 font-semibold">- {formatCurrency(sessionData.summary.expense)}</dd>
                </div>
                <div className="flex justify-between border-t border-border pt-4 text-base">
                  <dt className="font-bold text-foreground">Laba Bersih (Net Profit)</dt>
                  <dd className="font-bold text-[#1F4E79] font-mono text-lg">{formatCurrency(sessionData.summary.netProfit)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-[#F5F7FA] px-6 py-4">
              <h3 className="text-base font-bold text-[#1F4E79]">Pembagian Hasil (Share Split)</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
                  <dt className="text-xs font-semibold text-blue-900">Setoran Kas Sekolah (40%)</dt>
                  <dd className="mt-2 text-2xl font-bold font-mono text-blue-900">{formatCurrency(sessionData.summary.share.schoolShare)}</dd>
                </div>
                <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">
                  <dt className="text-xs font-semibold text-emerald-900">Kas Masuk Kelas (60%)</dt>
                  <dd className="mt-2 text-2xl font-bold font-mono text-emerald-900">{formatCurrency(sessionData.summary.share.classShare)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-[#F5F7FA] px-6 py-4">
              <h3 className="text-base font-bold text-[#1F4E79]">Metrik Penjualan</h3>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Transaksi</span>
                <span className="font-mono font-bold text-[#1F4E79]">
                  {sessionData.summary.transactionsCount} Trx
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Barang Terjual</span>
                <span className="font-mono font-bold text-emerald-600">
                  {sessionData.summary.itemsSold} Pcs
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Sisa Stok Total</span>
                <span className="font-mono font-bold text-muted-foreground">
                  {sessionData.summary.remainingStock} Pcs
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-[#F5F7FA] px-6 py-4">
              <h3 className="text-base font-bold text-[#1F4E79]">Penjaga Bertugas</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {sessionData.guardians.map((g: GuardianData) => (
                  <li key={g.publicId} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#1F4E79]/10 text-[#1F4E79] flex items-center justify-center font-bold text-xs shrink-0">
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{g.name}</p>
                      <p className="text-xs font-mono text-muted-foreground">{g.publicId}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Close Session */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Konfirmasi Penutupan Sesi
            </DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menutup sesi penjualan ini? Setelah ditutup, transaksi baru tidak dapat dibuat untuk sesi ini dan stok akan dikunci secara permanen.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={isClosing}>
              Batal
            </Button>
            <Button onClick={handleCloseSession} className="bg-red-600 hover:bg-red-700 text-white" disabled={isClosing}>
              {isClosing ? 'Memproses...' : 'Ya, Tutup Sesi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
