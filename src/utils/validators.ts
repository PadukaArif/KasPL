import { z } from 'zod';

export const commonValidations = {
  // MongoDB ObjectId validation
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID tidak valid'),
  
  // Generic text fields
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  
  // Generic number fields
  price: z.number().int('Harga harus berupa angka bulat').min(0, 'Harga tidak boleh negatif'),
  quantity: z.number().int('Jumlah harus berupa angka bulat').min(0, 'Jumlah tidak boleh negatif'),
  
  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
  }),
};
