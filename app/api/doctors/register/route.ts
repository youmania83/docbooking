/**
 * POST /api/doctors/register
 * Handles doctor early registration requests
 * Sends confirmation email to admin and doctor
 * 
 * Request:
 * POST /api/doctors/register
 * { "email": "clinic@email.com" }
 * 
 * Response:
 * { 
 *   "success": true, 
 *   "message": "Registration submitted successfully. We'll contact you soon."
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

    console.log("[Doctor Register] 📧 Request received for:", email);

    // Validate input
    if (!email) {
      console.warn("[Doctor Register] ❌ Email is required");
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
      console.warn("[Doctor Register] ❌ Invalid email format:", email);
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
      subject: "New Doctor Registration - Early Access Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563EB; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0;">New Doctor Registration</h2>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0;"><strong>Doctor Email:</strong></p>
            <p style="margin: 0; font-size: 16px; color: #2563EB;">${email}</p>
          </div>

          <div style="background-color: #f0f7ff; padding: 16px; border-left: 4px solid #2563EB; border-radius: 4px; margin-bottom: 20px;">
            <p style="margin: 0; color: #1e3a8a; font-weight: 500;">
              A doctor has submitted their interest for early listing on DocBooking.
            </p>
          </div>

          <div style="border-top: 1px solid #ddd; padding-top: 15px; text-align: center; color: #666; font-size: 12px;">
            <p style="margin: 0;">DocBooking Early Access System</p>
            <p style="margin: 5px 0 0 0;">Sent: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    const doctorEmailContent = {
      from: senderEmail,
      to: email,
      subject: "Application Received - DocBooking Early Access",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #2563EB; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="margin: 0;">DocBooking Early Access</h2>
          </div>
          
          <div style="padding: 20px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0;">Hello,</p>
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              Thank you for your interest in DocBooking! We have received your application for early listing.
            </p>
            
            <p style="margin: 0 0 15px 0; line-height: 1.6;">
              Our team will review your application and contact you soon with next steps. We're excited to have you among the first doctors on our platform.
            </p>

            <div style="background-color: #f0f7ff; padding: 16px; border-left: 4px solid #2563EB; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0; color: #1e3a8a;">
                <strong>What's next?</strong><br>
                Our team will reach out within 24-48 hours with details about free listing during early access.
              </p>
            </div>

            <p style="margin: 20px 0 0 0; line-height: 1.6;">
              If you have questions in the meantime, feel free to reply to this email.
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
      doctorEmailContent as Parameters<typeof sendEmails>[0][0],
    ]);

    if (!result.success) {
      console.error("[Doctor Register] ❌ Email sending failed:", result.errors);
      return getErrorResponse(
        new Error(result.errors?.[0] || "Failed to send emails")
      );
    }

    console.log("[Doctor Register] ✅ Emails sent successfully");
    return NextResponse.json(
      {
        success: true,
        message:
          "Registration submitted successfully. We'll contact you soon.",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[Doctor Register] ❌ Unexpected error:", error);
    return getErrorResponse(
      error,
      "Failed to process registration. Please try again."
    );
  }
}

    return NextResponse.json(
      {
        success: false,
        message:
          error.message || "Failed to process registration. Please try again.",
      },
      { status: 500 }
    );
  }
}
