'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  itemId?: string;
}

export function ItemFormDialog({ open, onOpenChange, onSuccess, itemId }: ItemFormDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<'FOOD' | 'DRINK' | 'SNACK' | ''>('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [recommendedStock, setRecommendedStock] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');

  useEffect(() => {
    if (open && itemId) {
      Promise.resolve().then(() => {
        setLoading(true);
        setError('');
      });
      fetch(`/api/item/${itemId}`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            const data = res.data;
            setName(data.name);
            setCategory(data.category);
            setCostPrice(String(data.costPrice));
            setSellingPrice(String(data.sellingPrice));
            setRecommendedStock(String(data.recommendedStock));
            setDisplayOrder(String(data.displayOrder));
          } else {
            setError(res.message || 'Gagal memuat data barang.');
          }
          setLoading(false);
        })
        .catch(() => {
          setError('Terjadi kesalahan jaringan.');
          setLoading(false);
        });
    } else if (open) {
      Promise.resolve().then(() => {
        setName('');
        setCategory('');
        setCostPrice('');
        setSellingPrice('');
        setRecommendedStock('');
        setDisplayOrder('');
        setError('');
      });
    }
  }, [open, itemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedCost = parseInt(costPrice, 10);
    const parsedSelling = parseInt(sellingPrice, 10);
    const parsedStock = recommendedStock === '' ? 0 : parseInt(recommendedStock, 10);
    const parsedOrder = displayOrder === '' ? 0 : parseInt(displayOrder, 10);

    if (!name.trim()) return setError('Nama barang tidak boleh kosong.');
    if (!category) return setError('Kategori harus dipilih.');
    if (isNaN(parsedCost) || parsedCost < 0) return setError('Harga modal tidak valid.');
    if (isNaN(parsedSelling) || parsedSelling < parsedCost) {
      return setError('Harga jual tidak boleh lebih kecil dari harga modal.');
    }
    if (isNaN(parsedStock) || parsedStock < 0) return setError('Recommended stock tidak valid.');
    if (isNaN(parsedOrder)) return setError('Display order tidak valid.');

    setSaving(true);
    const url = itemId ? `/api/item/${itemId}` : '/api/item';
    const method = itemId ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          costPrice: parsedCost,
          sellingPrice: parsedSelling,
          recommendedStock: parsedStock,
          displayOrder: parsedOrder,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Berhasil',
          message: itemId ? 'Master barang berhasil diperbarui.' : 'Master barang baru berhasil ditambahkan.',
          variant: 'success',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        setError(data.message || 'Gagal menyimpan data barang.');
        toast({ title: 'Gagal', message: data.message || 'Gagal menyimpan barang.', variant: 'error' });
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
      toast({ title: 'Kesalahan Jaringan', message: 'Tidak dapat menghubungi server.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{itemId ? 'Edit Barang' : 'Tambah Barang Baru'}</DialogTitle>
          <DialogDescription>
            Isi formulir berikut untuk {itemId ? 'mengubah' : 'menambahkan'} master barang.
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
              <Label htmlFor="itemName">Nama Barang</Label>
              <Input
                id="itemName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Nasi Katsu"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as 'FOOD' | 'DRINK' | 'SNACK')}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOOD">Makanan (FOOD)</SelectItem>
                  <SelectItem value="DRINK">Minuman (DRINK)</SelectItem>
                  <SelectItem value="SNACK">Camilan (SNACK)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Harga Modal</Label>
                <Input
                  id="costPrice"
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                  placeholder="Rp"
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Harga Jual</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  value={sellingPrice}
                  onChange={(e) => setSellingPrice(e.target.value)}
                  placeholder="Rp"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recommendedStock">Recommended Stock</Label>
                <Input
                  id="recommendedStock"
                  type="number"
                  value={recommendedStock}
                  onChange={(e) => setRecommendedStock(e.target.value)}
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  disabled={saving}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
                Batal
              </Button>
              <Button type="submit" disabled={saving} className="bg-[#1F4E79] hover:bg-[#153552]">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
