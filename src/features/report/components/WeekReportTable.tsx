'use client';

import { useState } from 'react';
import { WeekSummary } from '../types/report.types';
import { formatCurrency, formatNumber, formatDateToIndonesian } from '@/utils/formatters';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Badge } from '@/components/ui/badge';

const DayDetailDialog = dynamic(() => import('./DayDetailDialog').then(mod => mod.DayDetailDialog), {
  ssr: false,
});

interface WeekReportTableProps {
  weeks: WeekSummary[];
}

export function WeekReportTable({ weeks }: WeekReportTableProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (weeks.length === 0) {
    return (
      <div className="bg-white border rounded-lg p-12 flex flex-col items-center justify-center text-center shadow-sm">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Eye className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Belum Ada Data Laporan</h3>
        <p className="text-muted-foreground">Periode ini belum memiliki aktivitas penjualan atau pengeluaran.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {weeks.map((week) => (
        <Card key={week.weekNumber} className="overflow-hidden border-border/60 shadow-sm">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Minggu ke-{week.weekNumber}
                  <Badge variant="secondary" className="font-normal text-xs">
                    {week.days.length} Hari Aktif
                  </Badge>
                </CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  Pendapatan: {formatCurrency(week.revenue)} • Laba Bersih:{' '}
                  <span className={week.netProfit >= 0 ? 'text-green-600' : 'text-red-600 font-medium'}>
                    {formatCurrency(week.netProfit)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Total Trx</span>
                  <span className="font-medium">{formatNumber(week.transactionsCount)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Produk Terjual</span>
                  <span className="font-medium">{formatNumber(week.itemsSold)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-xs">Pengeluaran</span>
                  <span className="font-medium text-red-600">{formatCurrency(week.expense)}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                    <TableHead className="w-[180px]">Tanggal</TableHead>
                    <TableHead className="text-right">Pendapatan</TableHead>
                    <TableHead className="text-right">Laba Kotor</TableHead>
                    <TableHead className="text-right">Pengeluaran</TableHead>
                    <TableHead className="text-right">Laba Bersih</TableHead>
                    <TableHead className="text-right">Trx</TableHead>
                    <TableHead className="text-center w-[100px]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {week.days.map((day) => (
                    <TableRow key={day.date} className="group">
                      <TableCell className="font-medium">
                        {formatDateToIndonesian(new Date(day.date))}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(day.revenue)}</TableCell>
                      <TableCell className="text-right text-green-600">{formatCurrency(day.grossProfit)}</TableCell>
                      <TableCell className="text-right text-red-600">
                        {day.expense > 0 ? formatCurrency(day.expense) : <Minus className="h-4 w-4 inline text-muted-foreground/40" />}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {day.netProfit > 0 ? (
                            <TrendingUp className="h-3 w-3 text-blue-600" />
                          ) : day.netProfit < 0 ? (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          ) : null}
                          <span className={`font-semibold ${day.netProfit > 0 ? 'text-blue-700' : day.netProfit < 0 ? 'text-red-700' : 'text-muted-foreground'}`}>
                            {formatCurrency(day.netProfit)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">{formatNumber(day.transactionsCount)}</TableCell>
                      <TableCell className="text-center">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                          onClick={() => setSelectedDate(day.date)}
                        >
                          <Eye className="h-4 w-4 text-[#1F4E79]" />
                          <span className="sr-only">Rincian</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ))}

      <DayDetailDialog 
        date={selectedDate} 
        onClose={() => setSelectedDate(null)} 
      />
    </div>
  );
}
