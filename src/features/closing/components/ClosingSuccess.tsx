'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, Download, Printer } from 'lucide-react';
import { ClosingSummary } from '../types/closing.types';
import Link from 'next/link';

interface ClosingSuccessProps {
  sessionId: string;
  summary: ClosingSummary;
  onClose: () => void;
}

export default function ClosingSuccess({ sessionId, summary, onClose }: ClosingSuccessProps) {
  const formatRupiah = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
        <CheckCircle className="w-10 h-10" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Sesi Berhasil Ditutup!</h2>
        <p className="text-gray-500 mt-2">Semua data untuk sesi ini telah dikunci dan dilaporkan.</p>
      </div>

      <div className="w-full max-w-md bg-gray-50 rounded-lg p-6 border text-left">
        <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Ringkasan Pembagian Bagi Hasil</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Net Profit</span>
            <span className="font-semibold">{formatRupiah(summary.netProfit)}</span>
          </div>
          
          <div className="flex justify-between items-center bg-blue-50 p-2 rounded">
            <span className="text-blue-800 font-medium">Kas Sekolah (40%)</span>
            <span className="font-bold text-blue-700">{formatRupiah(summary.schoolShare)}</span>
          </div>
          
          <div className="flex justify-between items-center bg-emerald-50 p-2 rounded">
            <span className="text-emerald-800 font-medium">Kas Kelas (60%)</span>
            <span className="font-bold text-emerald-700">{formatRupiah(summary.classShare)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
        <Link href={`/api/export/excel?sessionId=${sessionId}`} target="_blank" className={cn(buttonVariants({ variant: 'outline' }), 'flex items-center gap-2')}>
          <Download className="w-4 h-4" /> Download Excel
        </Link>
        <Link href={`/api/export/pdf?sessionId=${sessionId}`} target="_blank" className={cn(buttonVariants({ variant: 'default' }), 'flex items-center gap-2')}>
          <Printer className="w-4 h-4" /> Cetak / PDF
        </Link>
      </div>
      
      <Button variant="ghost" onClick={onClose} className="mt-4 text-gray-500">
        Tutup
      </Button>
    </div>
  );
}
