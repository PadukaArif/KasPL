'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartData, CategoryData } from '../types/dashboard.types';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/utils/formatters';

interface DashboardChartsProps {
  dailyTrend: ChartData[];
  salesByCategory: CategoryData[];
  expenseByCategory: CategoryData[];
}

const CATEGORY_COLORS: Record<string, string> = {
  FOOD: '#F59E0B',
  DRINK: '#3B82F6',
  SNACK: '#10B981',
  OPERATIONAL: '#6366F1',
  RAW_MATERIAL: '#8B5CF6',
  EQUIPMENT: '#EC4899',
  OTHER: '#64748B'
};

const CATEGORY_LABELS: Record<string, string> = {
  FOOD: 'Makanan',
  DRINK: 'Minuman',
  SNACK: 'Cemilan',
  OPERATIONAL: 'Operasional',
  RAW_MATERIAL: 'Bahan Baku',
  EQUIPMENT: 'Peralatan',
  OTHER: 'Lainnya'
};

const CustomTooltip = ({ active, payload, label }: { active?: boolean, payload?: Record<string, unknown>[], label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-border shadow-md rounded-md text-sm">
        <p className="font-semibold mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: String(entry.color) }} />
            <span className="text-muted-foreground">{String(entry.name)}:</span>
            <span className="font-medium">{String(entry.name).includes('Transaksi') ? String(entry.value) : formatCurrency(Number(entry.value))}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const formatYAxis = (tickItem: number) => {
  if (tickItem >= 1000000) return `${(tickItem / 1000000).toFixed(1)}M`;
  if (tickItem >= 1000) return `${(tickItem / 1000).toFixed(1)}k`;
  return tickItem.toString();
};

export function DashboardCharts({ dailyTrend, salesByCategory, expenseByCategory }: DashboardChartsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="col-span-1 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg text-[#1F4E79]">Trend Pendapatan & Laba (7 Hari Terakhir)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyTrend} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} tickMargin={10} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="revenue" name="Pendapatan" stroke="#1F4E79" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="profit" name="Laba Kotor" stroke="#10B981" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="expense" name="Pengeluaran" stroke="#EF4444" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#1F4E79]">Penjualan per Kategori</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[250px] w-full max-w-[300px]">
            {salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={salesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {salesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#ccc'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: unknown) => formatCurrency(Number(value) || 0)} labelFormatter={() => ''} />
                  <Legend 
                    formatter={(value: string, entry: { payload?: { category?: string } }) => {
                      const category = entry?.payload?.category || value;
                      return CATEGORY_LABELS[category] || category;
                    }} 
                    wrapperStyle={{ fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Belum ada data penjualan
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#1F4E79]">Pengeluaran per Kategori</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <div className="h-[250px] w-full max-w-[300px]">
            {expenseByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#ccc'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: unknown) => formatCurrency(Number(value) || 0)} labelFormatter={() => ''} />
                  <Legend 
                    formatter={(value: string, entry: { payload?: { category?: string } }) => {
                      const category = entry?.payload?.category || value;
                      return CATEGORY_LABELS[category] || category;
                    }} 
                    wrapperStyle={{ fontSize: '12px' }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Belum ada data pengeluaran
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
