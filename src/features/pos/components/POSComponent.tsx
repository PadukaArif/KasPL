'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertTriangle, Search, Plus, Minus, Trash2, ShoppingCart } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { POSItemSnapshot, POSCartItem } from '../types/pos.types';
import { CheckoutDialog } from '@/features/transaction/components/CheckoutDialog';

export function POSComponent() {
  const [items, setItems] = useState<POSItemSnapshot[]>([]);
  const [cart, setCart] = useState<POSCartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/pos/items');
      const data = await res.json();
      if (data.success) {
        setItems(data.data);
      } else {
        setError(data.error || 'Gagal memuat barang POS.');
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadItems();
    });
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = item.itemName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [items, searchQuery, categoryFilter]);

  const addToCart = (item: POSItemSnapshot) => {
    if (item.remainingStock <= 0) return;

    setCart((prevCart) => {
      const existing = prevCart.find((c) => c.inventoryId === item.id);
      if (existing) {
        if (existing.quantity >= item.remainingStock) return prevCart;
        return prevCart.map((c) =>
          c.inventoryId === item.id
            ? { ...c, quantity: c.quantity + 1, subtotal: (c.quantity + 1) * c.sellingPrice }
            : c
        );
      } else {
        return [
          ...prevCart,
          {
            inventoryId: item.id,
            itemPublicId: item.itemPublicId,
            itemName: item.itemName,
            sellingPrice: item.sellingPrice,
            quantity: 1,
            subtotal: item.sellingPrice,
          },
        ];
      }
    });
  };

  const updateQuantity = (inventoryId: string, delta: number) => {
    const itemStock = items.find((i) => i.id === inventoryId)?.remainingStock || 0;
    
    setCart((prevCart) => {
      return prevCart.map((c) => {
        if (c.inventoryId === inventoryId) {
          const newQty = c.quantity + delta;
          if (newQty > itemStock || newQty < 1) return c;
          return { ...c, quantity: newQty, subtotal: newQty * c.sellingPrice };
        }
        return c;
      });
    });
  };

  const removeFromCart = (inventoryId: string) => {
    setCart((prev) => prev.filter((c) => c.inventoryId !== inventoryId));
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.subtotal, 0);
  }, [cart]);

  const handleCheckoutSuccess = () => {
    setCart([]);
    loadItems(); // Refresh inventory snapshot
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-[#1F4E79]" />
          <span className="text-muted-foreground">Memuat sistem POS...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-md border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <CardTitle>POS Error</CardTitle>
          </div>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      {/* Kiri: Daftar Barang */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Point of Sale</h1>
          <p className="text-sm text-muted-foreground">Pilih barang untuk ditambahkan ke keranjang.</p>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Cari barang..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-1 overflow-x-auto">
            {['ALL', 'FOOD', 'DRINK', 'SNACK'].map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? 'default' : 'outline'}
                className={categoryFilter === cat ? 'bg-[#1F4E79] hover:bg-[#153552]' : ''}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat === 'ALL' ? 'Semua' : cat}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredItems.map((item) => {
              const isOutOfStock = item.remainingStock <= 0;
              return (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${isOutOfStock ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#1F4E79]'}`}
                  onClick={() => !isOutOfStock && addToCart(item)}
                >
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2">
                    <div className="font-semibold text-[#1F4E79] leading-tight line-clamp-2 min-h-[2.5rem]">
                      {item.itemName}
                    </div>
                    <div className="text-sm font-mono font-medium text-emerald-600">
                      {formatCurrency(item.sellingPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Stok: {item.remainingStock} Pcs
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                Tidak ada barang yang ditemukan.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Kanan: Keranjang */}
      <Card className="w-full lg:w-[400px] flex flex-col h-full shrink-0 shadow-sm border-border">
        <CardHeader className="border-b bg-[#F5F7FA] px-4 py-3 shrink-0">
          <div className="flex items-center gap-2 text-[#1F4E79]">
            <ShoppingCart className="h-5 w-5" />
            <CardTitle className="text-lg">Keranjang</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-0">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
              <ShoppingCart className="h-12 w-12 mb-2 opacity-20" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {cart.map((item) => (
                <div key={item.inventoryId} className="p-4 flex flex-col gap-2 hover:bg-muted/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-sm text-[#1F4E79]">{item.itemName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{formatCurrency(item.sellingPrice)}</div>
                    </div>
                    <div className="font-mono text-sm font-semibold">{formatCurrency(item.subtotal)}</div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center border rounded-md">
                      <button 
                        className="px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => updateQuantity(item.inventoryId, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        className="px-2 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        onClick={() => updateQuantity(item.inventoryId, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    
                    <button 
                      className="p-1.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      onClick={() => removeFromCart(item.inventoryId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <div className="border-t bg-[#F5F7FA] p-4 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <span className="font-medium text-muted-foreground">Total Tagihan</span>
            <span className="text-xl font-bold font-mono text-[#1F4E79]">{formatCurrency(cartTotal)}</span>
          </div>
          
          <Button 
            className="w-full bg-[#1F4E79] hover:bg-[#153552] h-12 text-md"
            disabled={cart.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            Lanjut Pembayaran
          </Button>
        </div>
      </Card>

      <CheckoutDialog 
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cart={cart}
        totalAmount={cartTotal}
        onCheckoutSuccess={handleCheckoutSuccess}
      />
    </div>
  );
}
