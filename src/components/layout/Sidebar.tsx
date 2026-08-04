import Link from 'next/link';
import { LayoutDashboard, ShoppingCart, Package, Settings, Receipt, ClipboardList } from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'POS (Kasir)', href: '/pos', icon: ShoppingCart },
  { name: 'Produk', href: '/master/item', icon: Package },
  { name: 'Stok Harian', href: '/inventory/prepare', icon: ClipboardList },
  { name: 'Pengeluaran', href: '/expense', icon: Receipt },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r border-border bg-sidebar px-4 pb-4 pt-6 text-sidebar-foreground">
      <div className="flex h-full flex-col gap-6">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-bold">K</span>
          </div>
          <span className="text-xl font-bold tracking-tight">KasPL</span>
        </div>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-4 w-4" />
            Pengaturan
          </Link>
        </div>
      </div>
    </aside>
  );
}
