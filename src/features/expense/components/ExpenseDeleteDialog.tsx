'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ExpenseDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  expenseId?: string;
  expenseTitle?: string;
}

export function ExpenseDeleteDialog({
  open,
  onOpenChange,
  onSuccess,
  expenseId,
  expenseTitle,
}: ExpenseDeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDelete = async () => {
    if (!expenseId) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/expense/${expenseId}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        onSuccess();
        onOpenChange(false);
      } else {
        setError(data.message || 'Gagal menghapus pengeluaran.');
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-destructive">Hapus Pengeluaran?</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak akan menghapus data secara permanen, tetapi akan menyembunyikan data
            <span className="font-semibold text-foreground"> {expenseTitle} </span> 
            dari laporan operasional.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Batal
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Ya, Hapus Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
