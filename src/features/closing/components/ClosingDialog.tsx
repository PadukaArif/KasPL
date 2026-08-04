'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { ClosingSummary } from '../types/closing.types';
import ClosingSuccess from './ClosingSuccess';

interface ClosingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onClosed?: () => void;
}

export default function ClosingDialog({ isOpen, onOpenChange, sessionId, onClosed }: ClosingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [closing, setClosing] = useState(false);
  const [summary, setSummary] = useState<ClosingSummary | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Checklist states
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);
  const allChecked = check1 && check2 && check3;

  useEffect(() => {
    let ignore = false;

    if (isOpen && sessionId && !isSuccess) {
      fetch(`/api/session/summary?sessionId=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (!ignore) {
            if (data.success) {
              setSummary(data.data);
            } else {
              setError(data.error);
            }
          }
        })
        .catch(() => {
          if (!ignore) setError('Gagal mengambil data ringkasan');
        })
        .finally(() => {
          if (!ignore) setLoading(false);
        });
    }

    return () => {
      ignore = true;
    };
  }, [isOpen, sessionId, isSuccess]);

  const handleCloseSession = async () => {
    if (!allChecked) return;
    setClosing(true);
    setError(null);
    try {
      const res = await fetch('/api/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data);
        setIsSuccess(true);
        if (onClosed) onClosed();
      } else {
        setError(data.error || 'Gagal menutup sesi');
      }
    } catch {
      setError('Terjadi kesalahan jaringan');
    } finally {
      setClosing(false);
    }
  };

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  if (isSuccess && summary) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <ClosingSuccess sessionId={sessionId} summary={summary} onClose={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tutup Sesi Penjualan Harian</DialogTitle>
          <DialogDescription>
            Proses ini akan mengunci seluruh transaksi dan pengeluaran hari ini. Laporan akan menjadi permanen.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-blue-500 h-8 w-8" /></div>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-600 rounded-md flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        ) : summary ? (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Total Transaksi</p>
                <p className="font-semibold text-lg">{summary.transactionsCount}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Barang Terjual</p>
                <p className="font-semibold text-lg">{summary.itemsSold}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Gross Profit</p>
                <p className="font-semibold text-lg text-blue-600">{formatRupiah(summary.grossProfit)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pengeluaran</p>
                <p className="font-semibold text-lg text-red-500">{formatRupiah(summary.expense)}</p>
              </div>
              <div className="col-span-2 md:col-span-4 border-t pt-2 mt-2 flex justify-between items-center">
                <p className="text-sm font-medium text-gray-600">Net Profit (Keuntungan Bersih):</p>
                <p className="font-bold text-2xl text-emerald-600">{formatRupiah(summary.netProfit)}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Checklist Penutupan
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={check1} onChange={e => setCheck1(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-yellow-900">Semua transaksi hari ini sudah dimasukkan ke sistem.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={check2} onChange={e => setCheck2(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-yellow-900">Semua pengeluaran dan belanja bahan baku sudah dicatat.</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={check3} onChange={e => setCheck3(e.target.checked)} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm text-yellow-900">Uang tunai di laci kasir sudah dihitung dan sesuai dengan Net Profit.</span>
                </label>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={closing}>Batal</Button>
          <Button 
            onClick={handleCloseSession} 
            disabled={!allChecked || loading || closing || !!error}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {closing ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> Memproses...</> : 'Konfirmasi Tutup Sesi'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
