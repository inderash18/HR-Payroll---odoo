import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '../../');
const serverDir = path.resolve(__dirname, '../');

const DEFAULT_ENV = `# PeoplePay360 / ODOO Environment Variables
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1
APP_NAME=PeoplePay360

DATABASE_URL="postgresql://postgres:password123@192.168.102.160:5432/peoplepay360?schema=public"

JWT_ACCESS_SECRET="super_secret_access_key_change_in_production_min_32_chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="super_secret_refresh_key_change_in_production_min_32_chars"
JWT_REFRESH_EXPIRES_IN="7d"

COOKIE_SECRET="cookie_secret_key_change_in_production_min_32_chars"

SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=no-reply@peoplepay360.local

STORAGE_LOCAL_PATH=./uploads

DEV_FIXED_AUTH_ENABLED=true
DEV_FIXED_AUTH_EMAIL=admin@peoplepay360.local
DEV_FIXED_AUTH_PASSWORD=admin123
DEV_FIXED_AUTH_ROLE=ADMIN
DEV_FIXED_AUTH_NAME="Development Admin"
`;

// Ensure server/.env exists
const serverEnvPath = path.join(serverDir, '.env');
if (!fs.existsSync(serverEnvPath)) {
  fs.writeFileSync(serverEnvPath, DEFAULT_ENV.trim() + '\n', 'utf-8');
  console.log('✅ Created default server/.env file');
}

// Ensure root .env exists
const rootEnvPath = path.join(rootDir, '.env');
if (!fs.existsSync(rootEnvPath)) {
  fs.writeFileSync(rootEnvPath, DEFAULT_ENV.trim() + '\n', 'utf-8');
  console.log('✅ Created default root .env file');
}
