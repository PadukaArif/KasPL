import { z } from 'zod';

export const initializeInventoryItemSchema = z.object({
  itemId: z.string().min(1, 'ID barang tidak valid'),
  openingStock: z
    .number({ message: 'Opening stock harus berupa angka' })
    .int('Opening stock harus berupa bilangan bulat')
    .min(0, 'Opening stock tidak boleh negatif'),
});

export const initializeInventorySchema = z.object({
  sessionId: z.string().min(1, 'ID sesi tidak valid'),
  items: z.array(initializeInventoryItemSchema).min(1, 'Harus menginisialisasi minimal 1 barang'),
});

export const updateOpeningStockSchema = z.object({
  openingStock: z
    .number({ message: 'Opening stock harus berupa angka' })
    .int('Opening stock harus berupa bilangan bulat')
    .min(0, 'Opening stock tidak boleh negatif'),
});

export type InitializeInventoryInput = z.infer<typeof initializeInventorySchema>;
export type UpdateOpeningStockInput = z.infer<typeof updateOpeningStockSchema>;
