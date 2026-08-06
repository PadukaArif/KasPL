'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/shared/Skeletons';

const TransactionDetailDialog = dynamic(() => import('@/features/transaction/components/TransactionDetailDialog').then(mod => mod.TransactionDetailDialog), {
  ssr: false,
});
import { Search, Receipt, Eye, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TransactionRecord {
  _id: string;
  publicId: string;
  businessDate: string;
  createdAt: string;
  cashierName: string;
  totalItems: number;
  totalQuantity: number;
  grossRevenue: number;
  grossProfit: number;
  status: string;
}

export default function TransactionPage() {
  const [items, setItems] = useState<TransactionRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [selectedTxId, setSelectedTxId] = useState<string | undefined>(undefined);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (status && status !== 'ALL') params.append('status', status);
    params.append('page', String(page));
    params.append('limit', String(limit));

    fetch(`/api/transaction?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setItems(json.data.items);
          setTotal(json.data.total);
        } else {
          setError(json.error || 'Gagal memuat transaksi');
        }
      })
      .catch(() => {
        setError('Terjadi kesalahan koneksi');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search, startDate, endDate, status, page, limit]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchTransactions();
    });
  }, [fetchTransactions]);

  const handleViewDetail = (id: string) => {
    setSelectedTxId(id);
    setDetailOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Riwayat Transaksi</h1>
          <p className="text-sm text-muted-foreground">Daftar lengkap transaksi penjualan di Kasir Kantin.</p>
        </div>
        <Button onClick={fetchTransactions} variant="outline" size="sm" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Segarkan Data
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari No. TRX atau Kasir..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                  className="w-full sm:w-[140px]"
                  title="Tanggal Mulai"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                  className="w-full sm:w-[140px]"
                  title="Tanggal Selesai"
                />
              </div>
              <Select value={status} onValueChange={(v) => { setStatus(v || 'ALL'); setPage(1); }}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Status</SelectItem>
                  <SelectItem value="SUCCESS">Success</SelectItem>
                  <SelectItem value="CANCELLED">Batal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Tampilkan:</span>
              <Select value={String(limit)} onValueChange={(v) => { setLimit(parseInt(v || '10', 10)); setPage(1); }}>
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} cols={6} />
          ) : error ? (
            <div className="p-4 text-center text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F7FA]">
                    <TableHead className="w-[160px] font-semibold text-[#1F4E79]">No. Transaksi</TableHead>
                    <TableHead className="w-[160px] font-semibold text-[#1F4E79]">Tanggal & Waktu</TableHead>
                    <TableHead className="font-semibold text-[#1F4E79]">Kasir</TableHead>
                    <TableHead className="w-[100px] text-center font-semibold text-[#1F4E79]">Item / Pcs</TableHead>
                    <TableHead className="w-[140px] text-right font-semibold text-[#1F4E79]">Total Pendapatan</TableHead>
                    <TableHead className="w-[120px] text-right font-semibold text-[#1F4E79]">Laba Kotor</TableHead>
                    <TableHead className="w-[100px] text-center font-semibold text-[#1F4E79]">Status</TableHead>
                    <TableHead className="w-[80px] text-right font-semibold text-[#1F4E79]">Struk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                        <Receipt className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        Belum ada transaksi ditemukan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((tx) => (
                      <TableRow key={tx._id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-xs font-semibold text-[#1F4E79]">
                          {tx.publicId}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{tx.cashierName}</TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {tx.totalItems} jenis / {tx.totalQuantity} pcs
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-bold text-foreground">
                          {formatCurrency(tx.grossRevenue)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm font-semibold text-emerald-600">
                          {formatCurrency(tx.grossProfit)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={tx.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-700'}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(tx._id)}
                            className="h-8 w-8 text-[#1F4E79] hover:bg-[#1F4E79]/10"
                            title="Lihat Struk"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || loading}
              >
                Sebelumnya
              </Button>
              <div className="text-xs text-muted-foreground">
                Halaman {page} dari {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page === totalPages || loading}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <TransactionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transactionId={selectedTxId}
      />
    </div>
  );
}
