'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  ClipboardList,
  Wallet,
  FileText,
  Clock,
  Lock,
  Users,
  Settings,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
  Store,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const menuGroups = [
  {
    title: 'Utama',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Penjualan',
    items: [
      { name: 'POS (Kasir)', href: '/pos', icon: ShoppingCart },
      { name: 'Riwayat Transaksi', href: '/transaction', icon: Receipt },
    ],
  },
  {
    title: 'Inventaris',
    items: [
      { name: 'Master Barang', href: '/master/item', icon: Package },
      { name: 'Stok Harian', href: '/inventory/prepare', icon: ClipboardList },
    ],
  },
  {
    title: 'Keuangan',
    items: [
      { name: 'Pengeluaran', href: '/expense', icon: Wallet },
      { name: 'Laporan', href: '/report', icon: FileText },
    ],
  },
  {
    title: 'Sesi & Penutupan',
    items: [
      { name: 'Sesi Penjualan', href: '/session/start', icon: Clock },
      { name: 'Tutup Sesi & Profit', href: '/closing', icon: Lock },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { name: 'Anggota Kelas', href: '/master/member', icon: Users },
      { name: 'Keamanan Device', href: '/admin', icon: ShieldCheck },
      { name: 'Pengaturan', href: '/settings', icon: Settings },
    ],
  },
];

export function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const isLinkActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1F4E79] text-white shadow-sm transition-transform hover:scale-105">
              <Store className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-[#1F4E79]">KasPL</span>
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Kantin Sekolah</span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="hidden lg:flex h-8 w-8 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            title={collapsed ? 'Perluas Sidebar' : 'Ciutkan Sidebar'}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {/* Mobile Close Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMobileClose}
            className="lg:hidden h-8 w-8 text-muted-foreground hover:bg-sidebar-accent"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Menu Groups */}
        <nav className="space-y-6 overflow-y-auto max-h-[calc(100vh-10rem)] pr-1">
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => {
                const active = isLinkActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                      active
                        ? 'bg-[#1F4E79] text-white shadow-sm hover:bg-[#153552]'
                        : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-muted-foreground'}`} />
                    {!collapsed && <span>{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Footer Branding */}
      {!collapsed && (
        <div className="pt-4 border-t border-border px-2 text-xs text-muted-foreground text-center">
          <p className="font-medium text-foreground">KasPL v1.0 Production</p>
          <p className="text-[10px]">Sistem Kasir Kantin Kelas</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-40 border-r border-border bg-sidebar transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-sidebar shadow-xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
}
