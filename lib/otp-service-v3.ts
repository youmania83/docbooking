/**
 * Unified OTP Service v3 - Production Grade
 * Handles WhatsApp via AiSensy + SMS fallback
 * Retry logic, comprehensive logging, and full error tracking
 */

import { sendOTPViaAiSensy } from "./aisensy";
import { sendOTPViaSMS, isFast2SMSConfigured } from "./sms-fallback";
import {
  generateOTP,
  storeOTP,
  validateOTP,
  clearOTP,
  isRateLimited,
  setRateLimit,
  isInCooldown,
  setCooldown,
} from "./otp-manager";

interface OTPDeliveryResult {
  success: boolean;
  channel: "whatsapp" | "sms" | "none";
  message: string;
  otp?: string;
  expiresIn: number;
  attempt?: number;
}

interface OTPVerificationResult {
  valid: boolean;
  message: string;
  channel?: string;
}

interface OTPMetrics {
  timestamp: string;
  phone: string;
  action: "generation" | "delivery" | "verification" | "failure";
  channel: "whatsapp" | "sms" | "none";
  success: boolean;
  reason?: string;
  executionTimeMs?: number;
}

// In-memory metrics store (for monitoring)
const metricsStore: OTPMetrics[] = [];
const MAX_METRICS_STORE = 1000;

const RETRY_CONFIG = {
  MAX_ATTEMPTS: 2,
  INITIAL_DELAY_MS: 500,
  MAX_DELAY_MS: 2000,
};

/**
 * Log OTP metrics for monitoring and debugging
 */
function logMetric(metric: OTPMetrics): void {
  console.log(`[OTP Metrics] ${JSON.stringify(metric)}`);

  // Store in memory (keep last 1000 metrics)
  metricsStore.push(metric);
  if (metricsStore.length > MAX_METRICS_STORE) {
    metricsStore.shift();
  }
}

/**
 * Get OTP metrics for admin dashboard
 */
export function getOTPMetrics(): OTPMetrics[] {
  return metricsStore;
}

/**
 * Clear OTP metrics
 */
export function clearOTPMetrics(): void {
  metricsStore.length = 0;
}

/**
 * Calculate exponential backoff delay
 */
function getBackoffDelay(attemptNumber: number): number {
  const delay = Math.min(
    RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(2, attemptNumber),
    RETRY_CONFIG.MAX_DELAY_MS
  );
  return delay + Math.random() * 100; // Add jitter
}

/**
 * Send OTP with automatic failover
 * Priority: WhatsApp → SMS
 */
export async function sendOTPWithFailover(
  phone: string,
  userName?: string
): Promise<OTPDeliveryResult> {
  const startTime = Date.now();

  try {
    // Rate limiting check
    if (isRateLimited(phone)) {
      return {
        success: false,
        channel: "none",
        message: "Too many OTP requests. Please try again later.",
        expiresIn: 0,
      };
    }

    // Cooldown check
    if (isInCooldown(phone)) {
      return {
        success: false,
        channel: "none",
        message: "Please wait before requesting another OTP.",
        expiresIn: 0,
      };
    }

    // Generate OTP
    const otp = generateOTP();
    storeOTP(phone, otp);
    setRateLimit(phone);
    setCooldown(phone);

    logMetric({
      timestamp: new Date().toISOString(),
      phone,
      action: "generation",
      channel: "none",
      success: true,
    });

    // Try WhatsApp with retries
    for (let attempt = 0; attempt <= RETRY_CONFIG.MAX_ATTEMPTS; attempt++) {
      try {
        const whatsappResult = await sendOTPViaAiSensy(phone, otp);

        if (whatsappResult.success) {
          const executionTime = Date.now() - startTime;

          logMetric({
            timestamp: new Date().toISOString(),
            phone,
            action: "delivery",
            channel: "whatsapp",
            success: true,
            executionTimeMs: executionTime,
          });

          console.log(
            `[OTP Service] ✅ WhatsApp OTP delivered to ${phone} (${executionTime}ms, attempt ${attempt + 1})`
          );

          return {
            success: true,
            channel: "whatsapp",
            message: "OTP sent via WhatsApp",
            otp: process.env.NODE_ENV === "development" ? otp : undefined,
            expiresIn: 300,
            attempt: attempt + 1,
          };
        }

        // Log attempt failure
        console.warn(`[OTP Service] ⚠️  WhatsApp attempt ${attempt + 1} failed:`, {
          phone,
          error: whatsappResult.message,
        });

        // If not last attempt, wait before retry
        if (attempt < RETRY_CONFIG.MAX_ATTEMPTS) {
          const delay = getBackoffDelay(attempt);
          console.log(`[OTP Service] ⏳ Retrying in ${Math.round(delay)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`[OTP Service] ❌ WhatsApp error on attempt ${attempt + 1}:`, error);
        if (attempt < RETRY_CONFIG.MAX_ATTEMPTS) {
          const delay = getBackoffDelay(attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // WhatsApp failed, try SMS fallback (if configured)
    if (isFast2SMSConfigured()) {
      console.log(`[OTP Service] 📱 Falling back to SMS for ${phone}`);

      const smsResult = await sendOTPViaSMS(phone, otp);

      if (smsResult.success) {
        const executionTime = Date.now() - startTime;

        logMetric({
          timestamp: new Date().toISOString(),
          phone,
          action: "delivery",
          channel: "sms",
          success: true,
          executionTimeMs: executionTime,
        });

        console.log(`[OTP Service] ✅ SMS OTP delivered to ${phone} (${executionTime}ms)`);

        return {
          success: true,
          channel: "sms",
          message: "OTP sent via SMS (WhatsApp unavailable)",
          otp: process.env.NODE_ENV === "development" ? otp : undefined,
          expiresIn: 300,
        };
      }
    } else {
      console.warn(
        `[OTP Service] ⚠️  SMS fallback not configured. FAST2SMS_API_KEY not set. WhatsApp-only mode (testing phase).`
      );
    }

    // Both channels failed
    const executionTime = Date.now() - startTime;

    logMetric({
      timestamp: new Date().toISOString(),
      phone,
      action: "failure",
      channel: "none",
      success: false,
      reason: "Both WhatsApp and SMS delivery failed",
      executionTimeMs: executionTime,
    });

    clearOTP(phone);

    return {
      success: false,
      channel: "none",
      message: "Unable to send OTP. Please try again.",
      expiresIn: 0,
    };
  } catch (error) {
    clearOTP(phone);

    const executionTime = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logMetric({
      timestamp: new Date().toISOString(),
      phone,
      action: "failure",
      channel: "none",
      success: false,
      reason: `Critical error: ${errorMessage}`,
      executionTimeMs: executionTime,
    });

    console.error("[OTP Service] 🚨 Critical error:", error);

    return {
      success: false,
      channel: "none",
      message: "Service error. Please try again.",
      expiresIn: 0,
    };
  }
}

/**
 * Verify OTP and track metrics
 */
export function verifyOTPWithMetrics(
  phone: string,
  inputOTP: string
): OTPVerificationResult {
  const startTime = Date.now();

  const result = validateOTP(phone, inputOTP);

  const executionTime = Date.now() - startTime;

  logMetric({
    timestamp: new Date().toISOString(),
    phone,
    action: "verification",
    channel: "none",
    success: result.valid,
    reason: result.message,
    executionTimeMs: executionTime,
  });

  if (result.valid) {
    clearOTP(phone);
    console.log(`[OTP Service] ✅ OTP verified for ${phone} (${executionTime}ms)`);
  } else {
    console.warn(`[OTP Service] ⚠️  OTP verification failed for ${phone}:`, result.message);
  }

  return {
    valid: result.valid,
    message: result.message,
  };
}

/**
 * Get OTP service health status
 */
export function getOTPServiceHealth(): {
  healthy: boolean;
  aisensy: boolean;
  sms: boolean;
  mode: "testing" | "production";
  timestamp: string;
} {
  const smsConfigured = isFast2SMSConfigured();
  const aisensyConfigured =
    !!process.env.AISENSY_API_KEY &&
    !!process.env.AISENSY_CAMPAIGN_NAME &&
    !!process.env.AISENSY_API_URL;

  const mode = smsConfigured ? "production" : "testing";

  return {
    healthy: aisensyConfigured, // WhatsApp must be configured
    aisensy: aisensyConfigured,
    sms: smsConfigured,
    mode: mode,
    timestamp: new Date().toISOString(),
  };
}

export default {
  sendOTPWithFailover,
  verifyOTPWithMetrics,
  getOTPMetrics,
  clearOTPMetrics,
  getOTPServiceHealth,
};
