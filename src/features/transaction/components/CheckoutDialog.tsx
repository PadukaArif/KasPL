import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { CheckoutSuccessData } from '../types/transaction.types';

export interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: Array<{ inventoryId: string; itemName: string; sellingPrice: number; quantity: number; subtotal: number }>;
  totalAmount: number;
  onCheckoutSuccess: (result: CheckoutSuccessData) => void;
}

export function CheckoutDialog({ open, onOpenChange, cart, totalAmount, onCheckoutSuccess }: CheckoutDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState<CheckoutSuccessData | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');

    try {
      const today = new Date();
      // Format as YYYY-MM-DD local time
      const offset = today.getTimezoneOffset()
      const businessDate = new Date(today.getTime() - (offset*60*1000)).toISOString().split('T')[0];

      const payload = {
        businessDate,
        cart: cart.map(c => ({
          inventoryId: c.inventoryId,
          quantity: c.quantity,
        })),
      };

      const res = await fetch('/api/transaction/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccessData(data.data as CheckoutSuccessData);
      } else {
        setError(data.message || 'Gagal melakukan checkout.');
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (successData) {
      onCheckoutSuccess(successData);
      setSuccessData(null);
    }
    onOpenChange(false);
    setError('');
  };

  if (successData) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <CheckCircle className="h-6 w-6" />
              <DialogTitle className="text-xl">Checkout Berhasil!</DialogTitle>
            </div>
            <DialogDescription>
              Transaksi berhasil disimpan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="text-muted-foreground">No. Transaksi:</div>
              <div className="font-mono font-medium">{successData.transactionNumber}</div>
              <div className="text-muted-foreground">Total Item:</div>
              <div className="font-mono">{successData.totalItems} ({successData.totalQuantity} Pcs)</div>
              <div className="text-muted-foreground">Total Tagihan:</div>
              <div className="font-mono font-bold text-[#1F4E79]">{formatCurrency(successData.grossRevenue)}</div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleClose} className="w-full bg-[#1F4E79] hover:bg-[#153552]">
              Kembali ke POS
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Pembayaran</DialogTitle>
          <DialogDescription>
            Pastikan pesanan sudah benar sebelum memproses transaksi.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <div className="max-h-[40vh] overflow-y-auto rounded-md border p-2 space-y-2">
          {cart.map((item) => (
            <div key={item.inventoryId} className="flex justify-between text-sm">
              <div>
                <span className="font-medium text-[#1F4E79]">{item.itemName}</span>
                <span className="text-muted-foreground ml-2">x{item.quantity}</span>
              </div>
              <div className="font-mono">{formatCurrency(item.subtotal)}</div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <span className="font-semibold text-muted-foreground">Total Tagihan</span>
          <span className="text-xl font-bold font-mono text-[#1F4E79]">{formatCurrency(totalAmount)}</span>
        </div>

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Batal
          </Button>
          <Button onClick={handleConfirm} className="bg-[#1F4E79] hover:bg-[#153552]" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Proses Pembayaran
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
