import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LowStockItem } from '../types/dashboard.types';
import { AlertTriangle } from 'lucide-react';

interface LowStockTableProps {
  items: LowStockItem[];
}

export function LowStockTable({ items }: LowStockTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 text-[#1F4E79]">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Peringatan Stok Menipis (Sesi Aktif)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-[#F5F7FA]">
              <TableRow>
                <TableHead className="font-semibold text-[#1F4E79]">Produk</TableHead>
                <TableHead className="text-right font-semibold text-[#1F4E79]">Stok Awal</TableHead>
                <TableHead className="text-right font-semibold text-[#1F4E79]">Sisa</TableHead>
                <TableHead className="w-[150px] font-semibold text-[#1F4E79]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Tidak ada peringatan stok
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-right">{item.openingStock}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">{item.remainingStock}</TableCell>
                    <TableCell>
                      <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${item.percentage > 50 ? 'bg-green-500' : item.percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 text-right">{item.percentage}% tersisa</p>
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
