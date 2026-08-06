'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import dynamic from 'next/dynamic';
import { TableSkeleton } from '@/components/shared/Skeletons';

const MemberFormDialog = dynamic(() => import('@/features/member/components/MemberFormDialog').then(mod => mod.MemberFormDialog), {
  ssr: false,
});
import { useToast } from '@/hooks/use-toast';
import { Search, UserPlus, Users, Edit2, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface MemberRecord {
  _id: string;
  publicId: string;
  name: string;
  attendanceNumber: number;
  isActive: boolean;
  createdAt: string;
}

export default function MasterMemberPage() {
  const { toast } = useToast();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<{
    id: string;
    name: string;
    attendanceNumber: number;
    isActive: boolean;
  } | null>(null);

  const fetchMembers = useCallback(() => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (search) params.append('search', search);

    fetch(`/api/member?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setMembers(json.data);
        } else {
          setError(json.error || 'Gagal memuat anggota kelas');
        }
      })
      .catch(() => {
        setError('Terjadi kesalahan koneksi');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [search]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchMembers();
    });
  }, [fetchMembers]);

  const handleCreate = () => {
    setEditingMember(null);
    setDialogOpen(true);
  };

  const handleEdit = (m: MemberRecord) => {
    setEditingMember({
      id: m._id,
      name: m.name,
      attendanceNumber: m.attendanceNumber,
      isActive: m.isActive,
    });
    setDialogOpen(true);
  };

  const handleToggleActive = async (m: MemberRecord) => {
    try {
      const res = await fetch(`/api/member/${m._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !m.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        toast({
          title: 'Status Diperbarui',
          message: `Status ${m.name} diubah menjadi ${!m.isActive ? 'Aktif' : 'Non-Aktif'}.`,
          variant: 'info',
        });
        fetchMembers();
      } else {
        toast({ title: 'Gagal', message: json.error || 'Gagal mengubah status', variant: 'error' });
      }
    } catch {
      toast({ title: 'Gagal', message: 'Koneksi bermasalah', variant: 'error' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79]">Data Anggota Kelas</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar siswa penjaga kasir kantin kelas.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreate} className="bg-[#1F4E79] hover:bg-[#153552]">
            <UserPlus className="mr-2 h-4 w-4" /> Tambah Anggota
          </Button>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama siswa atau ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button onClick={fetchMembers} variant="outline" size="sm" className="gap-2 shrink-0">
              <RefreshCw className="h-4 w-4" /> Segarkan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} cols={5} />
          ) : error ? (
            <div className="p-4 text-center text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          ) : (
            <div className="rounded-md border border-border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F7FA]">
                    <TableHead className="w-[100px] font-semibold text-[#1F4E79]">No. Absen</TableHead>
                    <TableHead className="w-[140px] font-semibold text-[#1F4E79]">ID Member</TableHead>
                    <TableHead className="font-semibold text-[#1F4E79]">Nama Siswa</TableHead>
                    <TableHead className="w-[120px] text-center font-semibold text-[#1F4E79]">Status</TableHead>
                    <TableHead className="w-[120px] text-right font-semibold text-[#1F4E79]">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                        Belum ada anggota kelas terdaftar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    members.map((m) => (
                      <TableRow key={m._id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm font-bold text-center w-[100px]">
                          {m.attendanceNumber}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {m.publicId}
                        </TableCell>
                        <TableCell className="font-medium">{m.name}</TableCell>
                        <TableCell className="text-center">
                          <button
                            onClick={() => handleToggleActive(m)}
                            title="Klik untuk mengubah status"
                            className="cursor-pointer"
                          >
                            <Badge
                              variant="outline"
                              className={m.isActive ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-gray-50 text-gray-500'}
                            >
                              {m.isActive ? <CheckCircle className="h-3 w-3 mr-1 text-emerald-600 inline" /> : <XCircle className="h-3 w-3 mr-1 text-gray-400 inline" />}
                              {m.isActive ? 'Aktif' : 'Non-Aktif'}
                            </Badge>
                          </button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(m)}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <MemberFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={fetchMembers}
        memberToEdit={editingMember}
      />
    </div>
  );
}
