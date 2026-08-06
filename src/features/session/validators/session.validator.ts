import { z } from 'zod';

export const startSessionSchema = z.object({
  periodMonth: z.number().int().min(1).max(12, 'Bulan tidak valid'),
  periodWeek: z.number().int().min(1).max(5, 'Minggu tidak valid'),
  guardians: z
    .array(z.string().min(1, 'ID penjaga tidak valid'))
    .length(3, 'Harus memilih tepat 3 penjaga')
    .refine((items) => new Set(items).size === items.length, {
      message: 'Penjaga tidak boleh ada yang sama',
    }),
});

export type StartSessionInput = z.infer<typeof startSessionSchema>;
