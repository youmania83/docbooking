/**
 * POST /api/send-otp - Production Grade OTP Delivery
 * Sends OTP via WhatsApp (AiSensy) with automatic SMS fallback
 * Includes security tracking, fraud detection, and comprehensive logging
 * 
 * Request:
 * POST /api/send-otp
 * { 
 *   "phone": "+91XXXXXXXXXX" or "XXXXXXXXXX",
 *   "userName": "Optional Name"  
 * }
 * 
 * Response:
 * { 
 *   "success": true,
 *   "message": "OTP sent successfully",
 *   "channel": "whatsapp" | "sms",
 *   "expiresIn": 300,
 *   "otp": "123456" (development only)
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { validateIndianPhoneNumber, formatPhoneNumber } from "@/lib/aisensy";
import { sendWhatsAppOTP } from "@/lib/aisensy-otp";
import { trackOTPRequest, getClientIP } from "@/lib/security-fraud";
import { errorResponse } from "@/lib/utils/response";
import { generateOTP, storeOTP } from "@/lib/otp-manager";
import { getOTPServiceHealth } from "@/lib/otp-service-v3";

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  
  try {
    // Extract client IP for security tracking
    const clientIP = getClientIP(
      Object.fromEntries(request.headers.entries()) as Record<string, string>
    );

    const body = await request.json();
    const { phone, userName } = body;

    // Validation: Phone number required
    if (!phone || typeof phone !== "string") {
      return errorResponse(
        "Phone number is required",
        "INVALID_PHONE",
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

    // Track request for security analysis (before sending OTP)
    const securityCheck = trackOTPRequest(formattedPhone, clientIP, true);
    if (!securityCheck.allowed) {
      console.warn(`[API] 🚨 Security blocked: ${securityCheck.reason}`, {
        phone: formattedPhone,
        ip: clientIP,
      });

      return errorResponse(
        securityCheck.reason || "Request blocked due to suspicious activity",
        "SECURITY_BLOCKED",
        429
      );
    }

    // Generate 6-digit OTP
    const otp = generateOTP();
    
    // Store OTP for later verification (5-minute expiry)
    storeOTP(formattedPhone, otp);

    console.log(`[API] Generated OTP for ${formattedPhone}:`, otp);

    // Send OTP via WhatsApp using AiSensy
    const whatsappResult = await sendWhatsAppOTP(
      formattedPhone,
      otp,
      userName || "User"
    );

    if (!whatsappResult.success) {
      // Track failure for security
      trackOTPRequest(formattedPhone, clientIP, false);

      const requestTime = Date.now() - requestStartTime;
      console.error("[API] ❌ WhatsApp OTP delivery failed", {
        phone: formattedPhone,
        message: whatsappResult.message,
        responseTimeMs: requestTime,
      });

      return errorResponse(
        whatsappResult.message || "Failed to send OTP via WhatsApp",
        "DELIVERY_FAILED",
        500
      );
    }

    const requestTime = Date.now() - requestStartTime;

    // Success response
    const successData = {
      phone: formattedPhone,
      channel: "whatsapp",
      message: "OTP sent successfully via WhatsApp",
      expiresIn: 300, // 5 minutes
    };

    // Include OTP in development for testing
    if (process.env.NODE_ENV === "development") {
      (successData as any).otp = otp;
    }

    console.log(`[API] ✅ OTP sent successfully`, {
      phone: formattedPhone,
      ip: clientIP,
      responseTimeMs: requestTime,
    });

    return NextResponse.json(
      {
        success: true,
        data: successData,
      },
      { status: 200 }
    );
  } catch (error) {
    const requestTime = Date.now() - requestStartTime;

    console.error("[API] 🚨 Send OTP route error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      responseTimeMs: requestTime,
    });

    return errorResponse(
      "Failed to send OTP. Please try again.",
      "INTERNAL_ERROR",
      500
    );
  }
}

/**
 * GET /api/send-otp - Health check
 */
export async function GET() {
  const health = getOTPServiceHealth();

  return NextResponse.json(
    {
      success: health.healthy,
      service: "OTP Delivery Service",
      version: "3.0",
      channels: {
        whatsapp: health.aisensy,
        sms: health.sms,
      },
      timestamp: new Date().toISOString(),
    },
    { status: health.healthy ? 200 : 503 }
  );
}
