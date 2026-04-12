/**
 * AiSensy WhatsApp OTP Module v2 - QUICK REFERENCE
 * 
 * Complete integration guide for backend developers
 * DocBooking.in doctor appointment booking platform
 */

// ============================================================================
// QUICK SETUP (5 Minutes)
// ============================================================================

/**
 * 1. Get AiSensy API Key (1 min)
 * - Go to https://www.aisensy.com
 * - Sign in → Settings → Manage → Copy API Key
 * 
 * 2. Create Campaign (1 min)
 * - Campaigns → New → WhatsApp
 * - Name: "docbooking_otp_basic"
 * - Template: "{{1}} is your verification code."
 * - Status: "Live"
 * 
 * 3. Configure .env.local (1 min)
 * - Add 3 variables:
 *   AISENSY_API_KEY=your_key_here
 *   AISENSY_CAMPAIGN_NAME=docbooking_otp_basic
 *   OTP_EXPIRY_SECONDS=300
 * 
 * 4. Restart server (1 min)
 * - Stop: Ctrl+C
 * - Start: npm run dev
 * 
 * 5. Test (1 min)
 * - curl -X POST http://localhost:3000/api/send-otp-v2 \
 *     -H "Content-Type: application/json" \
 *     -d '{"phone":"9876543210"}'
 */

// ============================================================================
// FILES CREATED
// ============================================================================

/**
 * 1. /lib/aisensyOTPv2.js (230 lines)
 *    Core OTP logic - no Next.js dependencies
 *    Functions:
 *    - generateOTP() → "123456"
 *    - formatPhone("9876543210") → "+919876543210"
 *    - sendWhatsAppOTP(phone, otp, userName)
 *    - verifyOTP(phone, inputOtp)
 *    - storeOTP(phone, otp)
 *    - clearOTP(phone)
 *    - isRateLimited(phone)
 *    - recordRequest(phone)
 *    - getStoreDebugInfo()
 * 
 * 2. /app/api/send-otp-v2/route.ts (120 lines)
 *    Next.js API route to send OTP
 *    POST /api/send-otp-v2
 *    Request: { phone, userName? }
 *    Response: { success, message, expiresIn, data }
 * 
 * 3. /app/api/verify-otp-v2/route.ts (110 lines)
 *    Next.js API route to verify OTP
 *    POST /api/verify-otp-v2
 *    Request: { phone, otp }
 *    Response: { success, message }
 * 
 * 4. AISENSY_OTP_V2_SETUP.md (500+ lines)
 *    Complete setup guide with troubleshooting
 * 
 * 5. AISENSY_OTP_V2_TEST_GUIDE.md (400+ lines)
 *    Testing guide with curl examples
 * 
 * 6. AISENSY_OTP_V2_QUICK_REFERENCE.md (this file)
 *    Quick developer reference
 */

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * EXAMPLE 1: React Component Integration
 * 
 * Use in your booking form component:
 */

import { useState } from 'react';

export function PhoneVerificationForm() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/send-otp-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          userName: 'DocBooking User'
        })
      });

      const data = await response.json();

      if (data.success) {
        setStep('otp');
        console.log(`OTP will expire in ${data.expiresIn} seconds`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/verify-otp-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: phone,
          otp: otp
        })
      });

      const data = await response.json();

      if (data.success) {
        // Phone verified! Proceed with booking
        console.log('Phone verified successfully');
        onVerified(phone); // Callback
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onVerified = (verifiedPhone) => {
    // Handle verification success
    // Example: create session token, redirect to next step, etc.
  };

  return (
    <div className="form-container">
      {step === 'phone' ? (
        <>
          <input
            type="tel"
            placeholder="10-digit phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />
          <button onClick={handleSendOTP} disabled={loading}>
            {loading ? 'Sending...' : 'Send OTP via WhatsApp'}
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            disabled={loading}
            maxLength="6"
            inputMode="numeric"
          />
          <button onClick={handleVerifyOTP} disabled={loading}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button onClick={() => setStep('phone')}>
            Use different phone
          </button>
        </>
      )}
      
      {error && <div className="error">{error}</div>}
    </div>
  );
}

// ============================================================================
// DIRECT FUNCTION USAGE (Backend)
// ============================================================================

/**
 * EXAMPLE 2: Use functions directly in server code
 */

const {
  generateOTP,
  formatPhone,
  sendWhatsAppOTP,
  verifyOTP,
  storeOTP
} = require('@/lib/aisensyOTPv2');

// Step 1: Format user input
const userPhone = '9876543210';
const formatted = formatPhone(userPhone); // "+919876543210"

// Step 2: Generate OTP
const otp = generateOTP(); // "123456"

// Step 3: Store for verification
storeOTP(formatted, otp);

// Step 4: Send via WhatsApp
const result = await sendWhatsAppOTP(formatted, otp, 'John Doe');

if (result.success) {
  console.log('OTP sent successfully');
  // Now user can verify with: verifyOTP(formatted, userProvidedOTP)
} else {
  console.error('Failed to send:', result.error);
}

// ============================================================================
// HTTP API SPECIFICATION
// ============================================================================

/**
 * Endpoint 1: Send OTP
 * 
 * POST /api/send-otp-v2
 * 
 * Request Headers:
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "phone": "9876543210" | "+919876543210" | "9876-543-210",
 *   "userName": "John Doe" (optional)
 * }
 * 
 * Success Response (HTTP 200):
 * {
 *   "success": true,
 *   "message": "OTP sent successfully to your WhatsApp",
 *   "expiresIn": 300,
 *   "data": {
 *     "status": "success",
 *     "message": "Message sent successfully!",
 *     "data": { "destination": "919876543210" }
 *   }
 * }
 * 
 * Error: Rate Limited (HTTP 429):
 * {
 *   "success": false,
 *   "message": "Too many OTP requests from this phone. Please try again in 10 minutes."
 * }
 * 
 * Error: Bad Input (HTTP 400):
 * {
 *   "success": false,
 *   "message": "Invalid phone format: Phone number must be a non-empty string. Expected 10-digit Indian number."
 * }
 * 
 * Error: Server Error (HTTP 500):
 * {
 *   "success": false,
 *   "message": "Failed to send OTP. Please try again later."
 * }
 */

/**
 * Endpoint 2: Verify OTP
 * 
 * POST /api/verify-otp-v2
 * 
 * Request Headers:
 * Content-Type: application/json
 * 
 * Request Body:
 * {
 *   "phone": "9876543210" | "+919876543210",
 *   "otp": "123456"
 * }
 * 
 * Success Response (HTTP 200):
 * {
 *   "success": true,
 *   "message": "OTP verified successfully"
 * }
 * 
 * Error: Wrong OTP (HTTP 401):
 * {
 *   "success": false,
 *   "message": "Incorrect OTP. 2 attempts remaining."
 * }
 * 
 * Error: Max Attempts (HTTP 401):
 * {
 *   "success": false,
 *   "message": "Maximum verification attempts exceeded. Please request a new OTP."
 * }
 * 
 * Error: Expired (HTTP 400):
 * {
 *   "success": false,
 *   "message": "OTP expired. Please request a new OTP."
 * }
 * 
 * Error: Not Found (HTTP 400):
 * {
 *   "success": false,
 *   "message": "No OTP found. Please request a new OTP."
 * }
 * 
 * Error: Bad Input (HTTP 400):
 * {
 *   "success": false,
 *   "message": "Phone and OTP are required"
 * }
 */

// ============================================================================
// CURL TESTING
// ============================================================================

/**
 * Test 1: Send OTP
 * 
 * Save as test_send.sh:
 */
#!/bin/bash
PHONE="9876543210"
ENDPOINT="http://localhost:3000/api/send-otp-v2"

echo "Sending OTP to $PHONE..."
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"userName\":\"Test User\"}" | jq .

// Run: bash test_send.sh

/**
 * Test 2: Verify OTP (update OTP_VALUE first)
 * 
 * Save as test_verify.sh:
 */
#!/bin/bash
PHONE="9876543210"
OTP_VALUE="123456"  # <- Update this with the actual OTP from logs
ENDPOINT="http://localhost:3000/api/verify-otp-v2"

echo "Verifying OTP for $PHONE..."
curl -X POST "$ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"otp\":\"$OTP_VALUE\"}" | jq .

// Run: bash test_verify.sh

// ============================================================================
// CONFIGURATION CONSTANTS
// ============================================================================

/**
 * Review these settings in /lib/aisensyOTPv2.js
 * 
 * OTP_LENGTH = 6 digits
 * - Standard OTP length
 * - Change to 4, 8, or other if needed
 * 
 * OTP_EXPIRY_SECONDS = 300 (5 minutes)
 * - How long OTP is valid
 * - Change via OTP_EXPIRY_SECONDS environment variable
 * 
 * MAX_ATTEMPTS = 3
 * - Wrong OTP attempts allowed
 * - After 3 wrong: lockout, must resend
 * - Change in code and rebuild
 * 
 * RATE_LIMIT_WINDOW = 10 * 60 * 1000 (10 minutes)
 * - Window for rate limiting
 * - Change in code and rebuild
 * 
 * MAX_REQUESTS_PER_WINDOW = 3
 * - Max OTP sends in rate limit window
 * - After 3: "too many requests" error
 * - Change in code and rebuild
 * 
 * AISENSY_ENDPOINT = 'https://backend.aisensy.com/campaign/t1/api/v2'
 * - Do NOT change this - it's the official AiSensy v2 endpoint
 * - Note: Different from old v1 endpoint
 */

// ============================================================================
// DEBUGGING & MONITORING
// ============================================================================

/**
 * Check server logs during OTP send:
 * 
 * [OTP Generate] Generated OTP: 123456
 * [Format Phone] 9876543210 → +919876543210
 * [OTP Store] Stored OTP for +919876543210, expires in 300s
 * [Rate Limit] Recorded request for +919876543210 (1 in window)
 * [AiSensy Request] Sending OTP via WhatsApp
 * [AiSensy Request] Endpoint: https://backend.aisensy.com/campaign/t1/api/v2
 * [AiSensy Request] Payload: { ... full payload ... }
 * [AiSensy Response] HTTP Status: 200
 * [AiSensy Response] Data: { ... full response ... }
 * [AiSensy Success] OTP sent to +919876543210
 * [API] OTP sent successfully to +919876543210
 */

/**
 * Enable detailed logging (add to route handler):
 */
const { getStoreDebugInfo } = require('@/lib/aisensyOTPv2');

// Add this in your API route:
console.log('OTP Store Status:', getStoreDebugInfo());

// Output:
// {
//   activeOTPs: [
//     { phone: "+919876543210", expiresIn: 295, attempts: 0 },
//     { phone: "+919876543211", expiresIn: 280, attempts: 1 }
//   ],
//   totalActive: 2,
//   rateLimitedPhones: ["+919876543210"]
// }

// ============================================================================
// PRODUCTION CONSIDERATIONS
// ============================================================================

/**
 * 1. Migrate from In-Memory to Redis
 * 
 * Current issue: OTPs lost when server restarts
 * 
 * Solution:
 * - Install Redis: npm install redis
 * - Modify /lib/aisensyOTPv2.js to use Redis instead of Map
 * - Keep TTL for automatic expiry
 * 
 * Changes needed:
 * - Replace Map with Redis client
 * - setex otpkey (for TTL support)
 * - Get key with get
 * - Delete key after verification
 */

/**
 * 2. Add Error Tracking (Sentry)
 * 
 * Current: Errors log to console only
 * 
 * Improvement:
 * - npm install @sentry/nextjs
 * - Capture AiSensy API errors
 * - Track rate limit patterns
 * - Alert on high error rates
 */

/**
 * 3. Add Analytics / Logging
 * 
 * Track:
 * - Times OTP was sent
 * - Verification success rates
 * - Common failure reasons
 * - Rate limit frequency
 * - Phone number patterns
 * 
 * Store in database for analysis
 */

/**
 * 4. Add Rate Limit Bypass (Admin)
 * 
 * Allow admin to resend OTP immediately:
 * - Check if request from admin IP
 * - Skip rate limit check
 * - Log bypass action
 */

/**
 * 5. Implement Session Tokens
 * 
 * After successful OTP verification:
 * - Generate secure session token
 * - Store token with expiry in Redis
 * - Return token to frontend
 * - Frontend uses token for booking flow
 * - Backend validates token before creating booking
 */

// ============================================================================
// COMPARISON: v1 vs v2 API
// ============================================================================

/**
 * If you're migrating from the old API implementation:
 * 
 * OLD (v1):
 * - Endpoint: https://api.aisensy.com/send-message
 * - Different payload structure
 * - Different error handling
 * 
 * NEW (v2):
 * - Endpoint: https://backend.aisensy.com/campaign/t1/api/v2
 * - Standardized payload (as per user spec)
 * - Better error messages
 * - More reliable delivery
 * 
 * You should use NEW (v2 in this implementation)
 */

// ============================================================================
// FREQUENTLY ASKED QUESTIONS
// ============================================================================

/**
 * Q: Why can't I reach api.aisensy.com?
 * A: DNS issue on your machine. Fix: System Settings → Network → DNS → Add 8.8.8.8
 * 
 * Q: OTP sends but message never arrives?
 * A: Campaign not "Live" or WABA not verified. Check AiSensy dashboard status.
 * 
 * Q: OTP expires too quickly?
 * A: Change OTP_EXPIRY_SECONDS in .env.local (default 300 = 5 minutes)
 * 
 * Q: Can I customize the OTP message?
 * A: Yes, change template in AiSensy dashboard. Must start with {{1}} for the OTP code.
 * 
 * Q: How do I test without real WhatsApp?
 * A: Set AISENSY_MOCK_MODE=true in .env.local (check /lib/aisensyOTPv2.js for mock implementation)
 * 
 * Q: Can I send SMS as fallback?
 * A: Not in this v2 module. Would need separate SMS provider integration.
 * 
 * Q: How do I ensure rate limiting works correctly?
 * A: In-memory Map works for single server. For distributed: migrate to Redis.
 * 
 * Q: What data is sent to AiSensy?
 * A: Phone number, OTP, campaign name. Your actual user data stays local.
 */

// ============================================================================
// SUPPORT & DOCUMENTATION
// ============================================================================

/**
 * Full Documentation:
 * - Setup Guide: AISENSY_OTP_V2_SETUP.md
 * - Test Guide: AISENSY_OTP_V2_TEST_GUIDE.md
 * - Quick Reference: This file
 * 
 * In-Code Documentation:
 * - /lib/aisensyOTPv2.js: Detailed comments on each function
 * - /app/api/send-otp-v2/route.ts: Request/response specifications
 * - /app/api/verify-otp-v2/route.ts: Verification logic
 * 
 * External Resources:
 * - AiSensy: https://www.aisensy.com/
 * - Meta WhatsApp: https://developers.facebook.com/docs/whatsapp
 * - Next.js API Routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
 */

