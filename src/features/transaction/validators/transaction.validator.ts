import { z } from 'zod';

export const checkoutItemSchema = z.object({
  inventoryId: z.string().min(1, 'Inventory ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const checkoutPayloadSchema = z.object({
  businessDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Business date must be YYYY-MM-DD'),
  cart: z.array(checkoutItemSchema).min(1, 'Cart cannot be empty'),
});
