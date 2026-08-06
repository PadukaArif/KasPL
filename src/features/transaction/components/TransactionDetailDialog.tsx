'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Receipt, User, Calendar, Printer } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface TransactionDetailItem {
  _id: string;
  itemNameSnapshot: string;
  categorySnapshot: string;
  sellingPriceSnapshot: number;
  quantity: number;
  subtotalRevenue: number;
  subtotalProfit: number;
}

interface TransactionHeader {
  _id: string;
  publicId: string;
  businessDate: string;
  createdAt: string;
  cashierName: string;
  status: string;
  grossRevenue: number;
  grossProfit: number;
  totalItems: number;
  totalQuantity: number;
}

interface TransactionDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactionId?: string;
}

export function TransactionDetailDialog({ open, onOpenChange, transactionId }: TransactionDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [header, setHeader] = useState<TransactionHeader | null>(null);
  const [details, setDetails] = useState<TransactionDetailItem[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open || !transactionId) return;

    let mounted = true;
    Promise.resolve().then(() => {
      setLoading(true);
      setError('');
    });

    fetch(`/api/transaction/${transactionId}`)
      .then((res) => res.json())
      .then((json) => {
        if (!mounted) return;
        if (json.success && json.data) {
          setHeader(json.data.header);
          setDetails(json.data.details);
        } else {
          setError(json.error || 'Gagal memuat detail transaksi');
        }
      })
      .catch(() => {
        if (mounted) setError('Terjadi kesalahan koneksi');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open, transactionId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <div className="flex items-center gap-2 text-[#1F4E79]">
              <Receipt className="h-5 w-5" />
              <DialogTitle className="text-lg">Struk Transaksi</DialogTitle>
            </div>
            {header && (
              <Badge className={header.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100'}>
                {header.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        {loading ? (
          <div className="flex h-48 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-[#1F4E79]" />
            <span>Memuat struk transaksi...</span>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-sm text-destructive bg-destructive/10 rounded-md">
            {error}
          </div>
        ) : header ? (
          <div className="space-y-6 pt-2">
            {/* Header info */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[#F5F7FA] border border-border text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">No. Transaksi</span>
                <span className="font-mono font-bold text-[#1F4E79]">{header.publicId}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Tanggal & Waktu</span>
                <span className="font-medium flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {new Date(header.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Kasir</span>
                <span className="font-medium flex items-center gap-1">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  {header.cashierName}
                </span>
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F7FA]">
                    <TableHead className="font-semibold text-[#1F4E79]">Nama Barang</TableHead>
                    <TableHead className="w-[100px] text-right font-semibold text-[#1F4E79]">Harga</TableHead>
                    <TableHead className="w-[70px] text-center font-semibold text-[#1F4E79]">Qty</TableHead>
                    <TableHead className="w-[120px] text-right font-semibold text-[#1F4E79]">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.map((item) => (
                    <TableRow key={item._id}>
                      <TableCell className="font-medium">{item.itemNameSnapshot}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(item.sellingPriceSnapshot)}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold">{formatCurrency(item.subtotalRevenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="flex flex-col gap-2 pt-2 border-t text-sm">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Total Barang ({header.totalItems} jenis / {header.totalQuantity} pcs)</span>
                <span>{formatCurrency(header.grossRevenue)}</span>
              </div>
              <div className="flex justify-between items-center font-bold text-lg text-[#1F4E79] pt-2 border-t">
                <span>Total Bayar</span>
                <span className="font-mono">{formatCurrency(header.grossRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-md mt-1">
                <span>Laba Kotor Kantin</span>
                <span className="font-mono font-bold">{formatCurrency(header.grossProfit)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => window.print()} variant="outline" className="gap-2">
                <Printer className="h-4 w-4" /> Cetak Struk
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
