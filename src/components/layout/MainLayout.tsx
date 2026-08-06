'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastProvider } from '@/components/ui/toast';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse sidebar on smaller screens or restore preference
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background">
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
        <div
          className={`transition-all duration-300 ${
            collapsed ? 'lg:pl-20' : 'lg:pl-64'
          } pl-0`}
        >
          <Navbar onMobileOpen={() => setMobileOpen(true)} />
          <main className="min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
