/**
 * Session Token Management
 * Generate and validate session tokens after OTP verification
 */

interface SessionPayload {
  phone: string;
  verified: boolean;
  timestamp: number;
  expiresAt?: number;
}

/**
 * Generate session token after OTP verification
 * Token is valid for 24 hours
 */
export function generateSessionToken(phone: string): string {
  const payload: SessionPayload = {
    phone,
    verified: true,
    timestamp: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  // Encode as base64 (simple approach for development)
  // For production, use JWT (jsonwebtoken package)
  return btoa(JSON.stringify(payload));
}

/**
 * Decode and validate session token
 */
export function validateSessionToken(token: string): SessionPayload | null {
  try {
    const payload: SessionPayload = JSON.parse(atob(token));

    // Check expiry
    if (payload.expiresAt && payload.expiresAt < Date.now()) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Invalid session token:", error);
    return null;
  }
}

/**
 * Get phone from session token
 */
export function getPhoneFromToken(token: string): string | null {
  const payload = validateSessionToken(token);
  return payload?.phone || null;
}

/**
 * Check if phone is verified from session token
 */
export function isPhoneVerified(token: string): boolean {
  const payload = validateSessionToken(token);
  return payload?.verified || false;
}

export default {
  generateSessionToken,
  validateSessionToken,
  getPhoneFromToken,
  isPhoneVerified,
};
