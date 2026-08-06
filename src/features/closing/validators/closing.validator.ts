import { z } from 'zod';

export const closeSessionSchema = z
  .object({
    sessionId: z.string().min(1).optional(),
    sessionPublicId: z.string().min(1).optional(),
  })
  .refine((data) => !!(data.sessionId || data.sessionPublicId), {
    message: 'Session ID or Public ID is required',
  });

export type CloseSessionPayload = z.infer<typeof closeSessionSchema>;
