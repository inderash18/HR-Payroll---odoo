import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('api/v1'),
  APP_NAME: z.string().default('PeoplePay360'),

  DATABASE_URL: z
    .string()
    .url()
    .or(z.string().min(1))
    .default('postgresql://postgres:postgres@localhost:5432/peoplepay360?schema=public'),
  REDIS_URL: z.string().default('redis://localhost:6379'),

  JWT_ACCESS_SECRET: z.string().min(16).default('super_secret_access_key_change_in_production_min_32_chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16).default('super_secret_refresh_key_change_in_production_min_32_chars'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  COOKIE_SECRET: z.string().min(16).default('cookie_secret_key_change_in_production_min_32_chars'),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  SMTP_FROM: z.string().default('no-reply@peoplepay360.local'),

  STORAGE_LOCAL_PATH: z.string().default('./uploads'),

  // Development-only fixed credentials fallback (strictly disabled in production)
  DEV_FIXED_AUTH_ENABLED: z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .default(false),
  DEV_FIXED_AUTH_EMAIL: z.string().optional().default('devadmin@peoplepay360.local'),
  DEV_FIXED_AUTH_PASSWORD: z.string().optional().default('ChangeThisDevPassword'),
  DEV_FIXED_AUTH_ROLE: z
    .enum(['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER', 'EMPLOYEE'])
    .default('ADMIN'),
  DEV_FIXED_AUTH_NAME: z.string().optional().default('Development Admin'),
  DEV_FIXED_AUTH_USERS_JSON: z.string().optional().default(''),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Environment validation failed');
  }
  return result.data;
}

export const env = validateEnv();
