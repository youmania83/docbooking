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
  clearOTP,
  beginSendAttempt,
  endSendAttempt,
  markOTPDelivered,
  getStoreDebugInfo,
  OTP_EXPIRY_SECONDS
} = require('@/lib/aisensyOTPv2');

export async function POST(request: NextRequest) {
  let formattedPhone;
  let sendLock;

  try {
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

    console.log(`[API] /api/send-otp-v2 store state before send`, getStoreDebugInfo());

    sendLock = beginSendAttempt(formattedPhone);
    if (!sendLock.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: 'OTP request already in progress. Please wait a moment and try again.'
        },
        { status: 429 }
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

    // Store OTP immediately in pending state so rapid resend/verify uses one canonical active record.
    storeOTP(formattedPhone, otp, {
      status: 'pending_delivery',
      requestId: sendLock.requestId
    });

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
      clearOTP(formattedPhone);
      return NextResponse.json(
        {
          success: false,
          message: 'Failed to send OTP. Please try again later.'
        },
        { status: 500 }
      );
    }

    markOTPDelivered(formattedPhone, sendLock.requestId);

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
  } finally {
    if (formattedPhone && sendLock?.requestId) {
      endSendAttempt(formattedPhone, sendLock.requestId);
    }
  }
}
