import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RecentTransaction, RecentExpense } from '../types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';
import { History, Receipt } from 'lucide-react';

interface RecentActivityTablesProps {
  transactions: RecentTransaction[];
  expenses: RecentExpense[];
}

export function RecentActivityTables({ transactions, expenses }: RecentActivityTablesProps) {
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-[#1F4E79]">
            <History className="h-5 w-5" />
            10 Transaksi Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-[#F5F7FA]">
                <TableRow>
                  <TableHead className="font-semibold text-[#1F4E79]">Waktu</TableHead>
                  <TableHead className="font-semibold text-[#1F4E79]">No. Transaksi</TableHead>
                  <TableHead className="text-right font-semibold text-[#1F4E79]">Nilai</TableHead>
                  <TableHead className="font-semibold text-[#1F4E79]">Kasir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                      Belum ada transaksi
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell className="text-xs">{formatTime(tx.time)}</TableCell>
                      <TableCell className="font-medium text-xs">{tx.publicId}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-green-600 font-medium">
                        {formatCurrency(tx.revenue)}
                      </TableCell>
                      <TableCell className="text-xs truncate max-w-[100px]">{tx.cashierName}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-[#1F4E79]">
            <Receipt className="h-5 w-5" />
            10 Pengeluaran Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-[#F5F7FA]">
                <TableRow>
                  <TableHead className="font-semibold text-[#1F4E79]">Tanggal</TableHead>
                  <TableHead className="font-semibold text-[#1F4E79]">Keperluan</TableHead>
                  <TableHead className="text-right font-semibold text-[#1F4E79]">Nominal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                      Belum ada pengeluaran
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((ex) => (
                    <TableRow key={ex.id}>
                      <TableCell className="text-xs">{formatDate(ex.date)}</TableCell>
                      <TableCell className="font-medium text-xs truncate max-w-[120px]">{ex.title}</TableCell>
                      <TableCell className="text-right font-mono text-sm text-red-600 font-medium">
                        {formatCurrency(ex.amount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
