/**
 * Security & Fraud Detection Module
 * IP-based tracking, abuse patterns, rate limiting
 */

interface FraudAlert {
  timestamp: string;
  type:
    | "rapid_requests"
    | "high_failure_rate"
    | "multiple_ips"
    | "suspicious_pattern";
  phone: string;
  ip?: string;
  details?: Record<string, any>;
}

interface SecurityRecord {
  phone: string;
  ips: Set<string>;
  requestCount: number;
  failureCount: number;
  lastRequestTime: number;
  alerts: FraudAlert[];
  blocked: boolean;
  blockedUntil?: number;
}

// In-memory security store
const securityStore = new Map<string, SecurityRecord>();
const fraudAlerts: FraudAlert[] = [];
const MAX_FRAUD_LOG_SIZE = 1000;

// Security thresholds
const SECURITY_THRESHOLDS = {
  REQUESTS_PER_MINUTE: 5, // Max 5 requests per minute
  FAILURE_RATE_THRESHOLD: 0.8, // 80% failure rate = suspicious
  UNIQUE_IPS_THRESHOLD: 3, // More than 3 IPs in 1 hour = suspicious
  BLOCK_DURATION_MS: 15 * 60 * 1000, // Block for 15 minutes
};

/**
 * Extract client IP from request headers
 */
export function getClientIP(
  headers: Record<string, string | string[] | undefined>
): string {
  // Try common headers in order of preference
  const xForwardedFor = headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string") {
    return xForwardedFor.split(",")[0].trim();
  }

  const xRealIP = headers["x-real-ip"];
  if (typeof xRealIP === "string") {
    return xRealIP;
  }

  return "unknown";
}

/**
 * Get or create security record for phone
 */
function getSecurityRecord(phone: string): SecurityRecord {
  if (!securityStore.has(phone)) {
    securityStore.set(phone, {
      phone,
      ips: new Set(),
      requestCount: 0,
      failureCount: 0,
      lastRequestTime: Date.now(),
      alerts: [],
      blocked: false,
    });
  }
  return securityStore.get(phone)!;
}

/**
 * Log fraud alert
 */
function logFraudAlert(alert: FraudAlert): void {
  const record = getSecurityRecord(alert.phone);
  record.alerts.push(alert);

  fraudAlerts.push(alert);
  if (fraudAlerts.length > MAX_FRAUD_LOG_SIZE) {
    fraudAlerts.shift();
  }

  console.warn(`[Security] 🚨 Fraud Alert: ${alert.type}`, {
    phone: alert.phone,
    ip: alert.ip,
    details: alert.details,
  });
}

/**
 * Track OTP request for security analysis
 */
export function trackOTPRequest(
  phone: string,
  ip: string,
  success: boolean
): { allowed: boolean; reason?: string } {
  const record = getSecurityRecord(phone);
  const now = Date.now();

  // Check if currently blocked
  if (record.blocked && record.blockedUntil) {
    if (now < record.blockedUntil) {
      const remainingMs = record.blockedUntil - now;
      return {
        allowed: false,
        reason: `Account temporarily blocked for ${Math.ceil(remainingMs / 1000)}s due to suspicious activity`,
      };
    } else {
      // Unblock
      record.blocked = false;
      record.blockedUntil = undefined;
    }
  }

  // Track request
  record.ips.add(ip);
  record.requestCount++;
  record.lastRequestTime = now;

  if (!success) {
    record.failureCount++;
  }

  // Analysis: Check for rapid requests (more than 5 per minute)
  if (record.requestCount > SECURITY_THRESHOLDS.REQUESTS_PER_MINUTE) {
    logFraudAlert({
      timestamp: new Date().toISOString(),
      type: "rapid_requests",
      phone,
      ip,
      details: {
        requestCount: record.requestCount,
        timeWindowMs: 60000,
      },
    });
  }

  // Analysis: Check for high failure rate
  if (
    record.requestCount >= 3 &&
    record.failureCount / record.requestCount >
      SECURITY_THRESHOLDS.FAILURE_RATE_THRESHOLD
  ) {
    logFraudAlert({
      timestamp: new Date().toISOString(),
      type: "high_failure_rate",
      phone,
      ip,
      details: {
        failureRate: (record.failureCount / record.requestCount).toFixed(2),
        failures: record.failureCount,
        total: record.requestCount,
      },
    });

    // Block this phone after too many failures
    record.blocked = true;
    record.blockedUntil = now + SECURITY_THRESHOLDS.BLOCK_DURATION_MS;

    return {
      allowed: false,
      reason: "Too many failed verification attempts. Please try again later.",
    };
  }

  // Analysis: Check for multiple IPs
  if (record.ips.size > SECURITY_THRESHOLDS.UNIQUE_IPS_THRESHOLD) {
    logFraudAlert({
      timestamp: new Date().toISOString(),
      type: "multiple_ips",
      phone,
      ip,
      details: {
        ipsCount: record.ips.size,
        ips: Array.from(record.ips),
      },
    });
  }

  return { allowed: true };
}

/**
 * Get security alerts for a phone number
 */
export function getSecurityAlerts(phone: string): FraudAlert[] {
  const record = securityStore.get(phone);
  return record ? record.alerts : [];
}

/**
 * Get all fraud alerts (admin use)
 */
export function getFraudAlerts(limit: number = 100): FraudAlert[] {
  return fraudAlerts.slice(-limit);
}

/**
 * Check if phone is flagged for suspicious activity
 */
export function isSuspicious(phone: string): boolean {
  const record = securityStore.get(phone);
  if (!record) return false;

  return record.blocked || record.alerts.length > 0;
}

/**
 * Get comprehensive security report for a phone
 */
export function getSecurityReport(phone: string): {
  phone: string;
  isSuspicious: boolean;
  requestCount: number;
  failureCount: number;
  failureRate: number;
  uniqueIPs: number;
  blocked: boolean;
  alerts: FraudAlert[];
  lastRequest: string;
} {
  const record = securityStore.get(phone);

  if (!record) {
    return {
      phone,
      isSuspicious: false,
      requestCount: 0,
      failureCount: 0,
      failureRate: 0,
      uniqueIPs: 0,
      blocked: false,
      alerts: [],
      lastRequest: "never",
    };
  }

  const failureRate =
    record.requestCount > 0 ? record.failureCount / record.requestCount : 0;

  return {
    phone,
    isSuspicious: isSuspicious(phone),
    requestCount: record.requestCount,
    failureCount: record.failureCount,
    failureRate: parseFloat(failureRate.toFixed(2)),
    uniqueIPs: record.ips.size,
    blocked: record.blocked,
    alerts: record.alerts,
    lastRequest: new Date(record.lastRequestTime).toISOString(),
  };
}

/**
 * Clear security data for a phone (admin action)
 */
export function clearSecurityRecord(phone: string): void {
  securityStore.delete(phone);
  console.log(`[Security] Cleared security record for ${phone}`);
}

/**
 * Export all security data (for monitoring/analytics)
 */
export function getAllSecurityData(): {
  totalPhones: number;
  blockedPhones: number;
  suspiciousPhones: number;
  totalAlerts: number;
  records: Record<string, any>;
} {
  const records: Record<string, any> = {};
  let blockedCount = 0;
  let suspiciousCount = 0;

  for (const [phone, record] of securityStore.entries()) {
    if (record.blocked) blockedCount++;
    if (isSuspicious(phone)) suspiciousCount++;

    records[phone] = {
      requestCount: record.requestCount,
      failureCount: record.failureCount,
      ips: Array.from(record.ips),
      blocked: record.blocked,
      alerts: record.alerts.length,
    };
  }

  return {
    totalPhones: securityStore.size,
    blockedPhones: blockedCount,
    suspiciousPhones: suspiciousCount,
    totalAlerts: fraudAlerts.length,
    records,
  };
}

export default {
  getClientIP,
  trackOTPRequest,
  getSecurityAlerts,
  getFraudAlerts,
  isSuspicious,
  getSecurityReport,
  clearSecurityRecord,
  getAllSecurityData,
};
