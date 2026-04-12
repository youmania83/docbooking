/**
 * AiSensy WhatsApp OTP Module v2 - SETUP GUIDE
 * 
 * Complete guide to set up and configure the WhatsApp OTP system
 * for DocBooking.in using AiSensy Campaign API v2
 */

// ============================================================================
// SECTION 1: GET AISENSY CREDENTIALS
// ============================================================================

/**
 * Step 1: Create AiSensy Account
 * 
 * 1. Go to https://www.aisensy.com
 * 2. Click "Sign Up" or "Start Free Trial"
 * 3. Enter email, password, and create account
 * 4. Verify email
 * 5. Complete onboarding
 */

/**
 * Step 2: Get API Key
 * 
 * 1. Login to AiSensy dashboard
 * 2. Go to: Settings → Manage (left sidebar)
 * 3. Look for "API Key" section
 * 4. Click "Copy" or "Generate New Key"
 * 5. Copy the full JWT token (usually starts with "eyJ...")
 * 
 * Example API Key format:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDdjZTYxZTVjNjQ0MGUxOTViYTNhMSIsIm5hbWUiOiJkb2Nib29raW5nIn0.***REMOVED***
 * 
 * IMPORTANT: Keep this key safe! It grants access to send messages.
 */

/**
 * Step 3: Create WhatsApp Campaign
 * 
 * 1. In AiSensy dashboard, go to "Campaigns" (left sidebar)
 * 2. Click "Create Campaign" or "New Campaign"
 * 3. Choose "WhatsApp" as channel
 * 4. Give it a name: "docbooking_otp_basic"
 * 5. Select message type: "Text"
 * 6. Enter template content: "{{1}} is your verification code."
 * 
 * IMPORTANT NOTES:
 * - Campaign name must be EXACT match (case-sensitive) in env vars
 * - Template must match what you send in templateParams
 * - {{1}} will be replaced with the first element of templateParams (the OTP)
 * 
 * 7. Click "Create" to save
 * 8. Campaign status should be "Live" before API can send
 * 9. If status is "Draft" or "Inactive", activate it
 */

/**
 * Step 4: Connect WhatsApp Business Account (WABA)
 * 
 * This is required for AiSensy to actually send messages via WhatsApp
 * 
 * 1. If you have existing WABA:
 *    - Go to Settings → WABA Configuration
 *    - Click "Connect WABA"
 *    - Authenticate with Meta/Facebook
 *    - Select your verified WhatsApp Business Account
 *    - Authorize app to send messages
 * 
 * 2. If you don't have WABA:
 *    - Sign up for WhatsApp Business Account via Meta
 *    - Verify your phone number and business
 *    - Get WABA credentials
 *    - Then connect above
 * 
 * Verification status must be:
 * - ✅ "Verified" (green checkmark in AiSensy)
 * - ✅ "Active" (connected and able to send)
 * 
 * If "Not Connected" or "Inactive": messages won't send
 */

// ============================================================================
// SECTION 2: CONFIGURE ENVIRONMENT VARIABLES
// ============================================================================

/**
 * Step 1: Create or update .env.local
 * 
 * Location: /Users/yogeshkumarwadhwa/Documents/Docbooking/.env.local
 * 
 * Add these variables:
 */

AISENSY_API_KEY=your_api_key_from_dashboard_here
AISENSY_CAMPAIGN_NAME=docbooking_otp_basic
OTP_EXPIRY_SECONDS=300

/**
 * Step 2: Verify what each variable means
 * 
 * AISENSY_API_KEY
 * - Your API key from AiSensy Dashboard → Settings → Manage
 * - Format: JWT token (starts with "eyJ...")
 * - Used to authenticate all requests
 * - Keep SECRET - never commit to git
 * 
 * AISENSY_CAMPAIGN_NAME
 * - Name of the campaign you created in AiSensy
 * - Case-sensitive! Must match exactly
 * - Example: "docbooking_otp_basic" (not "Docbooking OTP" or similar)
 * - Used to identify which template and WABA to use
 * 
 * OTP_EXPIRY_SECONDS
 * - How long the OTP is valid (in seconds)
 * - Default: 300 (5 minutes)
 * - Recommended: 300-600 (5-10 minutes)
 * - Too short: users annoyed by frequent re-sends
 * - Too long: security risk
 * 
 * NODE_OPTIONS (optional, already in your .env.local)
 * - "--dns-result-order=ipv4first"
 * - Helps with DNS resolution for AiSensy API
 */

/**
 * Step 3: Complete .env.local example
 * 
 * These are the lines to add to your .env.local file:
 */

# --- START: Add these lines to .env.local ---

# AiSensy WhatsApp API Configuration (Campaign API v2)
# Get API key from: https://www.aisensy.com → Settings → Manage → API Key
AISENSY_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZDdjZTYxZTVjNjQ0MGUxOTViYTNhMSIsIm5hbWUiOiJkb2Nib29raW5nIn0.***REMOVED***

# Campaign name in AiSensy (must match exactly, case-sensitive)
# Go to: AiSensy Dashboard → Campaigns → Your Campaign Name
AISENSY_CAMPAIGN_NAME=docbooking_otp_basic

# OTP validity period in seconds (default: 300 = 5 minutes)
OTP_EXPIRY_SECONDS=300

# --- END: Add these lines ---

/**
 * Step 4: Do NOT commit secrets to Git
 * 
 * Your .env.local file contains API keys and should NEVER be in Git
 * 
 * Verify .gitignore includes:
 * .env.local
 * .env.*.local
 * 
 * In production (Vercel):
 * - Add variables to Vercel Dashboard → Settings → Environment Variables
 * - Don't put raw values in code
 */

// ============================================================================
// SECTION 3: VERIFY SETUP
// ============================================================================

/**
 * Step 1: Check environment variables are loaded
 * 
 * Copy-paste in terminal:
 */
cd /Users/yogeshkumarwadhwa/Documents/Docbooking
echo "AISENSY_API_KEY: $AISENSY_API_KEY"
echo "AISENSY_CAMPAIGN_NAME: $AISENSY_CAMPAIGN_NAME"

// If output is empty, .env.local is not loaded
// Solution: Check .env.local exists and has correct content

/**
 * Step 2: Test DNS connectivity (important!)
 * 
 * This was your issue - DNS resolution failing
 * Let's verify it works now:
 */
nslookup backend.aisensy.com

// Should show:
// Server:	8.8.8.8 (or similar)
// Name:	backend.aisensy.com
// Address: 34.x.x.x (some IP)

// If it says "Can't find backend.aisensy.com": your DNS is still broken
// Fix: System Settings → Network → DNS → Add 8.8.8.8

/**
 * Step 3: Start dev server
 */
npm run dev

/**
 * Step 4: Test the API
 * 
 * Open a new terminal and run:
 */
curl -X POST http://localhost:3000/api/send-otp-v2 \
  -H "Content-Type: application/json" \
  -d '{"phone":"9876543210","userName":"Test"}'

/**
 * Expected response if everything works:
 * 
 * {
 *   "success": true,
 *   "message": "OTP sent successfully to your WhatsApp",
 *   "expiresIn": 300,
 *   "data": { ... }
 * }
 * 
 * Check your phone for WhatsApp message with OTP!
 */

// ============================================================================
// SECTION 4: TROUBLESHOOTING
// ============================================================================

/**
 * Problem 1: "Cannot reach API server" or "DNS resolution failed"
 * 
 * Symptoms:
 * - curl: (6) Could not resolve host: backend.aisensy.com
 * - Error: ENOTFOUND backend.aisensy.com
 * 
 * Causes:
 * - Your DNS is misconfigured
 * - Using a broken DNS server
 * 
 * Fix:
 * 1. Open System Settings → Network
 * 2. Select your connection (Wi-Fi/Ethernet)
 * 3. Click "Details" → "DNS"
 * 4. Add DNS servers: 8.8.8.8 and 1.1.1.1
 * 5. Click OK
 * 6. Test: nslookup backend.aisensy.com
 * 
 * Verify: Should resolve successfully
 */

/**
 * Problem 2: "AISENSY_API_KEY environment variable not configured"
 * 
 * Symptoms:
 * - Error when sending OTP
 * 
 * Causes:
 * - .env.local not exists
 * - .env.local doesn't have AISENSY_API_KEY
 * - Server not restarted after adding to .env.local
 * 
 * Fix:
 * 1. Check .env.local exists: ls -la .env.local
 * 2. Check it has AISENSY_API_KEY: grep AISENSY_API_KEY .env.local
 * 3. Stop server (Ctrl+C)
 * 4. Start server again: npm run dev
 */

/**
 * Problem 3: "Campaign not live" or silent failure (200 but no message arrives)
 * 
 * Symptoms:
 * - API returns success but WhatsApp message never arrives
 * - Or campaign status error in response
 * 
 * Causes:
 * - Campaign status not "Live" in AiSensy
 * - Campaign name mismatch (typo or different case)
 * - WABA not connected or not verified
 * 
 * Fix:
 * 1. Check campaign status:
 *    Go to AiSensy Dashboard → Campaigns → Your Campaign
 *    Verify status shows "Live" (green)
 * 
 * 2. Check campaign name matches:
 *    Compare AISENSY_CAMPAIGN_NAME in .env.local
 *    With campaign name in AiSensy dashboard
 *    Must be EXACT (case, spaces, special chars)
 * 
 * 3. Check WABA connection:
 *    Go to AiSensy Settings → WABA Configuration
 *    Look for "Status: Active/Verified"
 *    If not: connect your WhatsApp Business Account
 */

/**
 * Problem 4: "Invalid phone number format"
 * 
 * Symptoms:
 * - Error: Invalid phone format from API
 * 
 * Causes:
 * - Phone number not exactly 10 digits
 * - First digit not 6-9
 * - Wrong format (non-numeric characters)
 * 
 * Fix:
 * - Use formats: "9876543210" or "+919876543210" or "98765-43210"
 * - Not: "1234567890" (less than 10)
 * - Not: "+1 987 654 3210" (wrong country)
 * - Not: "5876543210" (first digit is 5, not 6-9)
 */

/**
 * Problem 5: "In-memory OTP storage lost after restart"
 * 
 * Symptoms:
 * - OTPs verified one moment, then "No OTP found" after server restart
 * 
 * This is expected! The module uses in-memory storage.
 * 
 * Solution for production:
 * - Replace in-memory Map with Redis
 * - See TODO comment in /lib/aisensyOTPv2.js
 * - Redis keeps OTP data persistent across restarts
 */

/**
 * Problem 6: Rate limit errors on testing
 * 
 * Symptoms:
 * - "Too many OTP requests from this phone. Please try again in 10 minutes."
 * 
 * Causes:
 * - You've sent 3+ OTP requests for same phone
 * - Rate limit window (defaults to 10 minutes) hasn't passed
 * 
 * For testing:
 * - Use different phone numbers each test
 * - Or modify rate limit in .env.local (add these):
 */
RATE_LIMIT_WINDOW_MINUTES=1
MAX_REQUESTS_PER_WINDOW=10

// Then restart. Note: Remember to remove for production!

// ============================================================================
// SECTION 5: QUICK START CHECKLIST
// ============================================================================

/**
 * ✅ Pre-Setup Checklist
 * 
 * [ ] DNS is working (nslookup google.com returns IP)
 * [ ] DNS can resolve AiSensy (nslookup backend.aisensy.com returns IP)
 * [ ] You have AiSensy account credentials
 * [ ] You have WhatsApp Business Account
 * [ ] Your phone number is registered for WhatsApp
 */

/**
 * ✅ Setup Checklist
 * 
 * [ ] Created AiSensy account
 * [ ] Generated API key (Settings → Manage)
 * [ ] Created campaign named "docbooking_otp_basic"
 * [ ] Campaign status is "Live"
 * [ ] Campaign template: "{{1}} is your verification code."
 * [ ] Connected WABA to AiSensy
 * [ ] WABA status shows "Active/Verified"
 * [ ] Added .env.local with 3 variables
 * [ ] Started server: npm run dev
 */

/**
 * ✅ Testing Checklist
 * 
 * [ ] curl request to /api/send-otp-v2 succeeds (HTTP 200)
 * [ ] Server logs show [AiSensy Success]
 * [ ] WhatsApp message arrives on phone
 * [ ] curl request to /api/verify-otp-v2 with correct OTP succeeds
 * [ ] Wrong OTP returns error with attempts remaining
 * [ ] Third wrong OTP locks out user
 * [ ] Sending 4 OTPs rapidly hits rate limit
 * [ ] Different phone numbers bypass rate limit
 */

/**
 * ✅ Production Checklist
 * 
 * [ ] Added env variables to Vercel dashboard
 * [ ] Disabled debug logging before deployment
 * [ ] Set up Redis for OTP persistence
 * [ ] Set up Sentry error tracking
 * [ ] Tested full flow on production URL
 * [ ] Monitor error rate first 24 hours
 */

// ============================================================================
// SECTION 6: API SPECIFICATIONS
// ============================================================================

/**
 * POST /api/send-otp-v2
 * 
 * Send OTP to a phone number via WhatsApp
 * 
 * Request:
 * {
 *   "phone": "9876543210" or "+919876543210",
 *   "userName": "John Doe" (optional)
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "OTP sent successfully to your WhatsApp",
 *   "expiresIn": 300,
 *   "data": { AiSensy response }
 * }
 * 
 * Response (429 - Rate Limited):
 * {
 *   "success": false,
 *   "message": "Too many OTP requests from this phone. Please try again in 10 minutes."
 * }
 * 
 * Response (400 - Bad Input):
 * {
 *   "success": false,
 *   "message": "Invalid phone number format"
 * }
 * 
 * Response (500 - Server Error):
 * {
 *   "success": false,
 *   "message": "Failed to send OTP. Please try again later."
 * }
 */

/**
 * POST /api/verify-otp-v2
 * 
 * Verify OTP submitted by user
 * 
 * Request:
 * {
 *   "phone": "9876543210" or "+919876543210",
 *   "otp": "123456"
 * }
 * 
 * Response (200):
 * {
 *   "success": true,
 *   "message": "OTP verified successfully"
 * }
 * 
 * Response (401 - Wrong OTP):
 * {
 *   "success": false,
 *   "message": "Incorrect OTP. 2 attempts remaining."
 * }
 * 
 * Response (401 - Max Attempts):
 * {
 *   "success": false,
 *   "message": "Maximum verification attempts exceeded. Please request a new OTP."
 * }
 * 
 * Response (400 - Expired):
 * {
 *   "success": false,
 *   "message": "OTP expired. Please request a new OTP."
 * }
 * 
 * Response (400 - No OTP):
 * {
 *   "success": false,
 *   "message": "No OTP found. Please request a new OTP."
 * }
 */

// ============================================================================
// SECTION 7: SUPPORT & RESOURCES
// ============================================================================

/**
 * Documentation:
 * - AiSensy Docs: https://help.aisensy.com/
 * - AiSensy API: https://www.aisensy.com/api
 * - Meta WhatsApp API: https://developers.facebook.com/docs/whatsapp
 * 
 * Contact AiSensy Support:
 * - Email: support@aisensy.com
 * - Chat: Available in dashboard
 * - WhatsApp: +1 (based on account)
 * 
 * Common Issues Knowledge Base:
 * - Check AiSensy dashboard help section
 * - Search error message in their docs
 * - Check WABA connection status
 */

