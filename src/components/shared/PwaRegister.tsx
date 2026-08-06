'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function PwaRegister() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof window !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  useEffect(() => {
    // 1. Service Worker Registration
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[PWA] Service Worker registered with scope:', reg.scope);
            }
          })
          .catch((err) => {
            console.error('[PWA] Service Worker registration failed:', err);
          });
      });
    }

    // 2. Online / Offline Network Status Monitoring
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-3 rounded-lg bg-amber-600 px-4 py-3 text-white shadow-xl animate-in fade-in slide-in-from-bottom-5"
    >
      <WifiOff className="h-5 w-5 shrink-0" />
      <div className="text-xs sm:text-sm">
        <p className="font-semibold">Mode Offline</p>
        <p className="opacity-90">Koneksi terputus. POS dan data real-time memerlukan internet.</p>
      </div>
    </div>
  );
}
