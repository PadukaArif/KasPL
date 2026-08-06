'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NavbarProps {
  onMobileOpen: () => void;
}

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard Analytics',
  '/pos': 'Point of Sale (Kasir)',
  '/transaction': 'Riwayat Transaksi',
  '/master/item': 'Master Barang',
  '/inventory/prepare': 'Persiapan Stok Harian',
  '/expense': 'Pengeluaran Operasional',
  '/report': 'Laporan Keuangan',
  '/session/start': 'Mulai Sesi Penjualan',
  '/closing': 'Penutupan Sesi & Bagi Hasil',
  '/master/member': 'Data Anggota Kelas',
  '/settings': 'Pengaturan Sistem',
  '/export/print': 'Cetak & Ekspor Laporan',
};

export function Navbar({ onMobileOpen }: NavbarProps) {
  const pathname = usePathname();
  const [activeSession, setActiveSession] = useState<{ publicId: string; guardians: string[] } | null>(null);

  useEffect(() => {
    let mounted = true;
    fetch('/api/session/active')
      .then((res) => res.json())
      .then((json) => {
        if (mounted && json.success && json.data) {
          setActiveSession({
            publicId: json.data.publicId,
            guardians: (json.data.guardians || []).map((g: { name?: string }) => g.name || ''),
          });
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [pathname]);

  const currentTitle = ROUTE_TITLES[pathname] || 'KasPL Kantin';

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-background/95 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMobileOpen}
          className="lg:hidden h-9 w-9 text-muted-foreground hover:bg-muted"
          aria-label="Buka Menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-base md:text-lg font-bold tracking-tight text-[#1F4E79] line-clamp-1">
          {currentTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {activeSession ? (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 hidden sm:flex items-center gap-1.5 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-semibold">{activeSession.publicId}</span>
            </Badge>
          </div>
        ) : (
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 hidden sm:flex items-center gap-1.5 px-3 py-1">
            <Clock className="h-3 w-3 text-amber-600" />
            <span className="text-xs font-medium">Sesi Tutup</span>
          </Badge>
        )}
      </div>
    </header>
  );
}
