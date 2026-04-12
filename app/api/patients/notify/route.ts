/**
 * POST /api/patients/notify
 * Handles patient early access notifications
 * Sends confirmation email to admin and patient
 * 
 * Request:
 * POST /api/patients/notify
 * { "email": "patient@email.com" }
 * 
 * Response:
 * { 
 *   "success": true, 
 *   "message": "You'll be notified when we launch!"
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { sendEmails, getErrorResponse } from "@/lib/email-service";

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    console.log("[Patient Notify] 📧 Request received for:", email);

    // Validate input
    if (!email) {
      console.warn("[Patient Notify] ❌ Email is required");
      return NextResponse.json(
        {
          success: false,
          message: "Email is required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.warn("[Patient Notify] ❌ Invalid email format:", email);
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL || "info@docbooking.in";
    const senderEmail = process.env.GMAIL_USER;

    const adminEmailContent = {
      from: senderEmail,
      to: adminEmail,
      subject: "New Patient Signup - Early Access List",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563EB; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0;">New Patient Signup</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0;"><strong>Patient Email:</strong></p>
            <p style="margin: 0; font-size: 16px; color: #2563EB;">${email}</p>
          </div>

          <div style="background-color: #f0f7ff; padding: 16px; border-left: 4px solid #2563EB; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; color: #1e3a8a; font-weight: 500;">
              A patient has requested early access notifications for DocBooking.
            </p>
          </div>

          <div style="border-top: 1px solid #ddd; padding-top: 15px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">DocBooking Early Access System</p>
            <p style="margin: 5px 0 0 0;">Sent: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    const patientEmailContent = {
      from: senderEmail,
      to: email,
      subject: "You're on the Early Access List! - DocBooking",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563EB; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0;">Early Access Confirmed</h2>
          </div>
          
          <div style="padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0;">Hello,</p>
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              Thank you for signing up for DocBooking early access! You're now on our VIP notification list.
            </p>
            
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              We'll notify you as soon as we launch in Panipat. Be among the first to:
            </p>

            <div style="background-color: #f0f7ff; padding: 16px; border-left: 4px solid #2563EB; border-radius: 4px; margin: 20px 0;">
              <ul style="margin: 0; padding-left: 20px;">
                <li style="margin-bottom: 8px;">Skip OPD queues</li>
                <li style="margin-bottom: 8px;">Book trusted doctors instantly</li>
                <li>Get instant appointment confirmations</li>
              </ul>
            </div>

            <p style="margin: 15px 0; line-height: 1.6;">
              Stay tuned for our launch announcement!
            </p>
          </div>

          <div style="background-color: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>DocBooking</strong><br>
              Panipat's Smart Doctor Booking Platform<br>
              <a href="mailto:info@docbooking.in" style="color: #2563EB; text-decoration: none;">info@docbooking.in</a>
            </p>
          </div>

          <div style="border-top: 1px solid #ddd; padding-top: 15px; text-align: center; color: #999; font-size: 12px;">
            <p style="margin: 0;">© 2026 DocBooking.in. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    // Send both emails
    const result = await sendEmails([
      adminEmailContent as Parameters<typeof sendEmails>[0][0],
      patientEmailContent as Parameters<typeof sendEmails>[0][0],
    ]);

    if (!result.success) {
      console.error("[Patient Notify] ❌ Email sending failed:", result.errors);
      return getErrorResponse(
        new Error(result.errors?.[0] || "Failed to send emails")
      );
    }

    console.log("[Patient Notify] ✅ Emails sent successfully");
    return NextResponse.json(
      {
        success: true,
        message: "You'll be notified when we launch!",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Patient Notify] ❌ Unexpected error:", error);
    return getErrorResponse(
      error,
      "Failed to process notification. Please try again."
    );
  }
}
