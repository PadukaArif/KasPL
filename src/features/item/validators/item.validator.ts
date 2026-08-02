import { z } from 'zod';

const itemSchemaBase = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nama barang tidak boleh kosong'),
  category: z.enum(['FOOD', 'DRINK', 'SNACK'], {
    message: 'Kategori harus FOOD, DRINK, atau SNACK',
  }),
  costPrice: z
    .number({ message: 'Harga modal harus berupa angka' })
    .int('Harga modal harus berupa bilangan bulat')
    .min(0, 'Harga modal tidak boleh negatif'),
  sellingPrice: z
    .number({ message: 'Harga jual harus berupa angka' })
    .int('Harga jual harus berupa bilangan bulat')
    .min(0, 'Harga jual tidak boleh negatif'),
  recommendedStock: z
    .number({ message: 'Recommended stock harus berupa angka' })
    .int('Recommended stock harus berupa bilangan bulat')
    .min(0, 'Recommended stock tidak boleh negatif'),
  displayOrder: z
    .number({ message: 'Display order harus berupa angka' })
    .int('Display order harus berupa bilangan bulat'),
});

export const createItemSchema = itemSchemaBase.refine((data) => data.sellingPrice >= data.costPrice, {
  message: 'Harga jual tidak boleh lebih kecil dari harga modal',
  path: ['sellingPrice'],
});

export const updateItemSchema = itemSchemaBase.partial().refine(
  (data) => {
    if (data.sellingPrice !== undefined && data.costPrice !== undefined) {
      return data.sellingPrice >= data.costPrice;
    }
    return true;
  },
  {
    message: 'Harga jual tidak boleh lebih kecil dari harga modal',
    path: ['sellingPrice'],
  }
);

export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
