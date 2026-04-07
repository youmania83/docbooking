/**
 * POST /api/verify-otp
 * Verify OTP sent to mobile phone
 * 
 * Request:
 * POST /api/verify-otp
 * { "phone": "9876543210", "otp": "123456" }
 * 
 * Response:
 * { "success": true, "data": { "message": "OTP verified successfully" } }
 */

import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/services/otpService";
import { VerifyOtpSchema } from "@/lib/validation/schemas";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = VerifyOtpSchema.parse(body);

    // Get phone number (either from phone field or email field for backward compat)
    const phone = validatedData.phone || (typeof validatedData.email === 'string' ? validatedData.email : '');
    
    if (!phone) {
      throw new Error("Phone number is required");
    }

    // Call service layer (using phone/SMS)
    const result = await verifyOtp(phone, validatedData.otp);

    console.log(`[API] ✅ OTP verified for ${phone}`);

    return successResponse(result, "OTP verified successfully", 200);
  } catch (error) {
    console.error("[API] ❌ Verify OTP error:", error);

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
 * GET /api/verify-otp
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "OTP verification service is running",
  });
}
