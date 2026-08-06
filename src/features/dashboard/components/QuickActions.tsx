import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, ClipboardList, Wallet, Lock, FileText, Zap } from 'lucide-react';

export function QuickActions() {
  const actions = [
    {
      name: 'POS (Kasir)',
      description: 'Mulai transaksi kasir baru',
      href: '/pos',
      icon: ShoppingCart,
      color: 'bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20',
    },
    {
      name: 'Stok Harian',
      description: 'Persiapkan stok barang hari ini',
      href: '/inventory/prepare',
      icon: ClipboardList,
      color: 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
    },
    {
      name: 'Catat Pengeluaran',
      description: 'Input biaya operasional kelas',
      href: '/expense',
      icon: Wallet,
      color: 'bg-amber-500/10 text-amber-700 hover:bg-amber-500/20',
    },
    {
      name: 'Tutup Sesi & Profit',
      description: 'Lakukan penutupan dan hitung share',
      href: '/closing',
      icon: Lock,
      color: 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20',
    },
    {
      name: 'Laporan Keuangan',
      description: 'Lihat rekapitulasi performa',
      href: '/report',
      icon: FileText,
      color: 'bg-slate-500/10 text-slate-700 hover:bg-slate-500/20',
    },
  ];

  return (
    <Card className="border-border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2 text-[#1F4E79]">
          <Zap className="h-5 w-5 fill-amber-400 text-amber-500" />
          <CardTitle className="text-base font-semibold">Aksi Cepat (Quick Actions)</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <Link
                key={act.name}
                href={act.href}
                className={`flex flex-col items-center justify-center text-center p-4 rounded-xl transition-all border border-border/50 ${act.color}`}
              >
                <Icon className="h-6 w-6 mb-2" />
                <span className="text-xs font-bold leading-tight">{act.name}</span>
                <span className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{act.description}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
