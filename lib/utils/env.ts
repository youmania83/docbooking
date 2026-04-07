/**
 * Environment variable validation
 * Ensures all required env vars are present at runtime
 * 
 * Required for production:
 * - MONGODB_URI: MongoDB Atlas connection string
 * - FAST2SMS_API_KEY: Fast2SMS API key for OTP delivery
 * - NODE_ENV: "production" or "development"
 */

export function validateEnv(): void {
  const requiredEnvs = [
    "MONGODB_URI",
    "FAST2SMS_API_KEY",
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
      `Please configure these in your environment or .env.local file.`
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
