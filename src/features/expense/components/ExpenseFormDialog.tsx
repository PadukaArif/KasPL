'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  expenseId?: string;
  isSessionClosed?: boolean;
}

export function ExpenseFormDialog({ open, onOpenChange, onSuccess, expenseId, isSessionClosed = false }: ExpenseFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'OPERATIONAL' | 'RAW_MATERIAL' | 'EQUIPMENT' | 'OTHER' | ''>('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [expenseDate, setExpenseDate] = useState('');

  useEffect(() => {
    if (open && expenseId) {
      Promise.resolve().then(() => {
        setLoading(true);
        setError('');
      });
      fetch(`/api/expense/${expenseId}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            const data = res.data;
            setTitle(data.title);
            setCategory(data.category);
            setAmount(String(data.amount));
            setNotes(data.notes || '');
            
            if (data.expenseDate) {
              const dateObj = new Date(data.expenseDate);
              const year = dateObj.getFullYear();
              const month = String(dateObj.getMonth() + 1).padStart(2, '0');
              const day = String(dateObj.getDate()).padStart(2, '0');
              setExpenseDate(`${year}-${month}-${day}`);
            }
          } else {
            setError(res.message || 'Gagal memuat data pengeluaran.');
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Terjadi kesalahan jaringan.');
          setLoading(false);
        });
    } else if (open) {
      Promise.resolve().then(() => {
        setTitle('');
        setCategory('');
        setAmount('');
        setNotes('');
        
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        setExpenseDate(`${year}-${month}-${day}`);
        
        setError('');
      });
    }
  }, [open, expenseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSessionClosed || saving) return;
    
    setError('');

    const parsedAmount = parseInt(amount, 10);

    if (!title.trim()) return setError('Nama pengeluaran tidak boleh kosong.');
    if (!category) return setError('Kategori harus dipilih.');
    if (isNaN(parsedAmount) || parsedAmount <= 0) return setError('Nominal harus lebih dari 0.');

    setSaving(true);
    const url = expenseId ? `/api/expense/${expenseId}` : '/api/expense';
    const method = expenseId ? 'PATCH' : 'POST';

    let apiDate = undefined;
    if (expenseDate) {
      const d = new Date(`${expenseDate}T12:00:00Z`);
      if (!isNaN(d.getTime())) {
        apiDate = d.toISOString();
      }
    }

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          category,
          amount: parsedAmount,
          notes: notes.trim() || undefined,
          expenseDate: apiDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Berhasil',
          message: expenseId ? 'Catatan pengeluaran berhasil diperbarui.' : 'Pengeluaran operasional baru berhasil dicatat.',
          variant: 'success',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        setError(data.message || 'Gagal menyimpan data pengeluaran.');
        toast({ title: 'Gagal', message: data.message || 'Gagal menyimpan pengeluaran.', variant: 'error' });
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
      toast({ title: 'Kesalahan Jaringan', message: 'Gagal terhubung ke server.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = saving || isSessionClosed;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{expenseId ? 'Edit Pengeluaran' : 'Tambah Pengeluaran'}</DialogTitle>
          <DialogDescription>
            {isSessionClosed 
              ? 'Sesi penjualan telah ditutup. Pengeluaran hanya bisa dilihat.' 
              : `Isi formulir berikut untuk ${expenseId ? 'mengubah' : 'mencatat'} pengeluaran operasional.`}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Nama Pengeluaran</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Beli Es Batu, Galon, Sedotan..."
                disabled={isDisabled}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as 'OPERATIONAL' | 'RAW_MATERIAL' | 'EQUIPMENT' | 'OTHER')} disabled={isDisabled}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPERATIONAL">Operasional (OPERATIONAL)</SelectItem>
                  <SelectItem value="RAW_MATERIAL">Bahan Baku (RAW_MATERIAL)</SelectItem>
                  <SelectItem value="EQUIPMENT">Peralatan (EQUIPMENT)</SelectItem>
                  <SelectItem value="OTHER">Lainnya (OTHER)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Nominal</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Rp"
                  disabled={isDisabled}
                  min="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseDate">Tanggal</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  disabled={isDisabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tambahkan keterangan lebih lanjut jika perlu..."
                disabled={isDisabled}
                rows={3}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {isSessionClosed ? 'Tutup' : 'Batal'}
              </Button>
              {!isSessionClosed && (
                <Button type="submit" disabled={isDisabled} className="bg-[#1F4E79] hover:bg-[#153552]">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simpan
                </Button>
              )}
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
