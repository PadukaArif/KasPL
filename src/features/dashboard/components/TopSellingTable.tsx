import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TopSellingItem } from '../types/dashboard.types';
import { formatCurrency } from '@/utils/formatters';
import { Trophy } from 'lucide-react';

interface TopSellingTableProps {
  items: TopSellingItem[];
}

export function TopSellingTable({ items }: TopSellingTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-[#1F4E79]">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Produk Terlaris (Minggu Ini)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#F5F7FA]">
              <TableRow>
                <TableHead className="w-[80px] font-semibold text-[#1F4E79]">Peringkat</TableHead>
                <TableHead className="font-semibold text-[#1F4E79]">Produk</TableHead>
                <TableHead className="text-right font-semibold text-[#1F4E79]">Terjual</TableHead>
                <TableHead className="text-right font-semibold text-[#1F4E79]">Pendapatan</TableHead>
                <TableHead className="text-right font-semibold text-[#1F4E79]">Laba</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Belum ada data penjualan minggu ini
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        item.rank === 1 ? 'bg-yellow-100 text-yellow-700' : 
                        item.rank === 2 ? 'bg-gray-200 text-gray-700' : 
                        item.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-transparent'
                      }`}>
                        {item.rank}
                      </span>
                    </TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell className="text-right font-medium">{item.quantitySold}</TableCell>
                    <TableCell className="text-right font-mono text-sm">{formatCurrency(item.revenue)}</TableCell>
                    <TableCell className="text-right font-mono text-sm text-green-600 font-medium">
                      {formatCurrency(item.profit)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
