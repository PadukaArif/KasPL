'use client';

import { useEffect, useState, use } from 'react';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrintGuardian {
  publicId?: string;
  name: string;
}

interface PrintSessionData {
  session: {
    publicId: string;
    periodMonth: number;
    periodWeek: number;
    startDate: string;
    closedAt: string | null;
    status: string;
    guardians: PrintGuardian[];
  };
  summary: {
    revenue: number;
    cost: number;
    grossProfit: number;
    expense: number;
    netProfit: number;
    schoolShare: number;
    classShare: number;
    itemsSold: number;
    transactionsCount: number;
  };
}

export default function PrintPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params);
  const [data, setData] = useState<PrintSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/export/print?sessionId=${sessionId}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res.data);
        } else {
          setError(res.error);
        }
      })
      .catch(() => setError('Gagal mengambil data cetak'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen w-full items-center justify-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!data) return null;

  const { session, summary } = data;

  return (
    <div className="bg-white min-h-screen">
      {/* Non-printable header for actions */}
      <div className="print:hidden p-4 bg-gray-100 flex justify-between items-center shadow-sm">
        <p className="text-sm text-gray-500">Tampilan cetak (Tekan Ctrl+P atau Cmd+P untuk menyimpan sebagai PDF)</p>
        <Button onClick={() => window.print()} className="flex items-center gap-2">
          <Printer className="w-4 h-4" /> Cetak / Simpan PDF
        </Button>
      </div>

      {/* Printable Area - A4 Size constraints roughly */}
      <div className="max-w-[21cm] mx-auto bg-white p-[2cm] print:p-0 text-black text-sm">
        <div className="border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold text-center uppercase tracking-wider">Laporan Penjualan Harian</h1>
          <h2 className="text-xl font-bold text-center uppercase tracking-wider">Program KasPL</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8 border-b-2 border-black pb-4">
          <div>
            <p><span className="font-semibold w-32 inline-block">ID Sesi:</span> {session.publicId}</p>
            <p><span className="font-semibold w-32 inline-block">Mulai:</span> {new Date(session.startDate).toLocaleString()}</p>
            <p><span className="font-semibold w-32 inline-block">Tutup:</span> {session.closedAt ? new Date(session.closedAt).toLocaleString() : '-'}</p>
          </div>
          <div>
            <p><span className="font-semibold w-32 inline-block">Periode:</span> Bulan {session.periodMonth} / Minggu {session.periodWeek}</p>
            <p><span className="font-semibold w-32 inline-block">Status:</span> {session.status}</p>
          </div>
        </div>

        <div className="mb-8 border border-black p-4 rounded-md">
          <h3 className="font-bold text-lg mb-4 uppercase border-b border-gray-300 pb-2">Ringkasan Keuangan</h3>
          <div className="grid grid-cols-2 gap-y-2">
            <p className="flex justify-between px-4"><span className="text-gray-600">Total Pendapatan (Revenue):</span> <span className="font-semibold">{formatRupiah(summary.revenue)}</span></p>
            <p className="flex justify-between px-4 border-l border-gray-300"><span className="text-gray-600">Barang Terjual:</span> <span className="font-semibold">{summary.itemsSold}</span></p>
            <p className="flex justify-between px-4"><span className="text-gray-600">Total Modal (Cost):</span> <span className="font-semibold">{formatRupiah(summary.cost)}</span></p>
            <p className="flex justify-between px-4 border-l border-gray-300"><span className="text-gray-600">Jumlah Transaksi:</span> <span className="font-semibold">{summary.transactionsCount}</span></p>
            <p className="flex justify-between px-4"><span className="text-gray-600">Laba Kotor (Gross Profit):</span> <span className="font-semibold">{formatRupiah(summary.grossProfit)}</span></p>
            <div className="col-span-2"><hr className="my-2 border-gray-300" /></div>
            <p className="flex justify-between px-4 col-span-2 text-red-600"><span className="text-gray-600">Total Pengeluaran:</span> <span className="font-semibold">-{formatRupiah(summary.expense)}</span></p>
            <div className="col-span-2"><hr className="my-2 border-black" /></div>
            <p className="flex justify-between px-4 col-span-2 text-lg"><span className="font-bold">Laba Bersih (Net Profit):</span> <span className="font-bold">{formatRupiah(summary.netProfit)}</span></p>
          </div>
        </div>

        <div className="mb-8 border border-black p-4 rounded-md bg-gray-50 print:bg-transparent">
          <h3 className="font-bold text-lg mb-4 uppercase border-b border-gray-300 pb-2">Bagi Hasil</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border border-blue-200 rounded">
              <p className="text-gray-600 text-sm">Kas Sekolah (40%)</p>
              <p className="font-bold text-xl">{formatRupiah(summary.schoolShare)}</p>
            </div>
            <div className="p-4 border border-emerald-200 rounded">
              <p className="text-gray-600 text-sm">Kas Kelas (60%)</p>
              <p className="font-bold text-xl">{formatRupiah(summary.classShare)}</p>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-black flex justify-around">
          {session.guardians?.map((guardian: PrintGuardian, idx: number) => (
            <div key={idx} className="text-center">
              <p className="mb-16">Penjaga {idx + 1}</p>
              <p className="font-semibold underline">{guardian.name}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Global Print Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4 portrait;
            margin: 1cm;
          }
        }
      `}} />
    </div>
  );
}
