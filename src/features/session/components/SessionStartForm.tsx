'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2, PlayCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MemberItem {
  _id?: string;
  id?: string;
  publicId: string;
  name: string;
  attendanceNumber?: number;
}

export function SessionStartForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [guardianId1, setGuardianId1] = useState<string>('');
  const [guardianId2, setGuardianId2] = useState<string>('');
  const [guardianId3, setGuardianId3] = useState<string>('');

  useEffect(() => {
    fetch('/api/member?activeOnly=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) setMembers(data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat data anggota kelas.');
        setLoading(false);
      });
  }, []);

  const getMemberId = (m: MemberItem): string => m._id || m.id || m.publicId || '';

  const isValid = guardianId1 && guardianId2 && guardianId3 && 
    new Set([guardianId1, guardianId2, guardianId3]).size === 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError('');

    const now = new Date();
    const week = Math.ceil(now.getDate() / 7);

    try {
      const res = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodMonth: now.getMonth() + 1,
          periodWeek: week > 5 ? 5 : week,
          guardians: [guardianId1, guardianId2, guardianId3],
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Sesi Penjualan Dimulai!',
          message: 'Sesi harian kantin berhasil diaktifkan.',
          variant: 'success',
        });
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Gagal memulai sesi.');
        toast({ title: 'Gagal Memulai Sesi', message: data.error || 'Terjadi kesalahan.', variant: 'error' });
        setSubmitting(false);
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
      toast({ title: 'Kesalahan Jaringan', message: 'Koneksi terputus.', variant: 'error' });
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#1F4E79]" /></div>;
  }

  const getAvailableMembers = (currentId: string) => {
    const selected = [guardianId1, guardianId2, guardianId3].filter(id => id && id !== currentId);
    return members.filter(m => !selected.includes(getMemberId(m)));
  };

  const getMemberLabel = (id: string): string => {
    if (!id) return '';
    const m = members.find((item) => getMemberId(item) === id);
    if (!m) return id;
    return m.name + (m.attendanceNumber ? ` (No. Absen ${m.attendanceNumber})` : '');
  };

  return (
    <Card className="mx-auto w-full max-w-md border-border shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-2 text-[#1F4E79]">
          <PlayCircle className="h-6 w-6" />
          <CardTitle className="text-xl">Penugasan Penjaga Sesi</CardTitle>
        </div>
        <CardDescription>Pilih 3 penjaga kasir untuk mengaktifkan sesi penjualan hari ini</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Penjaga 1 (Utama)</Label>
              <Select value={guardianId1} onValueChange={(v) => setGuardianId1(v || '')} disabled={submitting}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Penjaga 1">
                    {guardianId1 ? getMemberLabel(guardianId1) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMembers(guardianId1).map((m) => {
                    const mId = getMemberId(m);
                    const label = m.name + (m.attendanceNumber ? ` (No. Absen ${m.attendanceNumber})` : '');
                    return (
                      <SelectItem key={mId} value={mId}>{label}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Penjaga 2</Label>
              <Select value={guardianId2} onValueChange={(v) => setGuardianId2(v || '')} disabled={submitting}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Penjaga 2">
                    {guardianId2 ? getMemberLabel(guardianId2) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMembers(guardianId2).map((m) => {
                    const mId = getMemberId(m);
                    const label = m.name + (m.attendanceNumber ? ` (No. Absen ${m.attendanceNumber})` : '');
                    return (
                      <SelectItem key={mId} value={mId}>{label}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Penjaga 3</Label>
              <Select value={guardianId3} onValueChange={(v) => setGuardianId3(v || '')} disabled={submitting}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Penjaga 3">
                    {guardianId3 ? getMemberLabel(guardianId3) : undefined}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMembers(guardianId3).map((m) => {
                    const mId = getMemberId(m);
                    const label = m.name + (m.attendanceNumber ? ` (No. Absen ${m.attendanceNumber})` : '');
                    return (
                      <SelectItem key={mId} value={mId}>{label}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full bg-[#1F4E79] hover:bg-[#153552] h-11" disabled={!isValid || submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Mulai Penjualan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
