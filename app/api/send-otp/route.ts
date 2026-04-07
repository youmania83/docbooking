/**
 * POST /api/send-otp
 * Send OTP to mobile phone via SMS (Fast2SMS)
 * 
 * Request:
 * POST /api/send-otp
 * { "phone": "9876543210" }
 * 
 * Response:
 * { "success": true, "data": { "phone": "9876543210", "expiresIn": 300 } }
 */

import { NextRequest, NextResponse } from "next/server";
import { sendOtp } from "@/services/otpService";
import { SendOtpSchema } from "@/lib/validation/schemas";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = SendOtpSchema.parse(body);

    // Get phone number (either from phone field or email field for backward compat)
    const phone = validatedData.phone || (typeof validatedData.email === 'string' ? validatedData.email : '');
    
    if (!phone) {
      throw new Error("Phone number is required");
    }

    // Call service layer (using phone/SMS)
    const result = await sendOtp(phone);

    console.log(`[API] ✅ OTP sent to ${phone}`);

    return successResponse(result, "OTP sent to your phone successfully", 200);
  } catch (error) {
    console.error("[API] ❌ Send OTP error:", error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.reduce(
        (acc, err) => {
          const path = err.path.join(".");
          acc[path] = err.message;
          return acc;
        },
        {} as Record<string, string>
      );

      return errorResponse(
        "Validation failed",
        "VALIDATION_ERROR",
        400,
        fieldErrors
      );
    }

    // Handle app errors
    const { statusCode, message, code } = handleError(error);
    return errorResponse(message, code, statusCode);
  }
}

/**
 * GET /api/send-otp
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "OTP service is running",
    method: "SMS (Fast2SMS)",
    version: "1.0.0",
  });
}
