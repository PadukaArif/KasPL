'use client';

import { useState } from 'react';
import { ClosingSessionData, GuardianData } from '../types/closing.types';
import { useRouter } from 'next/navigation';

export default function ClosingSummaryView({
  sessionData,
}: {
  sessionData: ClosingSessionData;
}) {
  const [isClosing, setIsClosing] = useState(false);
  const router = useRouter();

  const handleCloseSession = async () => {
    if (!confirm('Tutup sesi penjualan? Aksi ini tidak dapat dibatalkan.')) return;

    setIsClosing(true);
    try {
      const res = await fetch('/api/session/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionPublicId: sessionData.sessionPublicId }),
      });
      const data = await res.json();
      
      if (data.success) {
        alert('Sesi berhasil ditutup!');
        router.refresh();
      } else {
        alert(data.message || 'Gagal menutup sesi');
      }
    } catch {
      alert('Terjadi kesalahan jaringan');
    } finally {
      setIsClosing(false);
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const isClosed = sessionData.status === 'CLOSED';

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Tutup Kasir Harian
          </h1>
          <p className="text-gray-500 mt-2">
            Ringkasan sesi {sessionData.sessionPublicId}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {isClosed && (
            <>
              <a
                href={`/api/export/print?sessionId=${sessionData.sessionPublicId}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Print / PDF
              </a>
              <a
                href={`/api/export/excel?sessionId=${sessionData.sessionPublicId}`}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
              >
                Export Excel
              </a>
            </>
          )}
          {!isClosed && (
            <button
              onClick={handleCloseSession}
              disabled={isClosing}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50"
            >
              {isClosing ? 'Memproses...' : 'Tutup Sesi Sekarang'}
            </button>
          )}
        </div>
      </div>

      {!isClosed && (
        <div className="mb-8 rounded-lg bg-yellow-50 p-4 border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-800">Perhatian Sebelum Menutup Sesi</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-yellow-700">
            <li>Pastikan semua transaksi telah dimasukkan ke sistem.</li>
            <li>Pastikan semua pengeluaran (belanja harian, dll) telah dicatat.</li>
            <li>Setelah sesi ditutup, transaksi dan pengeluaran tidak dapat diubah lagi.</li>
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Ringkasan Keuangan</h3>
            </div>
            <div className="p-6">
              <dl className="space-y-4">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Pendapatan Kotor</dt>
                  <dd className="font-medium text-green-600">{formatRupiah(sessionData.summary.revenue)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Modal / HPP</dt>
                  <dd className="font-medium text-gray-900">- {formatRupiah(sessionData.summary.cost)}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-4">
                  <dt className="text-gray-900 font-medium">Laba Kotor</dt>
                  <dd className="font-medium text-gray-900">{formatRupiah(sessionData.summary.grossProfit)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Pengeluaran Operasional</dt>
                  <dd className="font-medium text-red-600">- {formatRupiah(sessionData.summary.expense)}</dd>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-4 text-lg">
                  <dt className="font-bold text-gray-900">Laba Bersih</dt>
                  <dd className="font-bold text-blue-700">{formatRupiah(sessionData.summary.netProfit)}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Pembagian Hasil (Dari Laba Bersih)</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <dt className="text-sm font-medium text-gray-500">Kas Sekolah (40%)</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">{formatRupiah(sessionData.summary.share.schoolShare)}</dd>
                </div>
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <dt className="text-sm font-medium text-gray-500">Kas Kelas (60%)</dt>
                  <dd className="mt-1 text-2xl font-semibold text-gray-900">{formatRupiah(sessionData.summary.share.classShare)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Metrik Penjualan</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Total Transaksi</span>
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                  {sessionData.summary.transactionsCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Barang Terjual</span>
                <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {sessionData.summary.itemsSold} item
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Sisa Stok Total</span>
                <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                  {sessionData.summary.remainingStock} item
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">Petugas Hari Ini</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {sessionData.guardians.map((g: GuardianData) => (
                  <li key={g.publicId} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {g.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{g.name}</p>
                      <p className="text-xs text-gray-500">{g.publicId}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
