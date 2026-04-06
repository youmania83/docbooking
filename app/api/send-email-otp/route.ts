/**
 * POST /api/send-email-otp
 * Send OTP to email address with validation and rate limiting
 *
 * Features:
 * - Validates email format
 * - Prevents resend within 30 seconds
 * - Stores OTP with 5-minute expiry
 * - Sends email via Gmail SMTP
 * - Development mode: logs OTP to console
 *
 * Request:
 * POST /api/send-email-otp
 * { "email": "user@example.com" }
 *
 * Response:
 * { "success": true, "data": { "email": "user@example.com", "expiresIn": 300, "devOtp": "123456" } }
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import OtpModel from "@/models/Otp";
import { OTP_CONFIG } from "@/config/constants";
import {
  ValidationError,
  RateLimitError,
  DatabaseError,
  ExternalServiceError,
} from "@/lib/utils/errors";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";
import { SendOtpSchema } from "@/lib/validation/schemas";
import nodemailer from "nodemailer";
import { z } from "zod";

// In-memory rate limiting: email -> last sent timestamp
const lastOtpSentTime: Record<string, number> = {};

/**
 * Generate 6-digit OTP
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP email via Nodemailer + Gmail
 */
async function sendOtpEmail(email: string, otp: string): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    throw new ExternalServiceError(
      "Email service not configured. Please check environment variables.",
      "GMAIL"
    );
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const mailOptions = {
      from: gmailUser,
      to: email,
      subject: "DocBooking Verification Code",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: 1px;">DocBooking</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0; font-size: 14px;">Secure Verification</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border-top: 3px solid #667eea;">
            <p style="color: #333; font-size: 16px; margin: 0 0 20px 0;">Hello,</p>
            
            <p style="color: #555; font-size: 14px; margin: 0 0 20px 0; line-height: 1.6;">
              Your One-Time Password (OTP) for DocBooking verification is:
            </p>
            
            <div style="background-color: white; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #667eea;">
              <h2 style="color: #667eea; letter-spacing: 8px; margin: 0; font-size: 32px; font-family: 'Courier New', monospace; font-weight: bold;">
                ${otp}
              </h2>
            </div>
            
            <div style="background-color: #fff3cd; padding: 12px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <p style="color: #856404; margin: 0; font-size: 13px; font-weight: 500;">
                ⏱️ This OTP will expire in <strong>5 minutes</strong>
              </p>
            </div>
            
            <p style="color: #666; font-size: 13px; margin: 20px 0 0 0; line-height: 1.6;">
              <strong>Security Note:</strong> Never share this code with anyone. DocBooking staff will never ask for your OTP.
            </p>
            
            <p style="color: #999; font-size: 12px; margin: 20px 0 0 0; padding-top: 20px; border-top: 1px solid #ddd;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
          
          <p style="color: #999; font-size: 11px; text-align: center; margin: 15px 0;">
            DocBooking © 2026 | All rights reserved
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === "development") {
      console.log(
        `[📧 Email OTP] Sent to ${email} | Message ID: ${info.messageId}`
      );
    }
  } catch (error) {
    console.error(`[🚨 Email Error] Failed to send OTP to ${email}:`, error);
    throw new ExternalServiceError(
      "Failed to send OTP email. Please try again.",
      "GMAIL_SEND"
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request
    const body = await request.json();
    const validatedData = SendOtpSchema.parse(body);
    const { email } = validatedData;

    // Connect to database
    await connectDB();

    // Rate limiting: check if OTP was sent recently (30-second cooldown)
    const now = Date.now();
    const lastSentAt = lastOtpSentTime[email];

    if (lastSentAt && now - lastSentAt < OTP_CONFIG.RATE_LIMIT_SECONDS * 1000) {
      const secondsRemaining = Math.ceil(
        (OTP_CONFIG.RATE_LIMIT_SECONDS * 1000 - (now - lastSentAt)) / 1000
      );

      if (process.env.NODE_ENV === "development") {
        console.log(
          `[⏱️ Rate Limit] ${email} - Retry in ${secondsRemaining}s`
        );
      }

      throw new RateLimitError(
        `Please wait ${secondsRemaining} seconds before requesting another OTP`
      );
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_SECONDS * 1000);

    if (process.env.NODE_ENV === "development") {
      console.log(`[🔐 OTP Generated] Email: ${email} | OTP: ${otp}`);
    }

    // Store OTP in database
    try {
      // Clean up any existing OTP for this email first
      await OtpModel.deleteMany({ email });

      // Create new OTP record
      const otpRecord = new OtpModel({
        email,
        otp,
        expiresAt,
        attempts: 0,
      });

      await otpRecord.save();

      if (process.env.NODE_ENV === "development") {
        console.log(`[💾 OTP Saved] Email: ${email}`);
      }
    } catch (dbError) {
      console.error("[Database Error] Failed to save OTP:", dbError);
      throw new DatabaseError("Failed to save OTP. Please try again.");
    }

    // Send OTP via email
    await sendOtpEmail(email, otp);

    // Update rate limiting cache
    lastOtpSentTime[email] = now;

    // Response (include OTP in dev mode for testing)
    const responseData: any = {
      email,
      expiresIn: OTP_CONFIG.EXPIRY_SECONDS,
      message: "OTP sent successfully. Check your email.",
    };

    // In development, include OTP for testing purposes
    if (process.env.NODE_ENV === "development") {
      responseData.devOtp = otp;
      console.log(
        `[✅ Success] OTP sent to ${email} - Dev OTP: ${otp} (not sent in production)`
      );
    }

    return successResponse(responseData, "OTP sent to your email", 200);
  } catch (error) {
    console.error("[❌ Send OTP Error]:", error);

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
        "Invalid email format",
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
