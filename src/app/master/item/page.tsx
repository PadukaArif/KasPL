'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ItemFormDialog } from '@/features/item/components/ItemFormDialog';
import { ItemDeleteDialog } from '@/features/item/components/ItemDeleteDialog';
import { Loader2, Plus, Search, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

interface Item {
  id: string;
  publicId: string;
  name: string;
  category: 'FOOD' | 'DRINK' | 'SNACK';
  costPrice: number;
  sellingPrice: number;
  recommendedStock: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export default function MasterItemPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [formOpen, setFormOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>(undefined);
  
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string | undefined>(undefined);
  const [deleteItemName, setDeleteItemName] = useState<string | undefined>(undefined);

  const fetchItems = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category && category !== 'ALL') params.append('category', category);
    params.append('page', String(page));
    params.append('limit', String(limit));

    fetch(`/api/item?${params.toString()}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setItems(res.data.items);
          setTotal(res.data.total);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [search, category, page, limit]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchItems();
    });
  }, [fetchItems]);

  const handleCreate = () => {
    setSelectedItemId(undefined);
    setFormOpen(true);
  };

  const handleEdit = (id: string) => {
    setSelectedItemId(id);
    setFormOpen(true);
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteItemId(id);
    setDeleteItemName(name);
    setDeleteOpen(true);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Master Barang</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar produk penjualan harian kelas Anda.</p>
        </div>
        <Button onClick={handleCreate} className="bg-[#1F4E79] hover:bg-[#153552]">
          <Plus className="mr-2 h-4 w-4" /> Tambah Barang
        </Button>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau ID barang..."
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
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Semua Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Semua Kategori</SelectItem>
                  <SelectItem value="FOOD">Makanan (FOOD)</SelectItem>
                  <SelectItem value="DRINK">Minuman (DRINK)</SelectItem>
                  <SelectItem value="SNACK">Camilan (SNACK)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
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
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F5F7FA]">
                  <TableHead className="w-[120px] font-semibold text-[#1F4E79]">ID</TableHead>
                  <TableHead className="font-semibold text-[#1F4E79]">Nama Barang</TableHead>
                  <TableHead className="w-[120px] font-semibold text-[#1F4E79]">Kategori</TableHead>
                  <TableHead className="w-[140px] text-right font-semibold text-[#1F4E79]">Harga Modal</TableHead>
                  <TableHead className="w-[140px] text-right font-semibold text-[#1F4E79]">Harga Jual</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold text-[#1F4E79]">Stock</TableHead>
                  <TableHead className="w-[100px] text-center font-semibold text-[#1F4E79]">Order</TableHead>
                  <TableHead className="w-[100px] text-right font-semibold text-[#1F4E79]">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Tidak ada barang ditemukan.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.publicId}</TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs font-medium">
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(item.costPrice)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(item.sellingPrice)}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{item.recommendedStock}</TableCell>
                      <TableCell className="text-center font-mono text-sm">{item.displayOrder}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item.id)} className="h-8 w-8">
                            <Edit2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(item.id, item.name)} className="h-8 w-8 hover:bg-destructive/10">
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
                disabled={page === 1 || loading}
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
                disabled={page === totalPages || loading}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSuccess={fetchItems}
        itemId={selectedItemId}
      />

      <ItemDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onSuccess={fetchItems}
        itemId={deleteItemId}
        itemName={deleteItemName}
      />
    </div>
  );
}
