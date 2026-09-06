import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { z } from 'zod';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Attempt loading .env from multiple potential locations
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'server/.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(__dirname, '../../../.env'),
];

let envLoaded = false;
for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    envLoaded = true;
  }
}

if (!envLoaded) {
  // If no .env file exists on machine (e.g. freshly cloned by teammate), create default server/.env
  try {
    const targetEnv = path.resolve(__dirname, '../../.env');
    const defaultEnvContent = `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/odoo?schema=public"\nPORT=3000\nAPI_PREFIX=/api/v1\nAPP_NAME=Odoo\nJWT_ACCESS_SECRET="super_secret_access_key_change_in_production_min_32_chars"\nJWT_REFRESH_SECRET="super_secret_refresh_key_change_in_production_min_32_chars"\nCOOKIE_SECRET="cookie_secret_key_change_in_production_min_32_chars"\n`;
    fs.writeFileSync(targetEnv, defaultEnvContent, 'utf-8');
    dotenv.config({ path: targetEnv });
  } catch (e) {
    // Ignore error if filesystem read-only
  }
}

// Ensure default fallback values in process.env so Prisma & other tools never crash on missing env
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/odoo?schema=public';

process.env.COOKIE_SECRET =
  process.env.COOKIE_SECRET ||
  'cookie_secret_key_change_in_production_min_32_chars';

process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ||
  'super_secret_access_key_change_in_production_min_32_chars';

process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ||
  'super_secret_refresh_key_change_in_production_min_32_chars';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  API_PREFIX: z.string().default('/api/v1'),
  APP_NAME: z.string().default('Odoo'),

  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/odoo?schema=public'),

  JWT_ACCESS_SECRET: z.string().min(16).default('super_secret_access_key_change_in_production_min_32_chars'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(16).default('super_secret_refresh_key_change_in_production_min_32_chars'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  COOKIE_SECRET: z.string().min(16).default('cookie_secret_key_change_in_production_min_32_chars'),

  SMTP_HOST: z.string().default('localhost'),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASSWORD: z.string().optional().default(''),
  SMTP_FROM: z.string().default('no-reply@odoo.local'),

  STORAGE_LOCAL_PATH: z.string().default('./uploads'),

  DEV_FIXED_AUTH_ENABLED: z
    .preprocess((val) => val === 'true' || val === true, z.boolean())
    .default(false),
  DEV_FIXED_AUTH_EMAIL: z.string().optional().default('admin@odoo.local'),
  DEV_FIXED_AUTH_PASSWORD: z.string().optional().default('admin123'),
  DEV_FIXED_AUTH_ROLE: z
    .enum(['SUPER_ADMIN', 'ORGANIZATION_ADMIN', 'ADMIN', 'HR_MANAGER', 'PAYROLL_MANAGER', 'FINANCE_MANAGER', 'DEPARTMENT_MANAGER', 'EMPLOYEE', 'AUDITOR'])
    .default('ADMIN'),
  DEV_FIXED_AUTH_NAME: z.string().optional().default('Development Admin'),
  DEV_FIXED_AUTH_USERS_JSON: z.string().optional().default(''),
});

function validateEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid environment variables:', JSON.stringify(result.error.format(), null, 2));
    throw new Error('Environment validation failed');
  }
  return result.data;
}

export const env = validateEnv();
