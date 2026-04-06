/**
 * POST /api/send-otp
 * Send OTP to email address with validation and rate limiting
 * 
 * Request:
 * POST /api/send-otp
 * { "email": "user@example.com" }
 * 
 * Response:
 * { "success": true, "data": { "email": "user@example.com", "expiresIn": 300 } }
 * 
 * NOTE: Currently using EMAIL OTP
 * Mobile SMS (Fast2SMS) is disabled but kept for future use
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

    // Call service layer (now using email)
    const result = await sendOtp(validatedData.email);

    console.log(`[API] ✅ OTP sent to ${validatedData.email}`);

    return successResponse(result, "OTP sent to your email successfully", 200);
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
    method: "EMAIL (Mobile SMS disabled for now)",
    version: "2.0.0",
  });
}
