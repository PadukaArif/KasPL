'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExpenseFormDialog } from '@/features/expense/components/ExpenseFormDialog';
import { ExpenseDeleteDialog } from '@/features/expense/components/ExpenseDeleteDialog';
import { Loader2, Plus, Search, Edit2, Trash2, Receipt, TrendingUp, Calendar, CreditCard, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useExpenses, useExpenseSummary } from '@/features/expense/hooks/useExpense';

const CATEGORY_COLORS: Record<string, string> = {
  OPERATIONAL: 'bg-blue-100 text-blue-800',
  RAW_MATERIAL: 'bg-green-100 text-green-800',
  EQUIPMENT: 'bg-orange-100 text-orange-800',
  OTHER: 'bg-gray-100 text-gray-800',
};

const CATEGORY_LABELS: Record<string, string> = {
  OPERATIONAL: 'Operasional',
  RAW_MATERIAL: 'Bahan Baku',
  EQUIPMENT: 'Peralatan',
  OTHER: 'Lainnya',
};

export default function ExpensePage() {
  const { expenses, total, loading: expensesLoading, error: expensesError, fetchExpenses } = useExpenses();
  const { summary, loading: summaryLoading, error: summaryError, fetchSummary } = useExpenseSummary();

  const [sessionActive, setSessionActive] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | undefined>(undefined);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteExpenseId, setDeleteExpenseId] = useState<string | undefined>(undefined);
  const [deleteExpenseTitle, setDeleteExpenseTitle] = useState<string | undefined>(undefined);

  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/session/active');
      const data = await res.json();
      setSessionActive(data.success && !!data.data);
    } catch {
      setSessionActive(false);
    } finally {
      setSessionLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      checkSession();
    });
  }, [checkSession]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchExpenses({ search, category, startDate, endDate, page, limit });
      fetchSummary();
    });
  }, [fetchExpenses, fetchSummary, search, category, startDate, endDate, page, limit]);

  const refreshAll = () => {
    fetchExpenses({ search, category, startDate, endDate, page, limit });
    fetchSummary();
  };

  const handleCreate = () => {
    setSelectedExpenseId(undefined);
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedExpenseId(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteExpenseId(id);
    setDeleteExpenseTitle(title);
    setDeleteOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Pengeluaran Operasional</h1>
          <p className="text-sm text-muted-foreground">Catat dan kelola pengeluaran harian kelas Anda.</p>
        </div>
        <Button 
          onClick={handleCreate} 
          disabled={sessionLoading || !sessionActive}
          className="bg-[#1F4E79] hover:bg-[#153552]"
        >
          <Plus className="mr-2 h-4 w-4" /> 
          {sessionLoading ? 'Memeriksa sesi...' : !sessionActive ? 'Sesi Tutup' : 'Tambah Pengeluaran'}
        </Button>
      </div>

      {summaryError && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>{summaryError}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hari Ini</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(summary.today)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minggu Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(summary.thisWeek)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesi Aktif</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{formatCurrency(summary.activeSession)}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Data Sesi Ini</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-2xl font-bold">{summary.count} Transaksi</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama pengeluaran..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8"
                />
              </div>
              <Select
                value={category}
                onValueChange={(v) => {
                  setCategory(v || 'ALL');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kategori</SelectItem>
                  <SelectItem value="OPERATIONAL">Operasional</SelectItem>
                  <SelectItem value="RAW_MATERIAL">Bahan Baku</SelectItem>
                  <SelectItem value="EQUIPMENT">Peralatan</SelectItem>
                  <SelectItem value="OTHER">Lainnya</SelectItem>
                </SelectContent>
              </Select>
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
            </div>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              <span className="text-xs text-muted-foreground">Tampilkan:</span>
              <Select
                value={String(limit)}
                onValueChange={(v) => {
                  setLimit(parseInt(v || '10', 10));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {expensesError && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>{expensesError}</p>
            </div>
          )}
          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F5F7FA]">
                  <TableHead className="w-[140px] font-semibold text-[#1F4E79]">Tanggal</TableHead>
                  <TableHead className="font-semibold text-[#1F4E79]">Nama Pengeluaran</TableHead>
                  <TableHead className="w-[140px] font-semibold text-[#1F4E79]">Kategori</TableHead>
                  <TableHead className="w-[150px] text-right font-semibold text-[#1F4E79]">Nominal</TableHead>
                  <TableHead className="w-[200px] font-semibold text-[#1F4E79]">Catatan</TableHead>
                  <TableHead className="w-[100px] text-right font-semibold text-[#1F4E79]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expensesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : expenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Tidak ada pengeluaran ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="font-medium text-sm">
                        {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(expense.expenseDate))}
                      </TableCell>
                      <TableCell className="font-medium">{expense.title}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${CATEGORY_COLORS[expense.category]}`}>
                          {CATEGORY_LABELS[expense.category]}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-semibold text-red-600">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {expense.notes || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEdit(expense.id)} 
                            className="h-8 w-8"
                            disabled={!sessionActive}
                          >
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteClick(expense.id, expense.title)} 
                            className="h-8 w-8 hover:bg-destructive/10"
                            disabled={!sessionActive}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-end gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1 || expensesLoading}
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
                disabled={page === totalPages || expensesLoading}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={refreshAll}
        expenseId={selectedExpenseId}
        isSessionClosed={!sessionActive}
      />

      <ExpenseDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={refreshAll}
        expenseId={deleteExpenseId}
        expenseTitle={deleteExpenseTitle}
      />
    </div>
  );
}
