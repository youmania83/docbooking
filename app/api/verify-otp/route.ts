/**
 * POST /api/verify-otp
 * Verifies OTP sent via WhatsApp using WATI
 * 
 * Request:
 * POST /api/verify-otp
 * { "phone": "+91XXXXXXXXXX" or "XXXXXXXXXX", "otp": "123456" }
 * 
 * Response:
 * { "success": true, "message": "OTP verified successfully" }
 */

import { NextRequest, NextResponse } from "next/server";
import {
  validateIndianPhoneNumber,
  formatPhoneNumber,
} from "@/lib/aisensy";
import {
  validateOTP,
  clearOTP,
} from "@/lib/otp-manager";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    // Validation: Phone number required
    if (!phone || typeof phone !== "string") {
      return errorResponse(
        "Phone number is required",
        "INVALID_PHONE",
        400
      );
    }

    // Validation: OTP required
    if (!otp || typeof otp !== "string") {
      return errorResponse(
        "OTP is required",
        "INVALID_OTP",
        400
      );
    }

    // Validation: OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return errorResponse(
        "OTP must be 6 digits",
        "INVALID_OTP_FORMAT",
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

    // Validate OTP
    const validation = validateOTP(formattedPhone, otp);

    if (!validation.valid) {
      console.warn(`[API] ⚠️  Invalid OTP attempt for ${formattedPhone}`);
      
      return errorResponse(
        validation.message,
        "INVALID_OTP",
        401
      );
    }

    // Clear OTP after successful verification
    clearOTP(formattedPhone);

    // Success response
    console.log(`[API] ✅ OTP verified for ${formattedPhone}`);

    return successResponse(
      {
        phone: formattedPhone,
        verified: true,
      },
      "OTP verified successfully",
      200
    );
  } catch (error) {
    console.error("[API] ❌ Verify OTP error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });

    // Handle app errors
    const { statusCode, message, code } = handleError(error);
    return errorResponse(message, code, statusCode);
  }
}

/**
 * GET /api/verify-otp
 * Health check endpoint
 */
export async function HEAD(request: NextRequest) {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "OTP verification service is running",
    method: "WhatsApp (WATI API)",
    version: "2.0.0",
  });
}
