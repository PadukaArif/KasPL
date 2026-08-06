'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Lock,
  Smartphone,
  Laptop,
  AlertCircle,
  KeyRound,
  Check,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/formatters';

interface CodeInfo {
  rawCode: string;
  dateStr: string;
  createdAt: string;
  expiresAt: string;
  isUsed: boolean;
}

interface DeviceItem {
  _id: string;
  deviceId: string;
  deviceName: string;
  browser: string;
  platform: string;
  lastActive: string;
  createdAt: string;
  isRevoked: boolean;
}

export default function AdminPage() {
  const [pinVerified, setPinVerified] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinLoading, setPinLoading] = useState(false);

  const [codeInfo, setCodeInfo] = useState<CodeInfo | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);

  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);

  const [confirmGenOpen, setConfirmGenOpen] = useState(false);
  const [selectedDeviceToRevoke, setSelectedDeviceToRevoke] = useState<DeviceItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Check if PIN already verified in session
  useEffect(() => {
    fetch('/api/admin/access-code/generate')
      .then((res) => {
        if (res.ok) {
          setPinVerified(true);
        }
      })
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setCodeLoading(true);
    setDevicesLoading(true);
    setFeedback(null);

    try {
      const [codeRes, devRes] = await Promise.all([
        fetch('/api/admin/access-code/generate'),
        fetch('/api/admin/devices'),
      ]);

      if (codeRes.ok) {
        const codeJson = await codeRes.json();
        if (codeJson.success) {
          setCodeInfo(codeJson.data);
        }
      }

      if (devRes.ok) {
        const devJson = await devRes.json();
        if (devJson.success) {
          setDevices(devJson.data || []);
        }
      }
    } catch {
      setFeedback({ type: 'error', message: 'Gagal memuat data admin.' });
    } finally {
      setCodeLoading(false);
      setDevicesLoading(false);
    }
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    if (!pinVerified) return;

    Promise.all([
      fetch('/api/admin/access-code/generate'),
      fetch('/api/admin/devices'),
    ])
      .then(async ([codeRes, devRes]) => {
        if (!isSubscribed) return;
        if (codeRes.ok) {
          const codeJson = await codeRes.json();
          if (codeJson.success) setCodeInfo(codeJson.data);
        }
        if (devRes.ok) {
          const devJson = await devRes.json();
          if (devJson.success) setDevices(devJson.data || []);
        }
      })
      .catch(() => {
        if (isSubscribed) setFeedback({ type: 'error', message: 'Gagal memuat data admin.' });
      });

    return () => {
      isSubscribed = false;
    };
  }, [pinVerified]);

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPin.trim()) {
      setPinError('Masukkan PIN Admin.');
      return;
    }

    setPinLoading(true);
    setPinError('');

    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: adminPin.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPinVerified(true);
      } else {
        setPinError(data.message || 'PIN Admin salah.');
      }
    } catch {
      setPinError('Gagal memverifikasi PIN.');
    } finally {
      setPinLoading(false);
    }
  };

  const handleGenerateNewCode = async () => {
    setActionLoading(true);
    setConfirmGenOpen(false);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/access-code/generate', {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCodeInfo(data.data);
        setShowCode(true);
        setFeedback({ type: 'success', message: 'Kode akses baru berhasil dibuat.' });
      } else {
        setFeedback({ type: 'error', message: data.message || 'Gagal membuat kode akses.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeDevice = async () => {
    if (!selectedDeviceToRevoke) return;

    setActionLoading(true);
    const targetId = selectedDeviceToRevoke.deviceId;
    setSelectedDeviceToRevoke(null);
    setFeedback(null);

    try {
      const res = await fetch('/api/admin/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', deviceId: targetId }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Akses perangkat berhasil dicabut.' });
        loadData();
      } else {
        setFeedback({ type: 'error', message: data.message || 'Gagal mencabut perangkat.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Terjadi kesalahan sistem.' });
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render PIN Verification Screen if not verified
  if (!pinVerified) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center p-4">
        <Card className="w-full max-w-sm border-slate-200 shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#1F4E79] text-white shadow">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl font-bold text-[#1F4E79]">Admin Panel KasPL</CardTitle>
            <CardDescription className="text-xs">
              Masukkan PIN Admin untuk mengelola Kode Akses & Otorisasi Perangkat.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyPin} className="space-y-4">
              {pinError && (
                <Alert variant="destructive" className="py-2 text-xs">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{pinError}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">PIN Admin</label>
                <Input
                  type="password"
                  placeholder="Masukkan PIN"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="font-mono text-center tracking-widest text-lg"
                  autoFocus
                />
              </div>
              <Button type="submit" disabled={pinLoading} className="w-full bg-[#1F4E79] hover:bg-[#153552] text-white">
                {pinLoading ? 'Memverifikasi...' : 'Masuk Panel Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79] flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-[#2E75B6]" />
            Keamanan & Otorisasi Perangkat
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola Kode Akses Harian Penjaga dan kontrol daftar perangkat aktif KasPL.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData} disabled={codeLoading || devicesLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${codeLoading || devicesLoading ? 'animate-spin' : ''}`} />
          Segarkan Data
        </Button>
      </div>

      {feedback && (
        <Alert variant={feedback.type === 'error' ? 'destructive' : 'default'} className={feedback.type === 'success' ? 'border-emerald-600 bg-emerald-50 text-emerald-900' : ''}>
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertCircle className="h-4 w-4" />}
          <AlertTitle className="text-xs font-bold">{feedback.type === 'success' ? 'Berhasil' : 'Peringatan'}</AlertTitle>
          <AlertDescription className="text-xs">{feedback.message}</AlertDescription>
        </Alert>
      )}

      {/* Access Code Card */}
      <Card className="border-[#1F4E79]/20 shadow-md bg-gradient-to-br from-slate-50 to-slate-100/50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#1F4E79]" />
              <CardTitle className="text-lg font-bold text-[#1F4E79]">Kode Akses Hari Ini (Today&apos;s Access Code)</CardTitle>
            </div>
            {codeInfo?.isUsed ? (
              <Badge variant="outline" className="bg-amber-100 text-amber-900 border-amber-300">
                Sudah Digunakan Oleh Perangkat
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-300">
                Aktif & Siap Digunakan
              </Badge>
            )}
          </div>
          <CardDescription className="text-xs">
            Berikan kode ini kepada penjaga toko yang bertugas hari ini untuk otorisasi perangkat baru.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-inner">
            <div className="font-mono text-3xl font-extrabold tracking-widest text-[#1F4E79] select-all">
              {showCode ? codeInfo?.rawCode || '--------' : '••••••••'}
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCode(!showCode)}
                className="gap-1.5 flex-1 sm:flex-initial"
              >
                {showCode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showCode ? 'Sembunyikan' : 'Tampilkan'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => codeInfo?.rawCode && copyToClipboard(codeInfo.rawCode)}
                disabled={!codeInfo?.rawCode}
                className="gap-1.5 flex-1 sm:flex-initial"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Tersalin' : 'Salin Kode'}
              </Button>
              <Button
                onClick={() => setConfirmGenOpen(true)}
                disabled={actionLoading}
                className="bg-[#1F4E79] hover:bg-[#153552] text-white gap-1.5 flex-1 sm:flex-initial"
              >
                <RefreshCw className="h-4 w-4" />
                Buat Kode Baru
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2 pt-1">
            <span>Tanggal: <strong>{codeInfo?.dateStr || '-'}</strong></span>
            <span>Kedaluwarsa: <strong>Hari ini pukul 23:59:59</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Active Devices Section */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold text-foreground">Daftar Perangkat Terotorisasi (Active Devices)</CardTitle>
              <CardDescription className="text-xs">
                Perangkat yang telah lolos validasi kode akses dan diizinkan mengakses KasPL.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-semibold">
              Total: {devices.filter((d) => !d.isRevoked).length} Aktif
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[200px]">Perangkat / Device</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Browser</TableHead>
                  <TableHead>Aktivitas Terakhir</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {devicesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Memuat daftar perangkat...
                    </TableCell>
                  </TableRow>
                ) : devices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      Belum ada perangkat terdaftar.
                    </TableCell>
                  </TableRow>
                ) : (
                  devices.map((device) => (
                    <TableRow key={device._id} className={device.isRevoked ? 'bg-slate-50/70 opacity-60' : ''}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {device.platform === 'Android' || device.platform === 'iOS' ? (
                            <Smartphone className="h-4 w-4 text-[#2E75B6]" />
                          ) : (
                            <Laptop className="h-4 w-4 text-[#1F4E79]" />
                          )}
                          <div className="flex flex-col">
                            <span className="font-semibold text-sm">{device.deviceName}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {device.deviceId.substring(0, 16)}...
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">{device.platform}</TableCell>
                      <TableCell className="text-xs">{device.browser}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(device.lastActive)}
                      </TableCell>
                      <TableCell>
                        {device.isRevoked ? (
                          <Badge variant="destructive" className="text-[10px]">
                            Akses Dicabut
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            Aktif
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!device.isRevoked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedDeviceToRevoke(device)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Cabut Akses
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Confirm Generate New Code */}
      <Dialog open={confirmGenOpen} onOpenChange={setConfirmGenOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#1F4E79]">
              <RefreshCw className="h-5 w-5" />
              Buat Ulang Kode Akses Hari Ini?
            </DialogTitle>
            <DialogDescription className="text-xs pt-2">
              Kode akses lama yang belum digunakan akan otomatis kedaluwarsa. Kode baru akan dibuat untuk otorisasi perangkat selanjutnya.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setConfirmGenOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleGenerateNewCode} disabled={actionLoading} className="bg-[#1F4E79] hover:bg-[#153552] text-white">
              {actionLoading ? 'Memproses...' : 'Ya, Buat Kode Baru'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Confirm Revoke Device */}
      <Dialog open={!!selectedDeviceToRevoke} onOpenChange={() => setSelectedDeviceToRevoke(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cabut Akses Perangkat?
            </DialogTitle>
            <DialogDescription className="text-xs pt-2">
              Perangkat <strong>{selectedDeviceToRevoke?.deviceName}</strong> akan segera diblokir dari aplikasi KasPL dan harus memasukkan kode akses baru untuk masuk kembali.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-4">
            <Button variant="outline" onClick={() => setSelectedDeviceToRevoke(null)}>
              Batal
            </Button>
            <Button onClick={handleRevokeDevice} disabled={actionLoading} variant="destructive">
              {actionLoading ? 'Mencabut...' : 'Cabut Akses Perangkat'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
