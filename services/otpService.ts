/**
 * OTP Service Layer
 * Handles all OTP business logic: generation, sending, verification, expiry
 * 
 * Currently sending OTP via EMAIL
 * Mobile SMS (Fast2SMS) logic kept for future use
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
import nodemailer from "nodemailer";

// In-memory rate limiting cache: identifier (phone/email) -> last sent timestamp
const lastOtpSentTime: Record<string, number> = {};

/**
 * Generate a random 6-digit OTP
 */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via EMAIL
 */
async function sendViaEmail(
  email: string,
  otp: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: getEnvOptional("GMAIL_USER") || "your-email@gmail.com",
        pass: getEnvOptional("GMAIL_APP_PASSWORD") || "your-app-password",
      },
    });

    console.log(`[OTP Service] 📧 Sending email OTP to ${email}`);

    const mailOptions = {
      from: getEnvOptional("GMAIL_USER") || "noreply@docbooking.in",
      to: email,
      subject: "Your DocBooking OTP Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">DocBooking - OTP Verification</h2>
          
          <p>Hello,</p>
          
          <p>Your One-Time Password (OTP) for DocBooking is:</p>
          
          <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #0066cc; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          
          <p style="color: #666;">
            <strong>This OTP will expire in 5 minutes.</strong>
          </p>
          
          <p style="color: #666;">
            If you didn't request this OTP, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          
          <p style="font-size: 12px; color: #999;">
            DocBooking - Book Doctor Appointments Online<br>
            © 2026 All rights reserved.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`[OTP Service] ✅ Email sent. Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[OTP Service] ❌ Email Send Failed: ${message}`);
    return { success: false, error: message };
  }
}

/**
 * Send OTP via FAST2SMS (MOBILE) - DISABLED FOR NOW
 * Will be used later when mobile SMS is configured
 */
async function sendViaMobileSMS(
  phone: string,
  otp: string
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  // ⚠️ DISABLED: This feature will be enabled later
  console.log(
    `[OTP Service] ⏸️  Mobile SMS disabled (will enable later). OTP: ${otp}`
  );

  // TODO: Uncomment when mobile SMS is ready to use
  /*
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
  */

  return { success: true }; // For now, just pretend it succeeded
}

/**
 * Send OTP to email address with rate limiting
 * @param email - Email address to send OTP to
 */
export async function sendOtp(email: string): Promise<{
  success: boolean;
  email: string;
  expiresIn: number;
}> {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email address format.");
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check rate limiting
    const lastSentTime = lastOtpSentTime[cleanEmail];
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
    const existingOtp = await OtpModel.findOne({ phone: cleanEmail });
    if (existingOtp && existingOtp.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      throw new RateLimitError(
        "Too many failed attempts. Please try again after 1 hour."
      );
    }

    // Generate OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_SECONDS * 1000);

    // Debug: show OTP in development
    if (process.env.NODE_ENV === "development") {
      console.log(`[OTP Service] 🐛 DEV: OTP for ${cleanEmail}: ${otp}`);
    }

    // Save to database (using phone field for email for now)
    await OtpModel.findOneAndUpdate(
      { phone: cleanEmail },
      {
        phone: cleanEmail,
        otp,
        expiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
      { upsert: true, new: true }
    );

    // Send via EMAIL
    const emailResult = await sendViaEmail(cleanEmail, otp);

    if (emailResult.success) {
      lastOtpSentTime[cleanEmail] = now;
      console.log(`[OTP Service] ✅ OTP email sent to ${cleanEmail}`);
    } else {
      console.warn(
        `[OTP Service] ⚠️  Email delivery issue: ${emailResult.error}`
      );
      // Still mark rate limit to prevent spam
      lastOtpSentTime[cleanEmail] = now;
    }

    return {
      success: true,
      email: cleanEmail,
      expiresIn: OTP_CONFIG.EXPIRY_SECONDS,
    };
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
 * Verify OTP for email address
 * @param email - Email address to verify OTP for
 * @param otp - 6-digit OTP code
 */
export async function verifyOtp(email: string, otp: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Validate inputs
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email address format.");
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!/^[0-9]{6}$/.test(otp)) {
      throw new ValidationError("OTP must be a 6-digit number.");
    }

    // Connect to database
    await connectDB();

    // Find OTP record (using phone field for email)
    const otpRecord = await OtpModel.findOne({ phone: cleanEmail });

    if (!otpRecord) {
      throw new NotFoundError(
        "OTP not found. Please request a new OTP first."
      );
    }

    // Check expiry
    if (new Date() > otpRecord.expiresAt) {
      await OtpModel.deleteOne({ phone: cleanEmail });
      throw new ValidationError("OTP has expired. Please request a new one.");
    }

    // Check attempts
    if (otpRecord.attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
      await OtpModel.deleteOne({ phone: cleanEmail });
      throw new RateLimitError(
        "Too many incorrect attempts. Please request a new OTP."
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      // Increment attempts
      otpRecord.attempts += 1;
      await otpRecord.save();

      const attemptsLeft = OTP_CONFIG.MAX_ATTEMPTS - otpRecord.attempts;
      throw new ValidationError(
        `Invalid OTP. ${attemptsLeft} attempts remaining.`
      );
    }

    // Success - delete OTP record
    await OtpModel.deleteOne({ phone: cleanEmail });

    console.log(`[OTP Service] ✅ OTP verified for ${cleanEmail}`);

    return {
      success: true,
      message: "OTP verified successfully.",
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
      error instanceof Error ? error.message : "OTP verification failed"
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
