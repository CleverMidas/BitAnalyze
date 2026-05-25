import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url(),
  BITTENSOR_WS_URL: z.string().url(),
});

export type AppEnv = z.infer<typeof envSchema>;
