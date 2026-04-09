/**
 * POST /api/send-otp
 * Sends OTP via WhatsApp using AiSensy (Meta WhatsApp Cloud API)
 * 
 * Request:
 * POST /api/send-otp
 * { "phone": "+91XXXXXXXXXX" or "XXXXXXXXXX" }
 * 
 * Response:
 * { 
 *   "success": true, 
 *   "message": "OTP sent successfully to your WhatsApp",
 *   "expiresIn": 300 
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateIndianPhoneNumber,
  formatPhoneNumber,
  sendOTPViaAiSensy,
} from "@/lib/aisensy";
import {
  generateOTP,
  storeOTP,
  isRateLimited,
  setRateLimit,
  getRateLimitRemainingTime,
  isInCooldown,
  setCooldown,
  getCooldownRemainingTime,
} from "@/lib/otp-manager";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // Validation: Phone number required
    if (!phone || typeof phone !== "string") {
      return errorResponse(
        "Phone number is required",
        "INVALID_PHONE",
        400
      );
    }

    // Validation: Indian phone format
    if (!validateIndianPhoneNumber(phone)) {
      return errorResponse(
        "Invalid phone number. Please provide a valid Indian phone number (+91XXXXXXXXXX or 10-digit number)",
        "INVALID_PHONE_FORMAT",
        400
      );
    }

    // Format phone number to standard format
    const formattedPhone = formatPhoneNumber(phone);

    // Validation: Check cooldown (prevent spam)
    if (isInCooldown(formattedPhone)) {
      const cooldownTime = getCooldownRemainingTime(formattedPhone);
      return errorResponse(
        `Please wait ${cooldownTime} seconds before requesting another OTP.`,
        "COOLDOWN_ACTIVE",
        429
      );
    }

    // Validation: Rate limiting
    if (isRateLimited(formattedPhone)) {
      const remainingTime = getRateLimitRemainingTime(formattedPhone);
      return errorResponse(
        `Too many OTP requests. Please try again in ${remainingTime} seconds.`,
        "RATE_LIMIT_EXCEEDED",
        429
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP (5-minute expiry)
    storeOTP(formattedPhone, otp);

    // Set rate limit (1 hour window, max 3 attempts)
    setRateLimit(formattedPhone);

    // Set cooldown (30 seconds)
    setCooldown(formattedPhone);

    // Send OTP via AiSensy
    const aiSensyResponse = await sendOTPViaAiSensy(formattedPhone, otp);

    if (!aiSensyResponse.success) {
      // Log error but don't expose details to client
      console.error("[AiSensy] OTP Send Error:", {
        phone: formattedPhone,
        error: aiSensyResponse.data,
        timestamp: new Date().toISOString(),
      });

      return errorResponse(
        "Failed to send OTP. Please try again later.",
        "AISENSY_ERROR",
        500
      );
    }

    // Success response
    console.log(`[API] ✅ OTP sent via WhatsApp to ${formattedPhone}`);

    return successResponse(
      {
        phone: formattedPhone,
        expiresIn: 300, // 5 minutes in seconds
      },
      "OTP sent successfully to your WhatsApp",
      200
    );
  } catch (error) {
    console.error("[API] ❌ Send OTP error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    // Handle app errors
    const { statusCode, message, code } = handleError(error);
    return errorResponse(message, code, statusCode);
  }
}

/**
 * GET /api/send-otp
 * Health check endpoint
 */
export async function HEAD(request: NextRequest) {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "OTP service is running",
    method: "WhatsApp (WATI API)",
    version: "2.0.0",
  });
}
