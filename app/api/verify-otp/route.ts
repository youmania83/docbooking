/**
 * POST /api/verify-otp - OTP Verification with Security Tracking
 * Verifies OTP code, enforces rate limits, and tracks fraud attempts
 * 
 * Request:
 * POST /api/verify-otp
 * { 
 *   "phone": "+91XXXXXXXXXX" or "XXXXXXXXXX",
 *   "otp": "123456",
 *   "terms_accepted": true
 * }
 * 
 * Response:
 * { 
 *   "success": true,
 *   "data": {
 *     "phone": "+91XXXXXXXXXX",
 *     "verified": true,
 *     "message": "OTP verified successfully"
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { validateIndianPhoneNumber, formatPhoneNumber } from "@/lib/aisensy";
import { verifyOTPWithMetrics } from "@/lib/otp-service-v3";
import { trackOTPRequest, getClientIP } from "@/lib/security-fraud";
import { errorResponse } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();

  try {
    // Extract client IP for security tracking
    const clientIP = getClientIP(
      Object.fromEntries(request.headers.entries()) as Record<string, string>
    );

    const body = await request.json();
    const { phone, otp, terms_accepted } = body;

    // Validation: Phone number required
    if (!phone || typeof phone !== "string") {
      return errorResponse("Phone number is required", "INVALID_PHONE", 400);
    }

    // Validation: OTP required
    if (!otp || typeof otp !== "string") {
      return errorResponse("OTP is required", "INVALID_OTP", 400);
    }

    // Validation: OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return errorResponse(
        "OTP must be 6 digits",
        "INVALID_OTP_FORMAT",
        400
      );
    }

    // Validation: Terms acceptance (optional but recommended for healthcare)
    if (terms_accepted !== true) {
      console.warn(`[API] Terms not accepted for ${phone}`);
      // Optional: You can make this required
      // return errorResponse(
      //   "You must accept the Terms & Conditions to proceed",
      //   "TERMS_NOT_ACCEPTED",
      //   400
      // );
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

    // Verify OTP with metrics
    const verification = verifyOTPWithMetrics(formattedPhone, otp);

    if (!verification.valid) {
      // Track failure for security
      trackOTPRequest(formattedPhone, clientIP, false);

      const requestTime = Date.now() - requestStartTime;
      console.warn(`[API] ⚠️  Invalid OTP attempt for ${formattedPhone}`, {
        message: verification.message,
        ip: clientIP,
        responseTimeMs: requestTime,
      });

      return errorResponse(
        verification.message,
        "INVALID_OTP",
        401
      );
    }

    // Track success
    trackOTPRequest(formattedPhone, clientIP, true);

    const requestTime = Date.now() - requestStartTime;

    // Success response
    console.log(`[API] ✅ OTP verified for ${formattedPhone}`, {
      ip: clientIP,
      responseTimeMs: requestTime,
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          phone: formattedPhone,
          verified: true,
          message: "OTP verified successfully",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    const requestTime = Date.now() - requestStartTime;

    console.error("[API] 🚨 Verify OTP route error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      responseTimeMs: requestTime,
    });

    return errorResponse(
      "Failed to verify OTP. Please try again.",
      "INTERNAL_ERROR",
      500
    );
  }
}
