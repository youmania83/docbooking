/**
 * POST /api/send-otp-v2
 * Sends OTP via WhatsApp to the provided phone number
 * 
 * Request:
 * {
 *   "phone": "9876543210" or "+919876543210" or "98765-43210",
 *   "userName": "John Doe" (optional)
 * }
 * 
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "OTP sent successfully to your WhatsApp",
 *   "expiresIn": 300,
 *   "data": { ...AiSensy response }
 * }
 * 
 * Response (Rate Limited - 429):
 * {
 *   "success": false,
 *   "message": "Too many OTP requests from this phone. Please try again in 10 minutes."
 * }
 * 
 * Response (Bad Input - 400):
 * {
 *   "success": false,
 *   "message": "Invalid phone number format"
 * }
 * 
 * Response (Server Error - 500):
 * {
 *   "success": false,
 *   "message": "Failed to send OTP. Please try again later."
 * }
 */

import { NextRequest, NextResponse } from 'next/server';

// Import OTP functions from lib
// Note: In Next.js, we need to import CommonJS modules differently
const {
  generateOTP,
  formatPhone,
  isRateLimited,
  recordRequest,
  sendWhatsAppOTP,
  storeOTP,
  OTP_EXPIRY_SECONDS
} = require('@/lib/aisensyOTPv2');

export async function POST(request: NextRequest) {
  try {
    // Log incoming request
    console.log(`[API] POST /api/send-otp-v2`);

    // Parse request body
    const body = await request.json();
    const { phone, userName } = body;

    // Validation: Phone number required
    if (!phone) {
      console.log(`[API] Missing phone parameter`);
      return NextResponse.json(
        {
          success: false,
          message: 'Phone number is required'
        },
        { status: 400 }
      );
    }

    // Format and validate phone number
    let formattedPhone;
    try {
      formattedPhone = formatPhone(phone);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Invalid phone number format';
      console.log(`[API] Invalid phone format: ${errorMsg}`);
      return NextResponse.json(
        {
          success: false,
          message: errorMsg
        },
        { status: 400 }
      );
    }

    // Check rate limit
    if (isRateLimited(formattedPhone)) {
      console.log(`[API] Rate limit exceeded for ${formattedPhone}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Too many OTP requests from this phone. Please try again in 10 minutes.'
        },
        { status: 429 }
      );
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP (in-memory, will expire after OTP_EXPIRY_SECONDS)
    storeOTP(formattedPhone, otp);

    // Record this request for rate limiting
    recordRequest(formattedPhone);

    // Send OTP via WhatsApp
    const aiSensyResult = await sendWhatsAppOTP(
      formattedPhone,
      otp,
      userName || 'DocBooking User'
    );

    if (!aiSensyResult.success) {
      console.log(`[API] AiSensy failed: ${aiSensyResult.error}`);
      // If WhatsApp send failed, we should clean up the stored OTP
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send OTP. Please try again later.'
        },
        { status: 500 }
      );
    }

    // Success
    console.log(`[API] OTP sent successfully to ${formattedPhone}`);
    return NextResponse.json(
      {
        success: true,
        message: 'OTP sent successfully to your WhatsApp',
        expiresIn: OTP_EXPIRY_SECONDS,
        data: aiSensyResult.data
      },
      { status: 200 }
    );

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[API] Unexpected error:`, errorMsg);
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error. Please try again later.'
      },
      { status: 500 }
    );
  }
}
