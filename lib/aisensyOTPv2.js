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
const SEND_LOCK_WINDOW_MS = 15 * 1000;

// ============================================================================
// IN-MEMORY STORAGE
// ============================================================================

// TODO: Replace with Redis in production for scalability
// Current: Map storage (single server only, in-memory, lost on restart)
// Production: Use Redis with TTL for distributed systems

const globalState = globalThis.__docbookingOtpV2State || {
  instanceId: `${process.pid || 'pid'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
  bootedAt: new Date().toISOString(),
  otpStore: new Map(),
  rateLimitStore: new Map(),
  sendLockStore: new Map()
};

globalThis.__docbookingOtpV2State = globalState;

const otpStore = globalState.otpStore; // key: phone, value: { otp, expiresAt, attempts, status }
const rateLimitStore = globalState.rateLimitStore; // key: phone, value: [timestamp1, timestamp2, timestamp3...]
const sendLockStore = globalState.sendLockStore; // key: phone, value: { requestId, startedAt }

console.log(
  `[OTP Module] Loaded instance=${globalState.instanceId} bootedAt=${globalState.bootedAt} activeOtps=${otpStore.size} rateLimited=${rateLimitStore.size}`
);

const cleanupInterval = setInterval(() => {
  const now = Date.now();
  
  // Clean expired OTPs
  for (const [phone, data] of otpStore.entries()) {
    if (data.expiresAt < now) {
      otpStore.delete(phone);
      console.log(`[OTP Cleanup] Expired OTP removed for ${phone} on instance ${globalState.instanceId}`);
    }
  }

  for (const [phone, lock] of sendLockStore.entries()) {
    if (now - lock.startedAt > SEND_LOCK_WINDOW_MS) {
      sendLockStore.delete(phone);
      console.log(`[OTP Cleanup] Cleared stale send lock for ${phone}`);
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

function createRequestId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Formats phone number to canonical storage format: 91XXXXXXXXXX
 * Expects Indian phone numbers (10 digits or already formatted)
 * 
 * @param {string} rawPhone - Raw phone input (e.g., "9876543210", "98765-43210", "+919876543210")
 * @returns {string} Canonical phone with 91 prefix (e.g., "919876543210")
 * @throws {Error} If phone number is invalid
 */
function formatPhone(rawPhone) {
  if (!rawPhone || typeof rawPhone !== 'string') {
    throw new Error('Phone number must be a non-empty string');
  }

  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }

  cleaned = cleaned.replace(/^0+/, '');

  if (cleaned.startsWith('91') && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  }

  // Check if it's a valid 10-digit Indian number (starts with 6-9)
  if (!/^\d{10}$/.test(cleaned)) {
    throw new Error(`Invalid phone format: ${rawPhone}. Expected 10-digit Indian number.`);
  }

  // First digit must be 6-9 for Indian mobile numbers
  if (!['6', '7', '8', '9'].includes(cleaned[0])) {
    throw new Error(`Invalid Indian phone number: first digit must be 6-9`);
  }

  const formatted = `91${cleaned}`;
  console.log(`[Format Phone] ${rawPhone} → ${formatted}`);
  return formatted;
}

function beginSendAttempt(phone) {
  const existingLock = sendLockStore.get(phone);
  const now = Date.now();

  if (existingLock && now - existingLock.startedAt < SEND_LOCK_WINDOW_MS) {
    console.log(`[OTP Send Lock] Active send already in progress for ${phone}`, existingLock);
    return {
      allowed: false,
      requestId: existingLock.requestId,
      retryAfterMs: SEND_LOCK_WINDOW_MS - (now - existingLock.startedAt)
    };
  }

  const requestId = createRequestId();
  sendLockStore.set(phone, {
    requestId,
    startedAt: now
  });

  console.log(`[OTP Send Lock] Acquired lock for ${phone} requestId=${requestId}`);

  return {
    allowed: true,
    requestId,
    retryAfterMs: 0
  };
}

function endSendAttempt(phone, requestId) {
  const existingLock = sendLockStore.get(phone);

  if (!existingLock) {
    return;
  }

  if (!requestId || existingLock.requestId === requestId) {
    sendLockStore.delete(phone);
    console.log(`[OTP Send Lock] Released lock for ${phone} requestId=${existingLock.requestId}`);
  }
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

    // Build request payload
    // IMPORTANT: API key goes IN the body, not in Authorization header
    // Fix destination: remove +, extract 10 digits, add 91 prefix
    const cleanDest = phone.replace(/\D/g, '');
    const destination = cleanDest.startsWith('91') ? cleanDest : `91${cleanDest}`;
    
    const payload = {
      apiKey: apiKey.trim(), // Remove whitespace/newlines
      campaignName: "Docbooking", // Hardcoded, exact case
      destination: destination, // Format: 91XXXXXXXXXX (no +)
      userName: userName, // Will be created/updated as contact in AiSensy
      source: 'DocBooking Website',
      templateParams: [otp], // Body param only; AiSensy handles copy_code button internally
      buttons: [
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            {
              type: "text",
              text: otp
            }
          ]
        }
      ],
      tags: ['otp-verification'],
      attributes: {}
    };

    // Log request (redact API key)
    console.log('[AiSensy Request] Sending OTP via WhatsApp');
    console.log('[AiSensy Request] Endpoint:', AISENSY_ENDPOINT);
    console.log('[AiSensy Request] destination:', destination, 'campaign:', payload.campaignName);

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
function storeOTP(phone, otp, options = {}) {
  const expiresAt = Date.now() + (OTP_EXPIRY_SECONDS * 1000);
  const existingOtp = otpStore.get(phone);
  
  otpStore.set(phone, {
    otp: otp,
    expiresAt: expiresAt,
    attempts: 0,
    createdAt: Date.now(),
    status: options.status || 'active',
    requestId: options.requestId || null
  });

  console.log(
    `[OTP Store] ${existingOtp ? 'Overwrote' : 'Stored'} OTP for ${phone}, expiresAt=${new Date(expiresAt).toISOString()}, status=${options.status || 'active'}, requestId=${options.requestId || 'n/a'}, activeOtps=${otpStore.size}`
  );
}

function markOTPDelivered(phone, requestId) {
  const otpData = otpStore.get(phone);

  if (!otpData) {
    console.log(`[OTP Store] Cannot mark delivered, OTP missing for ${phone}`);
    return false;
  }

  if (requestId && otpData.requestId && otpData.requestId !== requestId) {
    console.log(`[OTP Store] Skipping delivery mark for stale request ${requestId} on ${phone}`);
    return false;
  }

  otpData.status = 'active';
  otpData.deliveredAt = Date.now();
  console.log(`[OTP Store] Marked OTP active for ${phone} requestId=${otpData.requestId || 'n/a'}`);
  return true;
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

  console.log(
    `[OTP Fetch] phone=${phone} found=${!!otpData} instance=${globalState.instanceId} activeOtps=${otpStore.size} sendLocks=${sendLockStore.size}`
  );

  // Check if OTP exists
  if (!otpData) {
    console.log(`[OTP Verify] No OTP found for ${phone}. Possible expiry or server reset.`);
    return {
      success: false,
      reason: 'OTP_EXPIRED_OR_SERVER_RESET',
      message: 'OTP expired or server reset. Please request a new OTP.'
    };
  }

  if (otpData.status === 'pending_delivery') {
    console.log(`[OTP Verify] OTP still pending delivery for ${phone}`);
    return {
      success: false,
      reason: 'OTP_NOT_READY',
      message: 'OTP is still being sent. Please wait a moment and retry.'
    };
  }

  // Check if OTP expired
  if (now > otpData.expiresAt) {
    otpStore.delete(phone);
    console.log(`[OTP Verify] OTP expired for ${phone}`);
    return {
      success: false,
      reason: 'OTP_EXPIRED',
      message: 'OTP expired. Please request a new OTP.'
    };
  }

  // Check if max attempts exceeded
  if (otpData.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(phone);
    console.log(`[OTP Verify] Max attempts (${MAX_ATTEMPTS}) exceeded for ${phone}`);
    return {
      success: false,
      reason: 'MAX_ATTEMPTS_EXCEEDED',
      message: `Maximum verification attempts exceeded. Please request a new OTP.`
    };
  }

  // Verify OTP
  console.log(`[OTP Verify] Comparing OTP for ${phone}, attempts=${otpData.attempts}, expiresAt=${new Date(otpData.expiresAt).toISOString()}`);
  if (inputOTP === otpData.otp) {
    // Success - delete OTP
    otpStore.delete(phone);
    console.log(`[OTP Verify] Success for ${phone}`);
    return {
      success: true,
      reason: 'OTP_VERIFIED',
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
        reason: 'MAX_ATTEMPTS_EXCEEDED',
        message: `Incorrect OTP. Maximum attempts exceeded. Please request a new OTP.`
      };
    }
    
    return {
      success: false,
      reason: 'INVALID_OTP',
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
  const existed = otpStore.delete(phone);
  console.log(`[OTP Clear] Cleared OTP for ${phone}, existed=${existed}`);
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
    instanceId: globalState.instanceId,
    bootedAt: globalState.bootedAt,
    activeOTPs,
    totalActive: otpStore.size,
    rateLimitedPhones: Array.from(rateLimitStore.keys()),
    sendInProgress: Array.from(sendLockStore.entries()).map(([phone, lock]) => ({
      phone,
      requestId: lock.requestId,
      ageMs: Date.now() - lock.startedAt
    }))
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
  beginSendAttempt,
  endSendAttempt,
  storeOTP,
  markOTPDelivered,
  verifyOTP,
  clearOTP,
  getStoreDebugInfo,
  // Export constants for reference
  OTP_EXPIRY_SECONDS,
  MAX_ATTEMPTS,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS_PER_WINDOW
};
