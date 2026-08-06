'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus, UserCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  memberToEdit?: {
    id: string;
    name: string;
    attendanceNumber: number;
    isActive: boolean;
  } | null;
}

export function MemberFormDialog({ open, onOpenChange, onSuccess, memberToEdit }: MemberFormDialogProps) {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [attendanceNumber, setAttendanceNumber] = useState<number | ''>('');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.resolve().then(() => {
      if (memberToEdit) {
        setName(memberToEdit.name);
        setAttendanceNumber(memberToEdit.attendanceNumber);
        setIsActive(memberToEdit.isActive);
      } else {
        setName('');
        setAttendanceNumber('');
        setIsActive(true);
      }
      setError('');
    });
  }, [memberToEdit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || attendanceNumber === '' || Number(attendanceNumber) <= 0) {
      setError('Harap isi nama dan nomor absen dengan benar.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      name: name.trim(),
      attendanceNumber: Number(attendanceNumber),
      isActive,
    };

    try {
      const url = memberToEdit ? `/api/member/${memberToEdit.id}` : '/api/member';
      const method = memberToEdit ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        toast({
          title: 'Berhasil',
          message: memberToEdit ? 'Data anggota berhasil diperbarui.' : 'Anggota baru berhasil ditambahkan.',
          variant: 'success',
        });
        onSuccess();
        onOpenChange(false);
      } else {
        setError(json.error || 'Gagal menyimpan data anggota.');
      }
    } catch {
      setError('Terjadi kesalahan jaringan saat menyimpan.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#1F4E79]">
            {memberToEdit ? <UserCheck className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            <DialogTitle>{memberToEdit ? 'Edit Anggota Kelas' : 'Tambah Anggota Kelas'}</DialogTitle>
          </div>
          <DialogDescription>
            {memberToEdit ? 'Ubah informasi siswa penjaga kasir.' : 'Daftarkan siswa baru untuk menjadi penjaga kasir kantin.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="attendanceNo">Nomor Absen</Label>
            <Input
              id="attendanceNo"
              type="number"
              min="1"
              max="100"
              placeholder="Contoh: 1, 2, 15..."
              value={attendanceNumber}
              onChange={(e) => setAttendanceNumber(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
              disabled={submitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="memberName">Nama Lengkap Siswa</Label>
            <Input
              id="memberName"
              placeholder="Contoh: Ahmad Subagyo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" className="bg-[#1F4E79] hover:bg-[#153552]" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {memberToEdit ? 'Simpan Perubahan' : 'Tambah Anggota'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
