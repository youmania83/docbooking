/**
 * Environment variable validation
 * Ensures all required env vars are present at runtime
 * 
 * Required for Vercel production:
 * - MONGODB_URI: MongoDB Atlas connection string
 * - ADMIN_PASSWORD: Admin panel login password
 * - GMAIL_USER: Gmail account for sending OTPs
 * - GMAIL_APP_PASSWORD: Gmail app-specific password (16 chars)
 * - NODE_ENV: "production" or "development"
 */

export function validateEnv(): void {
  const requiredEnvs = [
    "MONGODB_URI",
    "ADMIN_PASSWORD",
    "GMAIL_USER",
    "GMAIL_APP_PASSWORD",
  ];

  const missing: string[] = [];

  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      missing.push(env);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
      `Please configure these in Vercel project settings or add to your .env.local file.`
    );
  }
}

/**
 * Get environment variable with optional default
 */
export function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (!value && !defaultValue) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value || defaultValue || "";
}

/**
 * Optional environment variable getter
 */
export function getEnvOptional(key: string): string | undefined {
  return process.env[key];
}
