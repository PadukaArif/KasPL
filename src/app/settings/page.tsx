'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Settings, Store, School, Landmark, Save, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SettingsPage() {
  const { toast } = useToast();

  const [className, setClassName] = useState('Kelas XII RPL 1');
  const [schoolName, setSchoolName] = useState('SMK Negeri 1 Jakarta');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [schoolSharePercent, setSchoolSharePercent] = useState('40');
  const [classSharePercent, setClassSharePercent] = useState('60');

  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      setSaving(false);
      toast({
        title: 'Pengaturan Disimpan',
        message: 'Konfigurasi identitas kelas dan skema bagi hasil berhasil diperbarui.',
        variant: 'success',
      });
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#1F4E79] flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Pengaturan Sistem KasPL
        </h1>
        <p className="text-sm text-muted-foreground">Konfigurasi identitas kelas, kantin, dan rasio pembagian keuntungan.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Identitas Kelas & Sekolah */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-[#1F4E79]">
              <Store className="h-5 w-5" />
              <CardTitle className="text-lg">Identitas Kelas & Kantin</CardTitle>
            </div>
            <CardDescription>
              Informasi unit usaha kantin kelas yang ditampilkan pada dokumen laporan dan cetak struk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="className">Nama Kelas</Label>
                <Input
                  id="className"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">Nama Sekolah</Label>
                <Input
                  id="schoolName"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="academicYear">Tahun Ajaran</Label>
              <Input
                id="academicYear"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Skema Bagi Hasil (Profit Sharing) */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2 text-[#1F4E79]">
              <Landmark className="h-5 w-5" />
              <CardTitle className="text-lg">Rasio Skema Bagi Hasil (Profit Share Ratio)</CardTitle>
            </div>
            <CardDescription>
              Pembagian laba bersih (Net Profit) setelah dikurangi seluruh pengeluaran operasional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-blue-50/60 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-900 flex items-center gap-1.5">
                    <School className="h-4 w-4 text-blue-700" />
                    Bagi Hasil Sekolah
                  </span>
                  <Badge className="bg-blue-600 text-white font-mono">{schoolSharePercent}%</Badge>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={schoolSharePercent}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, parseInt(e.target.value || '0', 10)));
                    setSchoolSharePercent(String(val));
                    setClassSharePercent(String(100 - val));
                  }}
                  className="font-mono bg-white"
                />
                <p className="text-xs text-blue-700/80">Dialokasikan untuk setoran kas kantin sekolah.</p>
              </div>

              <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-900 flex items-center gap-1.5">
                    <Landmark className="h-4 w-4 text-emerald-700" />
                    Bagi Hasil Kelas
                  </span>
                  <Badge className="bg-emerald-600 text-white font-mono">{classSharePercent}%</Badge>
                </div>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={classSharePercent}
                  onChange={(e) => {
                    const val = Math.min(100, Math.max(0, parseInt(e.target.value || '0', 10)));
                    setClassSharePercent(String(val));
                    setSchoolSharePercent(String(100 - val));
                  }}
                  className="font-mono bg-white"
                />
                <p className="text-xs text-emerald-700/80">Dialokasikan untuk kas masuk dan tabungan kelas.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Status Sistem & Lisensi */}
        <Card className="border-border shadow-sm bg-[#F5F7FA]">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600" />
              <div>
                <p className="text-sm font-semibold text-foreground">Status Lisensi KasPL</p>
                <p className="text-xs text-muted-foreground">Versi 1.0 Production Mode - Terverifikasi untuk Kegiatan Praktik Lapangan</p>
              </div>
            </div>
            <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active System
            </Badge>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-[#1F4E79] hover:bg-[#153552] gap-2 min-w-[160px]" disabled={saving}>
            <Save className="h-4 w-4" />
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
