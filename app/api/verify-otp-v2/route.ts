/**
 * POST /api/verify-otp-v2
 * Verifies an OTP submitted by the user
 * 
 * Request:
 * {
 *   "phone": "9876543210" or "+919876543210",
 *   "otp": "123456"
 * }
 * 
 * Response (Success - 200):
 * {
 *   "success": true,
 *   "message": "OTP verified successfully"
 * }
 * 
 * Response (Incorrect OTP - 401):
 * {
 *   "success": false,
 *   "message": "Incorrect OTP. 2 attempts remaining."
 * }
 * 
 * Response (No OTP Found - 400):
 * {
 *   "success": false,
 *   "message": "No OTP found. Please request a new OTP."
 * }
 * 
 * Response (OTP Expired - 400):
 * {
 *   "success": false,
 *   "message": "OTP expired. Please request a new OTP."
 * }
 * 
 * Response (Max Attempts Exceeded - 401):
 * {
 *   "success": false,
 *   "message": "Maximum verification attempts exceeded. Please request a new OTP."
 * }
 * 
 * Response (Bad Input - 400):
 * {
 *   "success": false,
 *   "message": "Phone and OTP are required"
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateSessionToken } from '@/lib/session-token';

// Import OTP functions from lib
const {
  formatPhone,
  verifyOTP,
  getStoreDebugInfo
} = require('@/lib/aisensyOTPv2');

export async function POST(request: NextRequest) {
  try {
    // Log incoming request
    console.log(`[API] POST /api/verify-otp-v2`);

    // Parse request body
    const body = await request.json();
    const { phone, otp } = body;

    // Validation: Both phone and OTP required
    if (!phone || !otp) {
      console.log(`[API] Missing parameters: phone=${!!phone}, otp=${!!otp}`);
      return NextResponse.json(
        {
          success: false,
          message: 'Phone and OTP are required'
        },
        { status: 400 }
      );
    }

    // Validation: OTP must be 6 digits
    if (!/^\d{6}$/.test(otp)) {
      console.log(`[API] Invalid OTP format: ${otp}`);
      return NextResponse.json(
        {
          success: false,
          message: 'OTP must be a 6-digit number'
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

    console.log(`[API] /api/verify-otp-v2 store state before verify`, getStoreDebugInfo());

    // Verify OTP
    const result = verifyOTP(formattedPhone, otp);

    if (result.success) {
      // Generate session token for subsequent booking API calls
      const sessionToken = generateSessionToken(phone);
      console.log(`[API] OTP verified successfully for ${formattedPhone}`);
      return NextResponse.json(
        {
          success: true,
          message: result.message,
          sessionToken,
        },
        { status: 200 }
      );
    } else {
      // Verification failed
      console.log(`[API] OTP verification failed for ${formattedPhone}: ${result.message}`);

      // Determine appropriate HTTP status code
      let statusCode = 400;
      if (result.message.includes('Incorrect OTP')) {
        statusCode = 401; // Unauthorized - wrong OTP
      } else if (result.message.includes('Maximum verification attempts')) {
        statusCode = 401; // Unauthorized - too many attempts
      }

      return NextResponse.json(
        {
          success: false,
          reason: result.reason || 'VERIFICATION_FAILED',
          message: result.message
        },
        { status: statusCode }
      );
    }

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
