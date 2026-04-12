/**
 * Email Service
 * Centralized utility for sending emails with proper error handling and logging
 */

import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

// Email transporter cache
let transporter: nodemailer.Transporter | null = null;

/**
 * Get or create email transporter
 * Validates credentials before use
 */
function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    const errorMsg =
      "❌ Email credentials not configured. Please set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local";
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  if (!transporter) {
    console.log(`[Email Service] ✅ Initializing transporter with user: ${user}`);
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user,
        pass,
      },
      logger: process.env.NODE_ENV === "development", // Enable logging in dev
    });
  }

  return transporter;
}

/**
 * Verify email configuration
 * Useful for debugging email setup issues
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    const transporter = getTransporter();
    console.log("[Email Service] Verifying email configuration...");
    await transporter.verify();
    console.log("[Email Service] ✅ Email configuration verified successfully");
    return true;
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Unknown email configuration error";
    console.error(
      "[Email Service] ❌ Email configuration failed:",
      errorMsg
    );
    throw new Error(`Email config failed: ${errorMsg}`);
  }
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  from?: string;
  text?: string;
}

/**
 * Send a single email with error handling
 */
export async function sendEmail(payload: EmailPayload): Promise<void> {
  try {
    const transporter = getTransporter();
    const senderEmail = payload.from || process.env.GMAIL_USER;

    console.log(
      `[Email Service] 📧 Sending email to: ${payload.to}`
    );

    const result = await transporter.sendMail({
      from: senderEmail,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    console.log(
      `[Email Service] ✅ Email sent successfully. Message ID: ${result.messageId}`
    );
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Unknown email sending error";
    console.error(`[Email Service] ❌ Failed to send email to ${payload.to}:`, errorMsg);

    // Re-throw with context
    throw new Error(
      `Failed to send email to ${payload.to}: ${errorMsg}`
    );
  }
}

/**
 * Send multiple emails (batch)
 * Returns array of results (successes and failures)
 */
export async function sendEmails(
  payloads: EmailPayload[]
): Promise<{ success: boolean; errors?: string[] }> {
  const errors: string[] = [];

  for (const payload of payloads) {
    try {
      await sendEmail(payload);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      errors.push(msg);
      console.error(`[Email Service] Error batch email: ${msg}`);
    }
  }

  if (errors.length === 0) {
    console.log(
      `[Email Service] ✅ All ${payloads.length} emails sent successfully`
    );
    return { success: true };
  } else if (errors.length < payloads.length) {
    console.warn(
      `[Email Service] ⚠️  ${payloads.length - errors.length}/${payloads.length} emails sent successfully. ${errors.length} failed.`
    );
    return { success: true, errors }; // Partial success
  } else {
    console.error(
      `[Email Service] ❌ All ${payloads.length} emails failed`
    );
    return { success: false, errors };
  }
}

/**
 * Get error response for API routes
 * Standardizes error responses
 */
export function getErrorResponse(
  error: unknown,
  defaultMessage: string = "Failed to send email"
) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : defaultMessage;

  console.error("[Email Service] Error response:", message);

  return NextResponse.json(
    {
      success: false,
      message,
      ...(process.env.NODE_ENV === "development" && { error: String(error) }),
    },
    { status: 500 }
  );
}
