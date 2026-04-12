/**
 * AiSensy WhatsApp OTP Module
 * Uses AiSensy Campaign API v2 for WhatsApp OTP delivery
 * 
 * API Endpoint: POST https://backend.aisensy.com/campaign/t1/api/v2
 * Authentication: API key in request body (not Authorization header)
 * 
 * @module lib/aisensyOTPv2
 */

const crypto = require('crypto');

// ============================================================================
// CONFIGURATION
// ============================================================================

const AISENSY_ENDPOINT = 'https://backend.aisensy.com/campaign/t1/api/v2';
const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = parseInt(process.env.OTP_EXPIRY_SECONDS || '300'); // 5 minutes default
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW = 10 * 60 * 1000; // 10 minutes in milliseconds
const MAX_REQUESTS_PER_WINDOW = 3;

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

// TODO: Replace with Redis in production for scalability
// Current: Map storage (single server only, in-memory, lost on restart)
// Production: Use Redis with TTL for distributed systems

const otpStore = new Map(); // key: phone, value: { otp, expiresAt, attempts }
const rateLimitStore = new Map(); // key: phone, value: [timestamp1, timestamp2, timestamp3...]
const cleanupInterval = setInterval(() => {
  const now = Date.now();
  
  // Clean expired OTPs
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
      console.log(`[OTP Cleanup] Expired OTP removed for ${phone}`);
    }
  }
  
  // Clean rate limit records older than window
  for (const [phone, timestamps] of rateLimitStore.entries()) {
    const validTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
    if (validTimestamps.length === 0) {
      rateLimitStore.delete(phone);
    } else if (validTimestamps.length < timestamps.length) {
      rateLimitStore.set(phone, validTimestamps);
    }
  }
}, 60 * 1000); // Run cleanup every minute

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a random 6-digit OTP
 * Uses cryptographically secure random bytes
 * 
 * @returns {string} 6-digit OTP string (e.g., "123456")
 */
function generateOTP() {
  // Use crypto for secure random number generation
  const randomNum = Math.floor(crypto.randomInt(1000000) % 1000000);
  const otp = String(randomNum).padStart(OTP_LENGTH, '0');
  console.log(`[OTP Generate] Generated OTP: ${otp}`);
  return otp;
}

/**
 * Formats phone number to AiSensy format with +91 prefix
 * Expects Indian phone numbers (10 digits or already formatted)
 * 
 * @param {string} rawPhone - Raw phone input (e.g., "9876543210", "98765-43210", "+919876543210")
 * @returns {string} Formatted phone with +91 prefix (e.g., "+919876543210")
 * @throws {Error} If phone number is invalid
 */
function formatPhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    throw new Error('Phone number must be a non-empty string');
  }

  // Remove all spaces, dashes, parentheses, and other formatting
  let cleaned = rawPhone.trim().replace(/[\s\-()\.]/g, '');

  // If already has +91, remove it for normalization
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.substring(3);
  }

  // Check if it's a valid 10-digit Indian number (starts with 6-9)
  if (!/^\d{10}$/.test(cleaned)) {
    throw new Error(`Invalid phone format: ${rawPhone}. Expected 10-digit Indian number.`);
  }

  // First digit must be 6-9 for Indian mobile numbers
  if (!['6', '7', '8', '9'].includes(cleaned[0])) {
    throw new Error(`Invalid Indian phone number: first digit must be 6-9`);
  }

  // Return with +91 prefix (REQUIRED by AiSensy)
  const formatted = `+91${cleaned}`;
  console.log(`[Format Phone] ${rawPhone} → ${formatted}`);
  return formatted;
}

/**
 * Checks if phone has exceeded rate limit
 * Rate limit: 3 OTP requests per 10 minutes per phone
 * 
 * @param {string} phone - Formatted phone number
 * @returns {boolean} true if rate limited, false if OK to send
 */
function isRateLimited(phone) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(phone) || [];

  // Remove timestamps older than the window
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);

  // Check if we've exceeded the limit
  const isLimited = recentTimestamps.length >= MAX_REQUESTS_PER_WINDOW;

  if (isLimited) {
    console.log(`[Rate Limit] ${phone} has ${recentTimestamps.length} requests in last ${RATE_LIMIT_WINDOW / 1000}s`);
  }

  return isLimited;
}

/**
 * Records an OTP request for rate limiting tracking
 * 
 * @param {string} phone - Formatted phone number
 */
function recordRequest(phone) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(phone) || [];

  // Add current timestamp
  timestamps.push(now);

  // Keep only requests within the window
  const recentTimestamps = timestamps.filter(ts => now - ts < RATE_LIMIT_WINDOW);
  rateLimitStore.set(phone, recentTimestamps);

  console.log(`[Rate Limit] Recorded request for ${phone} (${recentTimestamps.length} in window)`);
}

// ============================================================================
// OTP OPERATIONS
// ============================================================================

/**
 * Sends OTP via WhatsApp using AiSensy Campaign API v2
 * 
 * Request payload structure:
 * {
 *   "apiKey": "...",
 *   "campaignName": "...",
 *   "destination": "+91XXXXXXXXXX",
 *   "userName": "...",
 *   "source": "DocBooking Website",
 *   "templateParams": ["123456"],
 *   "tags": ["otp-verification"],
 *   "attributes": {}
 * }
 * 
 * @param {string} phone - Formatted phone number (+91XXXXXXXXXX)
 * @param {string} otp - 6-digit OTP to send
 * @param {string} userName - Contact name (optional, defaults to "DocBooking User")
 * @returns {Promise<{success: boolean, data?: object, error?: string}>}
 */
async function sendWhatsAppOTP(phone, otp, userName = 'DocBooking User') {
  try {
    // Validate inputs
    if (!phone || !otp) {
      throw new Error('Phone and OTP are required');
    }

    // Ensure API key is configured
    const apiKey = process.env.AISENSY_API_KEY;
    if (!apiKey) {
      throw new Error('AISENSY_API_KEY environment variable not configured');
    }

    const campaignName = process.env.AISENSY_CAMPAIGN_NAME;
    if (!campaignName) {
      throw new Error('AISENSY_CAMPAIGN_NAME environment variable not configured');
    }

    // Build request payload
    // IMPORTANT: API key goes IN the body, not in Authorization header
    const payload = {
      apiKey: apiKey,
      campaignName: campaignName, // Must match LIVE campaign name in AiSensy dashboard (case-sensitive)
      destination: phone, // Must include country code (e.g., +919876543210)
      userName: userName, // Will be created/updated as contact in AiSensy
      source: 'DocBooking Website',
      templateParams: [otp], // Array of strings, one per {{variable}} in template
      tags: ['otp-verification'],
      attributes: {}
    };

    // Log the full request payload (for debugging)
    console.log('[AiSensy Request] Sending OTP via WhatsApp');
    console.log('[AiSensy Request] Endpoint:', AISENSY_ENDPOINT);
    console.log('[AiSensy Request] Payload:');
    console.log(JSON.stringify(payload, null, 2));

    // Make HTTP POST request to AiSensy using fetch
    const response = await fetch(AISENSY_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      timeout: 10000 // 10 second timeout
    });

    // Parse response body
    const data = await response.json();

    // Log the full response
    console.log('[AiSensy Response] HTTP Status:', response.status);
    console.log('[AiSensy Response] Data:');
    console.log(JSON.stringify(data, null, 2));

    // Check response status - AiSensy returns 200 on success
    if (response.ok) {
      console.log(`[AiSensy Success] OTP sent to ${phone}`);
      return {
        success: true,
        data: data
      };
    } else {
      console.log(`[AiSensy Error] Unexpected status: ${response.status}`);
      return {
        success: false,
        error: `Unexpected response status: ${response.status}`
      };
    }

  } catch (error) {
    // Log the full error details for debugging
    console.error('[AiSensy Error] Failed to send OTP');
    console.error('[AiSensy Error] Message:', error.message);
    console.error('[AiSensy Error] Code:', error.code);

    return {
      success: false,
      error: error.message || 'Failed to send OTP'
    };
  }
}

/**
 * Stores OTP in memory with expiry time
 * Each phone can have only one active OTP
 * 
 * @param {string} phone - Formatted phone number
 * @param {string} otp - Generated OTP
 */
function storeOTP(phone, otp) {
  const expiresAt = Date.now() + (OTP_EXPIRY_SECONDS * 1000);
  
  otpStore.set(phone, {
    otp: otp,
    expiresAt: expiresAt,
    attempts: 0 // Track incorrect attempts
  });

  console.log(`[OTP Store] Stored OTP for ${phone}, expires in ${OTP_EXPIRY_SECONDS}s`);
}

/**
 * Verifies OTP submitted by user
 * Checks: expiry, attempt count, correct OTP
 * Deletes OTP after successful verification
 * 
 * @param {string} phone - Formatted phone number
 * @param {string} inputOTP - OTP entered by user
 * @returns {{success: boolean, message: string}}
 */
function verifyOTP(phone, inputOTP) {
  const now = Date.now();
  const otpData = otpStore.get(phone);

  // Check if OTP exists
  if (!otpData) {
    console.log(`[OTP Verify] No OTP found for ${phone}`);
    return {
      success: false,
      message: 'No OTP found. Please request a new OTP.'
    };
  }

  // Check if OTP expired
  if (now > otpData.expiresAt) {
    otpStore.delete(phone);
    console.log(`[OTP Verify] OTP expired for ${phone}`);
    return {
      success: false,
      message: 'OTP expired. Please request a new OTP.'
    };
  }

  // Check if max attempts exceeded
  if (otpData.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    console.log(`[OTP Verify] Max attempts (${MAX_ATTEMPTS}) exceeded for ${phone}`);
    return {
      success: false,
      message: `Maximum verification attempts exceeded. Please request a new OTP.`
    };
  }

  // Verify OTP
  if (inputOTP === otpData.otp) {
    // Success - delete OTP
    otpStore.delete(phone);
    console.log(`[OTP Verify] Success for ${phone}`);
    return {
      success: true,
      message: 'OTP verified successfully'
    };
  } else {
    // Incorrect - increment attempts
    otpData.attempts += 1;
    console.log(`[OTP Verify] Incorrect OTP for ${phone} (attempt ${otpData.attempts}/${MAX_ATTEMPTS})`);
    
    if (otpData.attempts >= MAX_ATTEMPTS) {
      otpStore.delete(phone);
      return {
        success: false,
        message: `Incorrect OTP. Maximum attempts exceeded. Please request a new OTP.`
      };
    }
    
    return {
      success: false,
      message: `Incorrect OTP. ${MAX_ATTEMPTS - otpData.attempts} attempts remaining.`
    };
  }
}

/**
 * Deletes OTP for a phone (manual cleanup)
 * Useful when user cancels verification flow
 * 
 * @param {string} phone - Formatted phone number
 */
function clearOTP(phone) {
  otpStore.delete(phone);
  console.log(`[OTP Clear] Cleared OTP for ${phone}`);
}

/**
 * Gets debug info about OTP store status
 * For development/monitoring only
 * 
 * @returns {object} Debug info
 */
function getStoreDebugInfo() {
  const now = Date.now();
  const activeOTPs = [];

  for (const [phone, data] of otpStore.entries()) {
    const secondsUntilExpiry = Math.max(0, Math.ceil((data.expiresAt - now) / 1000));
    activeOTPs.push({
      phone,
      expiresIn: secondsUntilExpiry,
      attempts: data.attempts
    });
  }

  return {
    activeOTPs,
    totalActive: otpStore.size,
    rateLimitedPhones: Array.from(rateLimitStore.keys())
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  generateOTP,
  formatPhone,
  isRateLimited,
  recordRequest,
  sendWhatsAppOTP,
  storeOTP,
  verifyOTP,
  clearOTP,
  getStoreDebugInfo,
  // Export constants for reference
  OTP_EXPIRY_SECONDS,
  MAX_ATTEMPTS,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS_PER_WINDOW
};
