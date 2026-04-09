/**
 * OTP Management with Rate Limiting & Cooldown
 * In-memory store (Redis-ready for production)
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

interface CooldownRecord {
  resetAt: number;
}

// In-memory stores
const otpStore = new Map<string, OTPRecord>();
const rateLimitStore = new Map<string, RateLimitRecord>();
const cooldownStore = new Map<string, CooldownRecord>();

// Cleanup interval: Remove expired records every 5 minutes
if (typeof global !== "undefined") {
  setInterval(() => {
    cleanupExpiredRecords();
  }, 5 * 60 * 1000);
}

/**
 * Generates a random 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Cleans up all expired records
 */
function cleanupExpiredRecords(): void {
  const now = Date.now();
  let cleanedOTP = 0;
  let cleanedRateLimit = 0;

  // Cleanup expired OTPs
  for (const [phone, record] of otpStore.entries()) {
    if (record.expiresAt < now) {
      otpStore.delete(phone);
      cleanedOTP++;
    }
  }

  // Cleanup expired rate limits
  for (const [phone, record] of rateLimitStore.entries()) {
    if (record.resetAt < now) {
      rateLimitStore.delete(phone);
      cleanedRateLimit++;
    }
  }

  // Cleanup expired cooldowns
  for (const [phone, record] of cooldownStore.entries()) {
    if (record.resetAt < now) {
      cooldownStore.delete(phone);
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log(
      `[Cleanup] Removed ${cleanedOTP} OTP records, ${cleanedRateLimit} rate limit records`
    );
  }
}

/**
 * Checks if phone is in cooldown period (prevent spam)
 * Cooldown: 30 seconds between OTP requests
 */
export function isInCooldown(phone: string): boolean {
  const now = Date.now();
  const cooldown = cooldownStore.get(phone);

  if (!cooldown) {
    return false;
  }

  if (cooldown.resetAt < now) {
    cooldownStore.delete(phone);
    return false;
  }

  return true;
}

/**
 * Gets remaining cooldown time in seconds
 */
export function getCooldownRemainingTime(phone: string): number {
  const cooldown = cooldownStore.get(phone);

  if (!cooldown) {
    return 0;
  }

  const remaining = Math.ceil((cooldown.resetAt - Date.now()) / 1000);
  return Math.max(0, remaining);
}

/**
 * Sets cooldown for phone (30 seconds)
 */
export function setCooldown(phone: string): void {
  const now = Date.now();
  const COOLDOWN_PERIOD = 30 * 1000; // 30 seconds

  cooldownStore.set(phone, {
    resetAt: now + COOLDOWN_PERIOD,
  });
}

/**
 * Checks if phone number is rate limited
 * Rate limit: Max 3 OTP requests per hour per phone number
 */
export function isRateLimited(phone: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(phone);

  if (!limit) {
    return false;
  }

  if (limit.resetAt < now) {
    rateLimitStore.delete(phone);
    return false;
  }

  return limit.count >= 3; // Max 3 per hour
}

/**
 * Records a rate limit attempt
 * Sets 1-hour window for phone number
 */
export function setRateLimit(phone: string): void {
  const now = Date.now();
  const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour

  const existing = rateLimitStore.get(phone);

  if (existing && existing.resetAt > now) {
    // Within existing window
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
 * Gets remaining time for rate limit to reset (in seconds)
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
 * Returns: { valid: boolean; message: string }
 */
export function validateOTP(
  phone: string,
  otp: string
): { valid: boolean; message: string } {
  const record = getOTPRecord(phone);

  if (!record) {
    return {
      valid: false,
      message: "OTP expired. Please request a new one.",
    };
  }

  // Check max attempts
  if (record.attempts >= 3) {
    otpStore.delete(phone);
    return {
      valid: false,
      message: "Too many failed attempts. Please request a new OTP.",
    };
  }

  // Verify OTP
  if (record.code !== otp) {
    record.attempts++;
    return {
      valid: false,
      message: `Invalid OTP. ${3 - record.attempts} attempt${3 - record.attempts !== 1 ? "s" : ""} remaining.`,
    };
  }

  // Success
  record.verified = true;
  return {
    valid: true,
    message: "OTP verified successfully.",
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

export default {
  generateOTP,
  isInCooldown,
  getCooldownRemainingTime,
  setCooldown,
  isRateLimited,
  setRateLimit,
  getRateLimitRemainingTime,
  storeOTP,
  getOTPRecord,
  validateOTP,
  clearOTP,
  getOTPRemainingTime,
};
