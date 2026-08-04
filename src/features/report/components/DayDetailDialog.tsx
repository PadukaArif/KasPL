'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DayDetail } from '../types/report.types';
import { formatCurrency, formatNumber, formatDateToIndonesian } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, TrendingDown, Clock, Package } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DayDetailDialogProps {
  date: string | null;
  onClose: () => void;
}

export function DayDetailDialog({ date, onClose }: DayDetailDialogProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DayDetail | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date) return;
    let isMounted = true;
    
    async function fetchDayDetail() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/report/day?date=${date}`);
        const json = await res.json();
        
        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Gagal memuat detail hari');
        }
        
        if (isMounted) setData(json.data);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Terjadi kesalahan tidak terduga');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchDayDetail();
    
    return () => {
      isMounted = false;
    };
  }, [date]);

  return (
    <Dialog open={!!date} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30">
          <DialogTitle className="text-xl flex items-center gap-2">
            Rincian Harian
            {date && <Badge variant="outline" className="ml-2 font-mono">{formatDateToIndonesian(new Date(date))}</Badge>}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#1F4E79]" />
              <p className="mt-4 text-muted-foreground">Memuat rincian...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg flex flex-col items-center justify-center py-12 text-center">
              <p className="font-semibold text-lg mb-2">Terjadi Kesalahan</p>
              <p>{error}</p>
            </div>
          ) : data ? (
            <div className="space-y-8">
              {/* Profit Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">Pendapatan</div>
                  <div className="text-xl font-bold">{formatCurrency(data.profitBreakdown.revenue)}</div>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">HPP (Modal)</div>
                  <div className="text-xl font-bold text-orange-600">{formatCurrency(data.profitBreakdown.cost)}</div>
                </div>
                <div className="bg-white border rounded-lg p-4 shadow-sm">
                  <div className="text-sm text-muted-foreground mb-1">Pengeluaran</div>
                  <div className="text-xl font-bold text-red-600">{formatCurrency(data.profitBreakdown.expense)}</div>
                </div>
                <div className={`border rounded-lg p-4 shadow-sm ${data.profitBreakdown.netProfit >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="text-sm font-medium mb-1 flex items-center gap-1">
                    Laba Bersih
                    {data.profitBreakdown.netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-blue-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                  </div>
                  <div className={`text-xl font-bold ${data.profitBreakdown.netProfit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                    {formatCurrency(data.profitBreakdown.netProfit)}
                  </div>
                </div>
              </div>

              {/* Top Selling Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#1F4E79]" /> 
                  Produk Terlaris Hari Ini
                </h3>
                {data.topSellingItems.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted">
                        <TableRow>
                          <TableHead>Produk</TableHead>
                          <TableHead className="text-right">Terjual</TableHead>
                          <TableHead className="text-right">Pendapatan</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.topSellingItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right">{formatNumber(item.quantitySold)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.revenue)}</TableCell>
                            <TableCell className="text-right text-green-600 font-medium">{formatCurrency(item.profit)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-lg text-muted-foreground bg-gray-50">
                    Tidak ada produk yang terjual.
                  </div>
                )}
              </div>

              {/* Expenses */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-red-600 flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Rincian Pengeluaran
                </h3>
                {data.expenses.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-red-50">
                        <TableRow>
                          <TableHead>Waktu</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead>Keterangan</TableHead>
                          <TableHead className="text-right">Nominal</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.expenses.map((expense) => (
                          <TableRow key={expense.id}>
                            <TableCell className="text-muted-foreground">
                              {new Date(expense.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{expense.category}</Badge>
                            </TableCell>
                            <TableCell>{expense.title}</TableCell>
                            <TableCell className="text-right font-medium text-red-600">
                              {formatCurrency(expense.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-lg text-muted-foreground bg-gray-50">
                    Tidak ada pengeluaran pada hari ini.
                  </div>
                )}
              </div>

              {/* Transactions */}
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  Riwayat Transaksi
                </h3>
                {data.transactions.length > 0 ? (
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted">
                        <TableRow>
                          <TableHead>Waktu</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Kasir</TableHead>
                          <TableHead className="text-right">Item</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead className="text-right">Profit</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-muted-foreground">
                              {new Date(tx.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">{tx.publicId}</TableCell>
                            <TableCell>{tx.cashierName}</TableCell>
                            <TableCell className="text-right">{formatNumber(tx.itemsCount)}</TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(tx.revenue)}</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(tx.profit)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-6 border rounded-lg text-muted-foreground bg-gray-50">
                    Tidak ada transaksi pada hari ini.
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
