'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Loader2, AlertTriangle, CheckCircle, Lock, LockKeyhole } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { useToast } from '@/hooks/use-toast';

interface ActiveSession {
  id: string;
  publicId: string;
  periodMonth: number;
  periodWeek: number;
  startDate: string;
  status: 'ACTIVE' | 'CLOSED';
}

interface MasterItem {
  id: string;
  publicId: string;
  name: string;
  category: 'FOOD' | 'DRINK' | 'SNACK';
  costPrice: number;
  sellingPrice: number;
  recommendedStock: number;
  displayOrder: number;
  isActive: boolean;
}

interface InventoryRecord {
  id: string;
  publicId: string;
  sessionId: string;
  itemId: string;
  itemPublicId: string;
  itemNameSnapshot: string;
  categorySnapshot: 'FOOD' | 'DRINK' | 'SNACK';
  costPriceSnapshot: number;
  sellingPriceSnapshot: number;
  displayOrderSnapshot: number;
  openingStock: number;
  remainingStock: number;
  soldQuantity: number;
  status: 'OPEN' | 'LOCKED' | 'CLOSED';
}

export function PrepareForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [masterItems, setMasterItems] = useState<MasterItem[]>([]);
  const [inventory, setInventory] = useState<InventoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [stocks, setStocks] = useState<Record<string, number>>({});
  const [editingStocks, setEditingStocks] = useState<Record<string, number>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const sessionRes = await fetch('/api/session/active');
      const sessionData = await sessionRes.json();
      
      if (!sessionData.success || !sessionData.data) {
        setSession(null);
        setLoading(false);
        return;
      }
      
      const activeSession = sessionData.data as ActiveSession;
      setSession(activeSession);

      const invRes = await fetch(`/api/inventory/session/${activeSession.id}`);
      const invData = await invRes.json();

      if (invData.success && invData.data && invData.data.length > 0) {
        const sortedInv = [...(invData.data as InventoryRecord[])].sort((a, b) => {
          const orderA = a.displayOrderSnapshot ?? 0;
          const orderB = b.displayOrderSnapshot ?? 0;
          if (orderA !== orderB) return orderA - orderB;
          return (a.itemNameSnapshot || '').localeCompare(b.itemNameSnapshot || '');
        });
        setInventory(sortedInv);
        const initialEditStocks: Record<string, number> = {};
        sortedInv.forEach((r) => {
          initialEditStocks[r.id] = r.openingStock;
        });
        setEditingStocks(initialEditStocks);
      } else {
        setInventory([]);
        const itemsRes = await fetch('/api/item?limit=1000');
        const itemsData = await itemsRes.json();
        if (itemsData.success) {
          const activeOnly = (itemsData.data.items as MasterItem[])
            .filter((i) => i.isActive)
            .sort((a, b) => {
              const orderA = a.displayOrder ?? 0;
              const orderB = b.displayOrder ?? 0;
              if (orderA !== orderB) return orderA - orderB;
              return a.name.localeCompare(b.name);
            });
          setMasterItems(activeOnly);
          const initialStocks: Record<string, number> = {};
          activeOnly.forEach((item) => {
            initialStocks[item.id] = item.recommendedStock;
          });
          setStocks(initialStocks);
        }
      }
    } catch {
      setError('Gagal memuat data dari server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, [loadData]);

  const handleStockChange = (itemId: string, val: string) => {
    const parsed = parseInt(val, 10);
    setStocks((prev) => ({
      ...prev,
      [itemId]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const handleEditStockChange = (invId: string, val: string) => {
    const parsed = parseInt(val, 10);
    setEditingStocks((prev) => ({
      ...prev,
      [invId]: isNaN(parsed) ? 0 : Math.max(0, parsed),
    }));
  };

  const handleInitializeSubmit = async () => {
    if (!session) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    const payload = {
      sessionId: session.id,
      items: Object.entries(stocks).map(([itemId, openingStock]) => ({
        itemId,
        openingStock,
      })),
    };

    try {
      const res = await fetch('/api/inventory/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Inventory berhasil diinisialisasi untuk hari ini!');
        toast({
          title: 'Berhasil',
          message: 'Inventory berhasil diinisialisasi untuk hari ini.',
          variant: 'success',
        });
        loadData();
      } else {
        setError(data.message || 'Gagal menginisialisasi inventory.');
        toast({ title: 'Gagal', message: data.message || 'Gagal menginisialisasi inventory.', variant: 'error' });
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
      toast({ title: 'Kesalahan Jaringan', message: 'Tidak dapat menghubungi server.', variant: 'error' });
    } finally {
      setSubmitting(false);
      setConfirmOpen(false);
    }
  };

  const handleUpdateStock = async (invId: string) => {
    const newStock = editingStocks[invId];
    if (newStock === undefined || newStock < 0) return;
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/inventory/${invId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ openingStock: newStock }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Opening stock berhasil diperbarui.');
        toast({
          title: 'Berhasil',
          message: 'Opening stock berhasil diperbarui.',
          variant: 'success',
        });
        loadData();
      } else {
        setError(data.message || 'Gagal memperbarui stock.');
        toast({ title: 'Gagal', message: data.message || 'Gagal memperbarui stock.', variant: 'error' });
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
      toast({ title: 'Kesalahan Jaringan', message: 'Tidak dapat menghubungi server.', variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#1F4E79]" />
          <span className="text-muted-foreground">Memuat data persiapan...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <Card className="mx-auto max-w-md border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <CardTitle>Sesi Belum Aktif</CardTitle>
          </div>
          <CardDescription>
            Persiapan stock harian hanya dapat diakses ketika ada sesi penjualan yang aktif.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => router.push('/session/start')} className="w-full bg-[#1F4E79] hover:bg-[#153552]">
            Mulai Sesi Sekarang
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isInitialized = inventory.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Persiapan Hari Ini</h1>
          <p className="text-sm text-muted-foreground">
            Kelola stok awal penjualan untuk Sesi Bulan {session.periodMonth}, Minggu {session.periodWeek}.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-800">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <p>{success}</p>
        </div>
      )}

      {!isInitialized ? (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Inisialisasi Stok Harian</CardTitle>
            <CardDescription>
              Input stok awal untuk semua barang yang akan dijual hari ini. Stok awal default diambil dari Recommended Stock.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {masterItems.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-6">
                Tidak ada barang aktif di master data. Silakan aktifkan barang terlebih dahulu di Master Barang.
              </p>
            ) : (
              <>
                <div className="rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#F5F7FA]">
                        <TableHead className="w-[80px] font-semibold text-[#1F4E79]">Urutan</TableHead>
                        <TableHead className="font-semibold text-[#1F4E79]">Nama Barang</TableHead>
                        <TableHead className="w-[120px] font-semibold text-[#1F4E79]">Kategori</TableHead>
                        <TableHead className="w-[120px] text-right font-semibold text-[#1F4E79]">Modal</TableHead>
                        <TableHead className="w-[120px] text-right font-semibold text-[#1F4E79]">Harga Jual</TableHead>
                        <TableHead className="w-[120px] text-center font-semibold text-[#1F4E79]">Recommended</TableHead>
                        <TableHead className="w-[150px] font-semibold text-[#1F4E79]">Opening Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {masterItems.map((item, idx) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                              {item.category}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono text-sm">{formatCurrency(item.costPrice)}</TableCell>
                          <TableCell className="text-right font-mono text-sm">{formatCurrency(item.sellingPrice)}</TableCell>
                          <TableCell className="text-center font-mono text-sm text-muted-foreground">
                            {item.recommendedStock} Pcs
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min="0"
                              value={stocks[item.id] ?? 0}
                              onChange={(e) => handleStockChange(item.id, e.target.value)}
                              className="w-24 font-mono text-sm"
                              disabled={submitting}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setConfirmOpen(true)} className="bg-[#1F4E79] hover:bg-[#153552]" disabled={submitting}>
                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Simpan & Mulai Penjualan
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Stok Penjualan Hari Ini</CardTitle>
                <CardDescription>
                  Stok awal yang sudah diinisialisasi. Stok hanya dapat diubah selama belum ada transaksi yang dikunci.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadData}
                  disabled={submitting || loading}
                  className="text-xs"
                >
                  Sinkronkan Stok
                </Button>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Inisialisasi Aktif
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F7FA]">
                    <TableHead className="w-[80px] font-semibold text-[#1F4E79]">Urutan</TableHead>
                    <TableHead className="font-semibold text-[#1F4E79]">Nama Barang</TableHead>
                    <TableHead className="w-[120px] font-semibold text-[#1F4E79]">Kategori</TableHead>
                    <TableHead className="w-[120px] text-right font-semibold text-[#1F4E79]">Harga Jual</TableHead>
                    <TableHead className="w-[120px] text-center font-semibold text-[#1F4E79]">Stok Awal</TableHead>
                    <TableHead className="w-[120px] text-center font-semibold text-[#1F4E79]">Sisa Stok</TableHead>
                    <TableHead className="w-[120px] text-center font-semibold text-[#1F4E79]">Terjual</TableHead>
                    <TableHead className="w-[120px] text-center font-semibold text-[#1F4E79]">Status</TableHead>
                    <TableHead className="w-[140px] text-right font-semibold text-[#1F4E79]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(() => {
                    const isSessionInventoryLocked = inventory.some((r) => r.status === 'LOCKED' || r.status === 'CLOSED');
                    return inventory.map((rec, idx) => {
                      const isLocked = rec.status === 'LOCKED' || rec.status === 'CLOSED' || isSessionInventoryLocked;
                      return (
                        <TableRow key={rec.id}>
                        <TableCell className="font-mono text-xs">{idx + 1}</TableCell>
                        <TableCell className="font-medium">
                          {rec.itemNameSnapshot}
                          <div className="text-xs text-muted-foreground font-mono">{rec.itemPublicId}</div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                            {rec.categorySnapshot}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">{formatCurrency(rec.sellingPriceSnapshot)}</TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {isLocked ? (
                            <span>{rec.openingStock} Pcs</span>
                          ) : (
                            <Input
                              type="number"
                              min="0"
                              value={editingStocks[rec.id] ?? 0}
                              onChange={(e) => handleEditStockChange(rec.id, e.target.value)}
                              className="w-20 font-mono text-sm mx-auto text-center"
                              disabled={submitting}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm font-semibold">{rec.remainingStock} Pcs</TableCell>
                        <TableCell className="text-center font-mono text-sm">{rec.soldQuantity} Pcs</TableCell>
                        <TableCell className="text-center">
                          <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${
                            rec.status === 'OPEN'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : rec.status === 'LOCKED'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-muted text-muted-foreground border'
                          }`}>
                            {rec.status === 'OPEN' && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                            {rec.status === 'LOCKED' && <Lock className="h-3 w-3 text-amber-500" />}
                            {rec.status === 'CLOSED' && <LockKeyhole className="h-3 w-3" />}
                            {rec.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {!isLocked && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdateStock(rec.id)}
                              disabled={submitting || editingStocks[rec.id] === rec.openingStock}
                            >
                              Update
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  });
                })()}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Konfirmasi Inisialisasi Stok</DialogTitle>
            <DialogDescription>
              Anda akan menginisialisasi stok harian untuk sesi ini. Stok awal tidak dapat diubah setelah ada transaksi penjualan yang sukses dikunci.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button onClick={handleInitializeSubmit} className="bg-[#1F4E79] hover:bg-[#153552]" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Ya, Inisialisasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
