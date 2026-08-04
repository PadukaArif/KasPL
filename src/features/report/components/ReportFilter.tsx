'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ReportFilterProps {
  currentMonth: number;
  onMonthChange: (month: number) => void;
}

const MONTHS = [
  { value: 1, label: 'Januari' },
  { value: 2, label: 'Februari' },
  { value: 3, label: 'Maret' },
  { value: 4, label: 'April' },
  { value: 5, label: 'Mei' },
  { value: 6, label: 'Juni' },
  { value: 7, label: 'Juli' },
  { value: 8, label: 'Agustus' },
  { value: 9, label: 'September' },
  { value: 10, label: 'Oktober' },
  { value: 11, label: 'November' },
  { value: 12, label: 'Desember' },
];

export function ReportFilter({ currentMonth, onMonthChange }: ReportFilterProps) {
  return (
    <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-border shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">Pilih Periode:</span>
        <Select 
          value={currentMonth.toString()} 
          onValueChange={(val) => { if (val) onMonthChange(parseInt(val, 10)); }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Bulan" />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month) => (
              <SelectItem key={month.value} value={month.value.toString()}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
