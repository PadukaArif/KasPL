import { z } from 'zod';

export const closeSessionSchema = z.object({
  sessionPublicId: z.string().min(1, 'Session Public ID is required'),
});

export type CloseSessionPayload = z.infer<typeof closeSessionSchema>;
