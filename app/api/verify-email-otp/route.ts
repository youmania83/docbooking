/**
 * POST /api/verify-email-otp
 * Verify OTP for email address
 *
 * Features:
 * - Validates OTP format and expiry
 * - Tracks verification attempts (max 5)
 * - Deletes OTP after successful verification
 * - Security: Prevents brute force via attempt limit
 *
 * Request:
 * POST /api/verify-email-otp
 * { "email": "user@example.com", "otp": "123456" }
 *
 * Response (Success):
 * { "success": true, "data": { "verified": true, "message": "Email verified successfully" } }
 *
 * Response (Error):
 * { "success": false, "error": "Invalid or expired OTP", "code": "OTP_INVALID", "details": { "attemptsRemaining": 2 } }
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OtpModel from "@/models/Otp";
import { OTP_CONFIG } from "@/config/constants";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
} from "@/lib/utils/errors";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";
import { VerifyOtpSchema } from "@/lib/validation/schemas";
import { z } from "zod";

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validatedData = VerifyOtpSchema.parse(body);
    const { email, otp } = validatedData;

    if (process.env.NODE_ENV === "development") {
      console.log(`[🔍 OTP Verification] Email: ${email} | OTP: ${otp}`);
    }

    // Connect to database
    await connectDB();

    // Find OTP record
    const otpRecord = await OtpModel.findOne({ email });

    if (!otpRecord) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[❌ OTP Not Found] Email: ${email}`);
      }

      throw new NotFoundError("No OTP found for this email. Please request a new OTP.");
    }

    // Check if OTP expired
    if (new Date() > otpRecord.expiresAt) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[⏰ OTP Expired] Email: ${email}`);
      }

      // Delete expired OTP
      await OtpModel.deleteOne({ _id: otpRecord._id });

      throw new NotFoundError("OTP has expired. Please request a new OTP.");
    }

    // Check attempts limit
    if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      if (process.env.NODE_ENV === "development") {
        console.log(`[🚫 Max Attempts Exceeded] Email: ${email}`);
      }

      // Delete OTP after max attempts
      await OtpModel.deleteOne({ _id: otpRecord._id });

      throw new ValidationError(
        "Too many failed attempts. Please request a new OTP."
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const attemptsRemaining = OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts;

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[❌ Wrong OTP] Email: ${email} | Attempt: ${otpRecord.attempts}/${OTP_CONFIG.MAX_ATTEMPTS}`
        );
      }

      return errorResponse(
        `Invalid OTP. ${attemptsRemaining} attempts remaining.`,
        "OTP_INVALID",
        400,
        { attemptsRemaining: attemptsRemaining.toString() }
      );
    }

    // OTP is valid! Delete it
    await OtpModel.deleteOne({ _id: otpRecord._id });

    if (process.env.NODE_ENV === "development") {
      console.log(`[✅ OTP Verified] Email: ${email}`);
    }

    return successResponse(
      {
        verified: true,
        email,
        message: "Email verified successfully",
      },
      "OTP verified successfully",
      200
    );
  } catch (error) {
    console.error("[❌ Verify OTP Error]:", error);

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
        "Invalid request format",
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
