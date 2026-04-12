/**
 * TESTING GUIDE: AiSensy WhatsApp OTP Module v2
 * Complete reference for testing and debugging the OTP system
 * 
 * Ensure these environment variables are configured in .env.local:
 * - AISENSY_API_KEY=your_api_key_here
 * - AISENSY_CAMPAIGN_NAME=docbooking_otp_basic
 * - OTP_EXPIRY_SECONDS=300 (optional, defaults to 300)
 * 
 * Start the server: npm run dev
 * The API will be available at: http://localhost:3000
 */

// ============================================================================
// 1. SEND OTP - SAMPLE CURL COMMANDS
// ============================================================================

/**
 * BASIC: Send OTP to a phone number
 * 
 * Command:
 */
curl -X POST http://localhost:3000/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "userName": "John Doe"
  }'

/**
 * EXPECTED SUCCESS RESPONSE (HTTP 200):
 * 
 * {
 *   "success": true,
 *   "message": "OTP sent successfully to your WhatsApp",
 *   "expiresIn": 300,
 *   "data": {
 *     "status": "success",
 *     "message": "Message sent successfully!",
 *     "data": {
 *       "destination": "919876543210",
 *       "userName": "John Doe"
 *     }
 *   }
 * }
 * 
 * Server logs will show:
 * [AiSensy Request] Sending OTP via WhatsApp
 * [AiSensy Request] Endpoint: https://backend.aisensy.com/campaign/t1/api/v2
 * [AiSensy Request] Payload:
 * {
 *   "apiKey": "eyJ...",
 *   "campaignName": "docbooking_otp_basic",
 *   "destination": "+919876543210",
 *   "userName": "John Doe",
 *   "source": "DocBooking Website",
 *   "templateParams": ["123456"],
 *   "tags": ["otp-verification"],
 *   "attributes": {}
 * }
 * [AiSensy Response] HTTP Status: 200
 * [AiSensy Response] Data:
 * { ... AiSensy response }
 * [AiSensy Success] OTP sent to +919876543210
 * [API] OTP sent successfully to +919876543210
 */

/**
 * RATE LIMIT TEST: Try sending OTP 4 times rapidly
 * 
 * Command (run 4 times quickly):
 */
for i in {1..4}; do
  echo "\n=== Request $i ===" ;\
  curl -s -X POST http://localhost:3000/api/send-otp-v2 \
    -H "Content-Type: application/json" \
    -d '{"phone":"9876543210","userName":"Test"}' | jq .
done

/**
 * EXPECTED: First 3 succeed (HTTP 200), 4th rejected with 429
 * 
 * 4th request response (HTTP 429 - Too Many Requests):
 * {
 *   "success": false,
 *   "message": "Too many OTP requests from this phone. Please try again in 10 minutes."
 * }
 */

/**
 * PHONE FORMAT VARIATIONS: Test different phone formats
 * All should work (normalized to +919876543210)
 */
curl -X POST http://localhost:3000/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}' # Just 10 digits

curl -X POST http://localhost:3000/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{"phone": "+919876543210"}' # With country code

curl -X POST http://localhost:3000/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{"phone": "98765-43210"}' # With dashes

curl -X POST http://localhost:3000/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{"phone": "(987) 654-3210"}' # With parentheses

/**
 * ERROR: Invalid phone (less than 10 digits)
 * Expected response (HTTP 400):
 */
curl -X POST http://localhost:3000/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{"phone": "123"}'

// Response:
// {
//   "success": false,
//   "message": "Invalid phone format: Phone number must be a non-empty string. Expected 10-digit Indian number."
// }

// ============================================================================
// 2. VERIFY OTP - SAMPLE CURL COMMANDS
// ============================================================================

/**
 * BASIC: Verify OTP sent to a phone
 * 
 * Step 1: First send OTP to get the code
 */
curl -X POST http://localhost:3000/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","userName":"Test User"}'

// Server console will show the generated OTP:
// [OTP Generate] Generated OTP: 123456

/**
 * Step 2: Use that OTP to verify
 * 
 * The OTP from logs is 123456 in our example
 */
curl -X POST http://localhost:3000/api/verify-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456"
  }'

/**
 * EXPECTED SUCCESS RESPONSE (HTTP 200):
 * 
 * {
 *   "success": true,
 *   "message": "OTP verified successfully"
 * }
 * 
 * Server logs:
 * [OTP Verify] Success for +919876543210
 * [API] OTP verified successfully for +919876543210
 * 
 * Note: OTP is automatically deleted after verification
 */

/**
 * WRONG OTP: Try with incorrect OTP
 * 
 * Command (assuming the real OTP is 123456):
 */
curl -X POST http://localhost:3000/api/verify-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "999999"
  }'

/**
 * EXPECTED RESPONSE (HTTP 401):
 * {
 *   "success": false,
 *   "message": "Incorrect OTP. 2 attempts remaining."
 * }
 * 
 * If you try 3 times total with wrong OTP:
 * 3rd attempt response (HTTP 401):
 * {
 *   "success": false,
 *   "message": "Maximum verification attempts exceeded. Please request a new OTP."
 * }
 * 
 * Server logs:
 * [OTP Verify] Incorrect OTP for +919876543210 (attempt 1/3)
 * [OTP Verify] Incorrect OTP for +919876543210 (attempt 2/3)
 * [OTP Verify] Max attempts (3) exceeded for +919876543210
 */

/**
 * EXPIRED OTP: Wait for OTP to expire (5 minutes by default)
 * 
 * Or for faster testing, change OTP_EXPIRY_SECONDS to 10 in .env.local:
 * OTP_EXPIRY_SECONDS=10
 * 
 * Then:
 * 1. Send OTP
 * 2. Wait 11 seconds
 * 3. Try to verify
 */
curl -X POST http://localhost:3000/api/verify-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456"
  }'

/**
 * EXPECTED RESPONSE (HTTP 400):
 * {
 *   "success": false,
 *   "message": "OTP expired. Please request a new OTP."
 * }
 */

// ============================================================================
// 3. COMPLETE TEST SCRIPT
// ============================================================================

/**
 * Save this as test-otp.sh and run: bash test-otp.sh
 */

#!/bin/bash

API_URL="http://localhost:3000"
PHONE="9876543210"

echo "=========================================="
echo "AiSensy OTP Module Testing"
echo "=========================================="

echo -e "\n[TEST 1] Send OTP"
echo "Request: POST /api/send-otp-v2"
RESPONSE=$(curl -s -X POST $API_URL/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"userName\":\"Test User\"}")

echo "Response:"
echo $RESPONSE | jq .

# Extract OTP from server logs (this is a simulation)
# In real scenario, you would read it from server logs
OTP=$(echo $RESPONSE | jq -r '.data.templateParams[0]' 2>/dev/null || echo "123456")

echo -e "\n[TEST 2] Verify OTP with correct code"
echo "Request: POST /api/verify-otp-v2 with OTP: $OTP"
curl -s -X POST $API_URL/api/verify-otp-v2 \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"otp\":\"$OTP\"}" | jq .

echo -e "\n[TEST 3] Verify with wrong OTP (should fail)"
echo "Request: POST /api/verify-otp-v2 with wrong OTP"
curl -s -X POST $API_URL/api/verify-otp-v2 \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"otp\":\"000000\"}" | jq .

echo -e "\n[TEST 4] Try again - OTP should be deleted"
echo "Request: POST /api/verify-otp-v2 again"
curl -s -X POST $API_URL/api/verify-otp-v2 \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"otp\":\"$OTP\"}" | jq .

echo -e "\n=========================================="
echo "Testing complete"
echo "=========================================="

// ============================================================================
// 4. COMMON AISENSY API FAILURE SCENARIOS
// ============================================================================

/**
 * SCENARIO 1: Campaign not in "Live" status
 * 
 * AiSensy Response: HTTP 200 with status: "failed"
 * {
 *   "status": "failed",
 *   "message": "Campaign not live"
 * }
 * 
 * FIX: Go to AiSensy Dashboard → Campaigns → Click campaign → Check status is "Live"
 * 
 * Server logs show:
 * [AiSensy Response] HTTP Status: 200
 * [AiSensy Response] Data:
 * {
 *   "status": "failed",
 *   "message": "Campaign not live"
 * }
 */

/**
 * SCENARIO 2: Campaign name doesn't match exactly
 * 
 * Environment: AISENSY_CAMPAIGN_NAME=docbooking_otp_basic
 * AiSensy Dashboard: Campaign name is "Docbooking OTP Basic" (different case/spaces)
 * 
 * Result: AiSensy returns success HTTP 200 but message never arrives
 * (Silent failure - very hard to debug!)
 * 
 * FIX: Ensure EXACT match (case-sensitive, spaces matter)
 * Compare both strings character by character
 */

/**
 * SCENARIO 3: templateParams array size doesn't match template variables
 * 
 * Template in AiSensy: "Hi {{1}}, your code is {{2}}"
 * Sent with: templateParams: ["123456"] (only 1 param)
 * 
 * Result: HTTP 200 but message has missing variables or wrong format
 * 
 * FIX: Count {{1}}, {{2}}, ... in template and provide that many params
 * Our template is: "{{1}} is your verification code."
 * So templateParams must have exactly 1 element
 */

/**
 * SCENARIO 4: Invalid phone format
 * 
 * AiSensy Response: HTTP 400 or 422
 * {
 *   "status": "error",
 *   "message": "Invalid phone number format"
 * }
 * 
 * Common mistakes:
 * - destination: "9876543210" (missing +91)
 * - destination: "919876543210" (no + sign)
 * - destination: "+1 9876 543 210" (wrong country code or spaces)
 * 
 * FIX: Always format as "+91XXXXXXXXXX" with + sign
 * Our formatPhone() function handles this automatically
 */

/**
 * SCENARIO 5: API Key invalid or expired
 * 
 * AiSensy Response: HTTP 401
 * {
 *   "status": "unauthorized",
 *   "message": "Invalid API key"
 * }
 * 
 * Causes:
 * - AISENSY_API_KEY env var not set
 * - API key expired or revoked
 * - API key copied incorrectly
 * 
 * FIX: Generate new API key from AiSensy Dashboard
 * Settings → API Keys → Create new or copy existing key exactly
 */

/**
 * SCENARIO 6: Phone number not on WhatsApp
 * 
 * AiSensy Response: HTTP 200 success BUT message doesn't arrive
 * 
 * Reason: Phone number is not registered for WhatsApp
 * 
 * FIX: Use a phone number that has WhatsApp installed and active
 */

/**
 * SCENARIO 7: WABA (WhatsApp Business Account) not connected
 * 
 * AiSensy Response: HTTP 500 or error message about WABA credentials
 * 
 * Reason: AiSensy account not connected to verified WhatsApp Business Account
 * 
 * FIX: In AiSensy Dashboard:
 * 1. Go to Settings → WABA Configuration
 * 2. Connect your verified WhatsApp Business Account
 * 3. Ensure WABA status is "Active" and "Connected"
 */

/**
 * SCENARIO 8: Network connectivity issue
 * 
 * Error in Node.js:
 * Error: ECONNREFUSED or ENOTFOUND
 * 
 * Reason:
 * - Your machine cannot reach api.aisensy.com
 * - DNS issue (cannot resolve domain name)
 * - AiSensy server is down
 * - Network blocking (firewall/proxy)
 * 
 * FIX: Test DNS resolution:
 * resolve api.aisensy.com
 * nslookup backend.aisensy.com
 * 
 * If DNS fails, update to Google DNS (8.8.8.8)
 */

// ============================================================================
// 5. DEBUGGING COMMANDS
// ============================================================================

/**
 * Check if environment variables are loaded
 */
cd /Users/yogeshkumarwadhwa/Documents/Docbooking
grep "AISENSY_" .env.local

/**
 * Start dev server with verbose logging
 */
npm run dev 2>&1 | grep -i aisensy

/**
 * Check OTP store status (debug endpoint)
 * Add this to your API route temporarily for debugging:
 */
const { getStoreDebugInfo } = require('@/lib/aisensyOTPv2');
console.log(getStoreDebugInfo());

// Output example:
// {
//   "activeOTPs": [
//     { "phone": "+919876543210", "expiresIn": 285, "attempts": 0 }
//   ],
//   "totalActive": 1,
//   "rateLimitedPhones": []
// }

/**
 * Test AiSensy connectivity (from terminal)
 */
curl -X POST https://backend.aisensy.com/campaign/t1/api/v2 \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "your_key_here",
    "campaignName": "test",
    "destination": "+919876543210",
    "templateParams": ["123456"],
    "source": "test"
  }' -v

// ============================================================================
// 6. MONITORING IN PRODUCTION
// ============================================================================

/**
 * Key metrics to track:
 * 1. Successful OTP sends: log "success": true responses
 * 2. Failed sends: log AiSensy error responses
 * 3. Verification success rate: track ratio of verify success/attempts
 * 4. Rate limit hits: count 429 responses
 * 5. OTP expiry rate: monitor how many OTPs expire before verification
 * 
 * Consider integrating:
 * - Sentry (error tracking): capture AiSensy failures
 * - DataDog (metrics): track OTP success rate
 * - Pagerduty (alerts): page on-call for API failures
 * - Database logs: store OTP send/verify attempts for audit trail
 */

