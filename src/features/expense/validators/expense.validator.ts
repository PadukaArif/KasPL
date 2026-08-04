import { z } from 'zod';

export const expenseCategoryEnum = z.enum([
  'OPERATIONAL',
  'RAW_MATERIAL',
  'EQUIPMENT',
  'OTHER',
]);

export type ExpenseCategory = z.infer<typeof expenseCategoryEnum>;

export const createExpenseSchema = z.object({
  title: z
    .string({ message: 'Nama pengeluaran wajib diisi' })
    .trim()
    .min(1, 'Nama pengeluaran wajib diisi')
    .max(100, 'Nama pengeluaran maksimal 100 karakter'),
  category: expenseCategoryEnum,
  amount: z
    .number({ message: 'Nominal wajib diisi' })
    .int('Nominal harus berupa angka bulat')
    .positive('Nominal harus lebih dari 0')
    .max(1000000000, 'Nominal terlalu besar (Maks 1 Milyar)'),
  notes: z
    .string()
    .trim()
    .max(500, 'Catatan maksimal 500 karakter')
    .optional(),
  expenseDate: z
    .string()
    .datetime({ message: 'Format tanggal tidak valid' })
    .optional()
    .or(z.date()),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();

export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
