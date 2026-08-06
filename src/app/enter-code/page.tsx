'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Store, ShieldCheck, Lock, AlertCircle, Laptop, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function EnterCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('from') || '/dashboard';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [deviceId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    let localId = localStorage.getItem('kaspl_device_id');
    if (!localId) {
      localId = 'dev-' + crypto.randomUUID();
      localStorage.setItem('kaspl_device_id', localId);
    }
    return localId;
  });

  const [deviceInfo] = useState<{ browser: string; platform: string }>(() => {
    if (typeof window === 'undefined') return { browser: 'Browser', platform: 'Desktop' };
    const ua = navigator.userAgent;
    let browser = 'Browser';
    let platform = 'Desktop';

    if (ua.includes('Firefox')) browser = 'Firefox';
    else if (ua.includes('Edg')) browser = 'Edge';
    else if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari')) browser = 'Safari';

    if (ua.includes('Android')) platform = 'Android';
    else if (ua.includes('iPhone') || ua.includes('iPad')) platform = 'iOS';
    else if (ua.includes('Windows')) platform = 'Windows';
    else if (ua.includes('Macintosh')) platform = 'macOS';
    else if (ua.includes('Linux')) platform = 'Linux';

    return { browser, platform };
  });

  useEffect(() => {
    // Check if already authorized
    fetch('/api/auth/verify')
      .then((res) => res.json())
      .then((data) => {
        if (data.authorized) {
          router.replace(redirectPath);
        }
      })
      .catch(() => {});
  }, [router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setErrorMsg('Masukkan kode akses harian.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await fetch('/api/auth/access-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          deviceId,
          platform: deviceInfo.platform,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || 'Otorisasi gagal. Silakan periksa kembali kode akses Anda.');
        setLoading(false);
        return;
      }

      // Save token to localStorage for additional offline/PWA compatibility
      if (data.data?.deviceToken) {
        localStorage.setItem('kaspl_device_token', data.data.deviceToken);
      }

      setSuccessMsg('Otorisasi berhasil! Mengalihkan ke aplikasi...');
      setTimeout(() => {
        router.replace(redirectPath);
      }, 800);
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 px-4 py-8 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1F4E79] text-white shadow-xl ring-4 ring-[#1F4E79]/30">
            <Store className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">KasPL Security</h1>
            <p className="text-sm text-slate-400">Authorized Device Access Control</p>
          </div>
        </div>

        {/* Card Form */}
        <Card className="border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 text-[#2E75B6]">
              <ShieldCheck className="h-5 w-5" />
              <CardTitle className="text-lg font-semibold">Masukkan Kode Akses Harian</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-400">
              Perangkat ini belum terdaftar. Minta kode akses hari ini kepada **ADMIN** untuk membuka aplikasi KasPL.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <Alert variant="destructive" className="border-red-900 bg-red-950/50 text-red-200">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-bold">Akses Ditolak</AlertTitle>
                  <AlertDescription className="text-xs">{errorMsg}</AlertDescription>
                </Alert>
              )}

              {successMsg && (
                <Alert className="border-emerald-900 bg-emerald-950/50 text-emerald-200">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <AlertTitle className="text-xs font-bold">Sukses</AlertTitle>
                  <AlertDescription className="text-xs">{successMsg}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-300">Kode Akses Harian</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    placeholder="Contoh: K7x9M2pQ"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="pl-9 font-mono tracking-widest text-center font-bold text-lg bg-slate-900 border-slate-700 text-white placeholder:text-slate-600 focus:border-[#2E75B6] uppercase"
                    maxLength={12}
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Kode peka huruf besar/kecil & berlaku khusus untuk 1 perangkat hari ini.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !code.trim()}
                className="w-full bg-[#1F4E79] hover:bg-[#153552] text-white font-semibold py-2.5 shadow-lg transition-all"
              >
                {loading ? 'Memverifikasi...' : 'Otorisasi Perangkat Ini'}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-slate-800/80 bg-slate-900/50 pt-3 pb-3 text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between w-full">
              <span className="flex items-center gap-1.5 text-slate-400">
                {deviceInfo.platform === 'Android' || deviceInfo.platform === 'iOS' ? (
                  <Smartphone className="h-3.5 w-3.5" />
                ) : (
                  <Laptop className="h-3.5 w-3.5" />
                )}
                {deviceInfo.platform} • {deviceInfo.browser}
              </span>
              <span className="font-mono text-[10px] text-slate-500 truncate max-w-[140px]" title={deviceId}>
                ID: {deviceId.substring(0, 14)}...
              </span>
            </div>
          </CardFooter>
        </Card>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500">
          KasPL v1.0.0 — Device Security Authorization System
        </p>
      </div>
    </div>
  );
}

export default function EnterCodePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900 text-slate-400 text-sm">
          Memuat Otorisasi Perangkat...
        </div>
      }
    >
      <EnterCodeForm />
    </Suspense>
  );
}
