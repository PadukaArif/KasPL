'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function SessionStartForm() {
  const router = useRouter();
  const [members, setMembers] = useState<{ id: string; name: string; publicId: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [guardianId1, setGuardianId1] = useState<string>('');
  const [guardianId2, setGuardianId2] = useState<string>('');
  const [guardianId3, setGuardianId3] = useState<string>('');

  useEffect(() => {
    fetch('/api/member')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMembers(data.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal memuat data anggota kelas.');
        setLoading(false);
      });
  }, []);

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
        router.push('/dashboard');
        router.refresh(); // Refresh the layout to update server state
      } else {
        setError(data.error || 'Gagal memulai sesi.');
        setSubmitting(false);
      }
    } catch {
      setError('Terjadi kesalahan jaringan.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  }

  // Filter available members for each dropdown
  const getAvailableMembers = (currentId: string) => {
    const selected = [guardianId1, guardianId2, guardianId3].filter(id => id && id !== currentId);
    return members.filter(m => !selected.includes(m.id));
  };

  return (
    <Card className="mx-auto w-full max-w-md border-border shadow-sm">
      <CardHeader>
        <CardTitle>Siapa yang bertugas minggu ini?</CardTitle>
        <CardDescription>Pilih 3 penjaga untuk memulai sesi penjualan</CardDescription>
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
              <Label>Penjaga 1</Label>
              <Select value={guardianId1} onValueChange={(v) => setGuardianId1(v || '')} disabled={submitting}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Penjaga 1" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMembers(guardianId1).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Penjaga 2</Label>
              <Select value={guardianId2} onValueChange={(v) => setGuardianId2(v || '')} disabled={submitting}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Penjaga 2" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMembers(guardianId2).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Penjaga 3</Label>
              <Select value={guardianId3} onValueChange={(v) => setGuardianId3(v || '')} disabled={submitting}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih Penjaga 3" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableMembers(guardianId3).map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={!isValid || submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Mulai Penjualan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
