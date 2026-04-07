/**
 * OTP Service Layer - Mobile SMS with Fast2SMS
 * Handles all OTP business logic: generation, sending, verification, expiry
 * 
 * Uses Fast2SMS for reliable SMS delivery to mobile phones
 */

import { connectDB } from "@/lib/mongodb";
import OtpModel from "@/models/Otp";
import { OTP_CONFIG, FAST2SMS_CONFIG } from "@/config/constants";
import {
  ValidationError,
  RateLimitError,
  NotFoundError,
  ExternalServiceError,
  DatabaseError,
} from "@/lib/utils/errors";
import { getEnv, getEnvOptional } from "@/lib/utils/env";

// In-memory rate limiting cache: phone -> last sent timestamp
const lastOtpSentTime: Record<string, number> = {};

/**
 * Generate a random 6-digit OTP
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via Fast2SMS (MOBILE SMS)
 */
async function sendViaSMS(
  phone: string,
  otp: string
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  try {
    const apiKey = getEnv("FAST2SMS_API_KEY");
    const cleanPhone = phone.replace(/\D/g, "");

    console.log(`[OTP Service] 📱 Sending SMS OTP to ${cleanPhone}`);

    const requestBody = {
      route: "otp",
      variables_values: String(otp),
      numbers: cleanPhone,
    };

    const response = await fetch(FAST2SMS_CONFIG.BASE_URL, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.return === true) {
      console.log(
        `[OTP Service] ✅ SMS queued. Request ID: ${data.request_id}`
      );
      return { success: true, requestId: data.request_id };
    }

    console.error(`[OTP Service] ❌ Fast2SMS Error: ${data.message}`);
    return { success: false, error: data.message };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[OTP Service] ❌ SMS Send Failed: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Send OTP to mobile phone with rate limiting
 * @param phone - Phone number to send OTP to (10-digit)
 */
export async function sendOtp(phone: string): Promise<{
  success: boolean;
  phone: string;
  expiresIn: number;
  devOtp?: string; // Only in development
}> {
  try {
    // Validate phone format (10 digits minimum)
    const phoneRegex = /^[0-9]{10,}$/;
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (!phoneRegex.test(cleanPhone)) {
      throw new ValidationError("Invalid phone number. Please enter 10 digits.");
    }

    // Check rate limiting
    const lastSentTime = lastOtpSentTime[cleanPhone];
    const now = Date.now();

    if (lastSentTime) {
      const timeSinceLastSend = (now - lastSentTime) / 1000;
      if (timeSinceLastSend < OTP_CONFIG.RATE_LIMIT_SECONDS) {
        const waitSeconds = Math.ceil(
          OTP_CONFIG.RATE_LIMIT_SECONDS - timeSinceLastSend
        );
        throw new RateLimitError(
          `Wait ${waitSeconds} seconds before resending OTP.`
        );
      }
    }

    // Connect to database
    await connectDB();

    // Check existing OTP attempts
    const existingOtp = await OtpModel.findOne({ phone: cleanPhone });
    if (existingOtp && existingOtp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      throw new RateLimitError(
        "Too many failed attempts. Please try again after 1 hour."
      );
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_SECONDS * 1000);

    // Debug: show OTP in development
    let devOtp: string | undefined;
    if (process.env.NODE_ENV === "development") {
      console.log(`[OTP Service] 🐛 DEV: OTP for ${cleanPhone}: ${otp}`);
      devOtp = otp;
    }

    // Save to database
    await OtpModel.findOneAndUpdate(
      { phone: cleanPhone },
      {
        phone: cleanPhone,
        otp,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Send via SMS
    const smsResult = await sendViaSMS(cleanPhone, otp);

    if (smsResult.success) {
      lastOtpSentTime[cleanPhone] = now;
      console.log(`[OTP Service] ✅ OTP SMS sent to ${cleanPhone}`);
    } else {
      console.warn(
        `[OTP Service] ⚠️  SMS delivery issue: ${smsResult.error}`
      );
      // Still mark rate limit to prevent spam
      lastOtpSentTime[cleanPhone] = now;
    }

    const response: any = {
      success: true,
      phone: cleanPhone,
      expiresIn: OTP_CONFIG.EXPIRY_SECONDS,
    };

    // Include OTP in development response for testing
    if (devOtp) {
      response.devOtp = devOtp;
    }

    return response;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      throw error;
    }
    throw new DatabaseError(
      error instanceof Error ? error.message : "Failed to send OTP"
    );
  }
}

/**
 * Verify OTP for mobile phone
 * @param phone - Phone number to verify OTP for
 * @param otp - 6-digit OTP code
 */
export async function verifyOtp(phone: string, otp: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Validate inputs
    const phoneRegex = /^[0-9]{10,}$/;
    const cleanPhone = phone.replace(/\D/g, "");
    
    if (!phoneRegex.test(cleanPhone)) {
      throw new ValidationError("Invalid phone number. Please enter 10 digits.");
    }

    if (!/^[0-9]{6}$/.test(otp)) {
      throw new ValidationError("OTP must be a 6-digit number.");
    }

    // Connect to database
    await connectDB();

    // Find OTP record
    const otpRecord = await OtpModel.findOne({ phone: cleanPhone });

    if (!otpRecord) {
      throw new NotFoundError(
        "OTP not found. Please request a new OTP first."
      );
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await OtpModel.deleteOne({ phone: cleanPhone });
      throw new ValidationError("OTP has expired. Please request a new one.");
    }

    // Check attempts
    if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      await OtpModel.deleteOne({ phone: cleanPhone });
      throw new RateLimitError(
        "Too many incorrect attempts. Please request a new OTP."
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts;
      throw new ValidationError(
        `Invalid OTP. ${remainingAttempts} attempts remaining.`
      );
    }

    // Delete OTP record (one-time use)
    await OtpModel.deleteOne({ phone: cleanPhone });

    console.log(`[OTP Service] ✅ OTP verified for ${cleanPhone}`);

    return {
      success: true,
      message: "OTP verified successfully",
    };
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof RateLimitError ||
      error instanceof NotFoundError
    ) {
      throw error;
    }
    throw new DatabaseError(
      error instanceof Error ? error.message : "Failed to verify OTP"
    );
  }
}

/**
 * Clear rate limit for testing/admin purposes
 * @param identifier - Email or phone number to clear rate limit for
 */
export function clearRateLimit(identifier: string): void {
  const cleanIdentifier = identifier.toLowerCase().trim();
  delete lastOtpSentTime[cleanIdentifier];
  console.log(`[OTP Service] 🧹 Rate limit cleared for ${cleanIdentifier}`);
}
