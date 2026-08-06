import { z } from 'zod';

const envSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI environment variable is required'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
});

let validatedEnv: z.infer<typeof envSchema> | null = null;

export function validateEnv() {
  if (validatedEnv) return validatedEnv;

  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const issue = result.error.issues[0]?.message || 'Invalid environment configuration';
    throw new Error(`[ENVIRONMENT ERROR] ${issue}`);
  }

  validatedEnv = result.data;
  return validatedEnv;
}
