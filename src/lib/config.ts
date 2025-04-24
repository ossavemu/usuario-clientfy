/**
 * Configuración centralizada de la aplicación
 *
 * Este módulo proporciona acceso a todas las variables de configuración
 * y variables de entorno utilizadas en la aplicación.
 */

// Configuración de autenticación
export const AUTH_CONFIG = {
  JWT_SECRET:
    process.env.SECRET_KEY || process.env.JWT_SECRET_KEY || 'your-secret-key',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
};

// Configuración de Turso
export const TURSO_CONFIG = {
  DATABASE_URL: process.env.TURSO_DATABASE_URL as string,
  TOKEN: process.env.TURSO_TOKEN as string,
};

// Configuración de DigitalOcean
export const DO_CONFIG = {
  TOKEN: process.env.DO_TOKEN as string,
  IMAGE_ID: process.env.DIGITALOCEAN_IMAGE_ID as string,
  SSH_PASSWORD: process.env.DIGITALOCEAN_SSH_PASSWORD as string,
};

// Configuración de AWS
export const AWS_CONFIG = {
  REGION: process.env.AWS_REGION as string,
  ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
  SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
  BUCKET_NAME: process.env.AWS_BUCKET_NAME as string,
};

// Configuración de Stripe
export const STRIPE_CONFIG = {
  SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
  PRODUCT_LINK: process.env.STRIPE_PRODUCT_LINK as string,
};

// Configuración de Email
export const EMAIL_CONFIG = {
  GMAIL_USER: process.env.GMAIL_USER as string,
  GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD as string,
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string,
};

// Configuración de Google IA
export const GOOGLE_CONFIG = {
  API_KEY: process.env.GOOGLE_IA_API_KEY as string,
};

// Encryption config
export const ENCRYPTION_CONFIG = {
  ALGORITHM: 'argon2id' as 'argon2id' | 'bcrypt' | 'argon2d' | 'argon2i',
  SALT_ROUNDS: 10,
};

// Validación de configuración
export function validateConfig(): string[] {
  const missingVars: string[] = [];

  // Verificar variables críticas
  if (!TURSO_CONFIG.DATABASE_URL) missingVars.push('TURSO_DATABASE_URL');
  if (!TURSO_CONFIG.TOKEN) missingVars.push('TURSO_TOKEN');
  if (!DO_CONFIG.TOKEN) missingVars.push('DO_TOKEN');
  if (!DO_CONFIG.IMAGE_ID) missingVars.push('DIGITALOCEAN_IMAGE_ID');
  if (!STRIPE_CONFIG.SECRET_KEY) missingVars.push('STRIPE_SECRET_KEY');
  if (!EMAIL_CONFIG.GMAIL_USER) missingVars.push('GMAIL_USER');
  if (!EMAIL_CONFIG.GMAIL_APP_PASSWORD) missingVars.push('GMAIL_APP_PASSWORD');

  return missingVars;
}

// Objeto de configuración completo
const config = {
  AUTH: AUTH_CONFIG,
  TURSO: TURSO_CONFIG,
  DO: DO_CONFIG,
  AWS: AWS_CONFIG,
  STRIPE: STRIPE_CONFIG,
  EMAIL: EMAIL_CONFIG,
  GOOGLE: GOOGLE_CONFIG,
  ENCRYPT: ENCRYPTION_CONFIG,
  validate: validateConfig,
};

export default config;
