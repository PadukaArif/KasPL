import { ClosingService } from '@/features/closing/services/closing.service';
import { GuardianData } from '@/features/closing/types/closing.types';
import { notFound } from 'next/navigation';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

export default async function PrintExportPage({
  searchParams,
}: {
  searchParams: Promise<{ sessionId?: string; autoPrint?: string }>;
}) {
  const params = await searchParams;
  if (!params.sessionId) {
    return notFound();
  }

  let data;
  try {
    data = await ClosingService.getSummary(params.sessionId);
  } catch {
    return notFound();
  }

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return '-';
    return new Date(dateVal).toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAutoPrint = params.autoPrint === 'true';

  return (
    <div className="min-h-screen bg-white p-8 font-sans text-gray-900 print:p-0">
      {/* Script to trigger print automatically if requested */}
      {isAutoPrint && (
        <script
          dangerouslySetInnerHTML={{
            __html: `window.onload = function() { window.print(); }`,
          }}
        />
      )}

      {/* Action buttons (hidden when printing) */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold">Laporan Penjualan (Print Preview)</h1>
        <PrintButton />
      </div>

      {/* Printable Area */}
      <div className="mx-auto max-w-4xl border border-gray-200 p-10 print:border-none print:p-0">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold uppercase tracking-tight">KASPL</h2>
          <p className="mt-1 text-gray-500">Laporan Penjualan & Tutup Kasir Harian</p>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-8 text-sm">
          <div>
            <h3 className="mb-2 font-semibold text-gray-400">DETAIL SESI</h3>
            <p><strong>ID:</strong> {data.sessionPublicId}</p>
            <p><strong>Periode:</strong> Bulan {data.periodMonth} Minggu {data.periodWeek}</p>
            <p><strong>Status:</strong> <span className={data.status === 'CLOSED' ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{data.status}</span></p>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-gray-400">WAKTU & PETUGAS</h3>
            <p><strong>Buka:</strong> {formatDate(data.startDate)}</p>
            {data.endDate && <p><strong>Tutup:</strong> {formatDate(data.endDate)}</p>}
            <p><strong>Penjaga:</strong> {data.guardians.map((g: GuardianData) => g.name).join(', ')}</p>
          </div>
        </div>

        <div className="mb-8 border-t border-gray-200 pt-8">
          <h3 className="mb-4 text-lg font-bold">Ringkasan Keuangan</h3>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left text-sm">
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 font-medium">Pendapatan Kotor</td>
                  <td className="px-6 py-3 text-right font-medium text-green-600">{formatRupiah(data.summary.revenue)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-600">Total Modal / HPP</td>
                  <td className="px-6 py-3 text-right text-gray-600">- {formatRupiah(data.summary.cost)}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-3 font-medium">Laba Kotor</td>
                  <td className="px-6 py-3 text-right font-medium">{formatRupiah(data.summary.grossProfit)}</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 text-gray-600">Total Pengeluaran</td>
                  <td className="px-6 py-3 text-right text-red-600">- {formatRupiah(data.summary.expense)}</td>
                </tr>
                <tr className="bg-blue-50">
                  <td className="px-6 py-4 font-bold text-gray-900">Laba Bersih</td>
                  <td className="px-6 py-4 text-right font-bold text-blue-700 text-lg">{formatRupiah(data.summary.netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="mb-4 text-lg font-bold">Pembagian Hasil</h3>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-600">Kas Sekolah (40%)</span>
                <span className="font-semibold text-gray-900">{formatRupiah(data.summary.share.schoolShare)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Kas Kelas (60%)</span>
                <span className="font-semibold text-gray-900">{formatRupiah(data.summary.share.classShare)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-bold">Metrik Operasional</h3>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="mb-3 flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-600">Total Transaksi</span>
                <span className="font-semibold">{data.summary.transactionsCount}</span>
              </div>
              <div className="mb-3 flex justify-between border-b border-gray-100 pb-3">
                <span className="text-gray-600">Item Terjual</span>
                <span className="font-semibold">{data.summary.itemsSold}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sisa Stok (Items)</span>
                <span className="font-semibold">{data.summary.remainingStock}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-8 text-center text-xs text-gray-400">
          <p>Dokumen ini dicetak secara otomatis dari sistem KasPL pada {new Date().toLocaleString('id-ID')}</p>
        </div>
      </div>
    </div>
  );
}
