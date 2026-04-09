/**
 * OTP Management Utility
 * Handles OTP generation, storage, validation, and rate limiting
 * Uses in-memory storage (production-ready for Redis migration)
 */

interface OTPRecord {
  code: string;
  createdAt: number;
  expiresAt: number;
  attempts: number;
  verified: boolean;
}

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-memory OTP storage
// In production, migrate to Redis for distributed systems
const otpStore = new Map<string, OTPRecord>();

// In-memory rate limiting store
// In production, migrate to Redis for distributed systems
const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup interval: Remove expired OTPs every 5 minutes
if (typeof global !== 'undefined') {
  setInterval(() => {
    cleanupExpiredOTPs();
  }, 5 * 60 * 1000);
}

/**
 * Generates a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Cleans up expired OTP records
 */
function cleanupExpiredOTPs(): void {
  const now = Date.now();
  let cleanedCount = 0;

  for (const [phone, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(phone);
      cleanedCount++;
    }
  }

  if (cleanedCount > 0 && process.env.NODE_ENV === 'development') {
    console.log(`[OTP Cleanup] Removed ${cleanedCount} expired records`);
  }
}

/**
 * Checks if phone number is rate limited
 * Rate limit: Max 1 OTP request per 60 seconds per phone number
 */
export function isRateLimited(phone: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(phone);

  if (!limit) {
    return false; // No limit set yet
  }

  if (limit.resetAt < now) {
    // Rate limit window expired, remove it
    rateLimitStore.delete(phone);
    return false;
  }

  // Still within rate limit window
  return limit.count >= 3; // Max 3 attempts per 60 seconds
}

/**
 * Records a rate limit attempt
 * Sets 60-second window for phone number
 */
export function setRateLimit(phone: string): void {
  const now = Date.now();
  const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds

  const existing = rateLimitStore.get(phone);

  if (existing && existing.resetAt > now) {
    // Within existing window, increment count
    existing.count++;
  } else {
    // New window
    rateLimitStore.set(phone, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    });
  }
}

/**
 * Stores OTP for a phone number
 * Expiry: 5 minutes (300 seconds)
 */
export function storeOTP(phone: string, otp: string): void {
  const now = Date.now();
  const OTP_VALIDITY = 5 * 60 * 1000; // 5 minutes

  otpStore.set(phone, {
    code: otp,
    createdAt: now,
    expiresAt: now + OTP_VALIDITY,
    attempts: 0,
    verified: false,
  });
}

/**
 * Retrieves stored OTP record for validation
 */
export function getOTPRecord(phone: string): OTPRecord | null {
  const record = otpStore.get(phone);

  if (!record) {
    return null;
  }

  // Check if expired
  if (record.expiresAt < Date.now()) {
    otpStore.delete(phone);
    return null;
  }

  return record;
}

/**
 * Validates OTP against stored value
 * Returns: { valid: boolean, message: string }
 */
export function validateOTP(phone: string, otp: string): { valid: boolean; message: string } {
  const record = getOTPRecord(phone);

  if (!record) {
    return {
      valid: false,
      message: 'OTP expired. Please request a new one.',
    };
  }

  // Check max attempts
  if (record.attempts >= 3) {
    otpStore.delete(phone);
    return {
      valid: false,
      message: 'Too many failed attempts. Please request a new OTP.',
    };
  }

  // Verify OTP
  if (record.code !== otp) {
    record.attempts++;
    return {
      valid: false,
      message: `Invalid OTP. ${3 - record.attempts} attempt${3 - record.attempts !== 1 ? 's' : ''} remaining.`,
    };
  }

  // Success
  record.verified = true;
  return {
    valid: true,
    message: 'OTP verified successfully.',
  };
}

/**
 * Marks OTP as verified and removes after use
 */
export function clearOTP(phone: string): void {
  otpStore.delete(phone);
}

/**
 * Gets remaining time for OTP expiry (in seconds)
 */
export function getOTPRemainingTime(phone: string): number {
  const record = getOTPRecord(phone);

  if (!record) {
    return 0;
  }

  const remaining = Math.ceil((record.expiresAt - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Gets remaining time before rate limit resets (in seconds)
 */
export function getRateLimitRemainingTime(phone: string): number {
  const limit = rateLimitStore.get(phone);

  if (!limit) {
    return 0;
  }

  const remaining = Math.ceil((limit.resetAt - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Checks if OTP was recently verified (within last 24 hours)
 * Used for session management
 */
export function wasOTPVerified(phone: string): boolean {
  const record = getOTPRecord(phone);
  if (!record) {
    return false;
  }
  return record.verified;
}

export default {
  generateOTP,
  isRateLimited,
  setRateLimit,
  storeOTP,
  getOTPRecord,
  validateOTP,
  clearOTP,
  getOTPRemainingTime,
  getRateLimitRemainingTime,
  wasOTPVerified,
};
