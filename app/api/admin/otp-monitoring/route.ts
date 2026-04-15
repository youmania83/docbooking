/**
 * GET /api/admin/otp-monitoring
 * Admin dashboard API for OTP system monitoring
 * Provides real-time metrics, fraud alerts, and system health
 * 
 * Protected: Requires admin authentication
 * 
 * Response:
 * {
 *   "health": { whatsapp, sms, overall },
 *   "metrics": [ { timestamp, phone, action, channel, success } ],
 *   "security": { blockedPhones, suspiciousPhones, totalAlerts },
 *   "fraudAlerts": [ { timestamp, type, phone, details } ],
 *   "performance": { avgResponseTime, successRate, failureReasons }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { getOTPServiceHealth, getOTPMetrics } from "@/lib/otp-service-v3";
import { getAllSecurityData, getFraudAlerts } from "@/lib/security-fraud";

// Simple admin key validation (in production, use JWT)
function validateAdminKey(request: NextRequest): boolean {
  const adminKey = request.headers.get("X-Admin-Key");
  const expectedKey = process.env.ADMIN_API_KEY;

  if (!expectedKey) {
    console.warn(
      "[Admin API] ADMIN_API_KEY not configured. Denying all admin requests."
    );
    return false;
  }

  return adminKey === expectedKey;
}

/**
 * Calculate metrics from OTP events
 */
function calculateMetrics(metrics: any[]) {
  const deliveryMetrics = metrics.filter((m) => m.action === "delivery");
  const verificationMetrics = metrics.filter((m) => m.action === "verification");
  const failureMetrics = metrics.filter((m) => m.action === "failure");

  const totalDeliveries = deliveryMetrics.length;
  const successfulDeliveries = deliveryMetrics.filter((m) => m.success).length;
  const whatsappDeliveries = deliveryMetrics.filter(
    (m) => m.channel === "whatsapp"
  ).length;
  const smsDeliveries = deliveryMetrics.filter(
    (m) => m.channel === "sms"
  ).length;

  const totalVerifications = verificationMetrics.length;
  const successfulVerifications = verificationMetrics.filter(
    (m) => m.success
  ).length;

  const avgDeliveryTime =
    totalDeliveries > 0
      ? deliveryMetrics.reduce((sum, m) => sum + (m.executionTimeMs || 0), 0) /
        totalDeliveries
      : 0;

  const failureReasons: Record<string, number> = {};
  failureMetrics.forEach((m) => {
    const reason = m.reason || "unknown";
    failureReasons[reason] = (failureReasons[reason] || 0) + 1;
  });

  return {
    totalDeliveries,
    successfulDeliveries,
    deliverySuccessRate:
      totalDeliveries > 0
        ? ((successfulDeliveries / totalDeliveries) * 100).toFixed(2)
        : 0,
    whatsappDeliveries,
    smsDeliveries,
    smsFailoverRate:
      totalDeliveries > 0
        ? ((smsDeliveries / totalDeliveries) * 100).toFixed(2)
        : 0,
    totalVerifications,
    successfulVerifications,
    verificationSuccessRate:
      totalVerifications > 0
        ? ((successfulVerifications / totalVerifications) * 100).toFixed(2)
        : 0,
    totalFailures: failureMetrics.length,
    avgDeliveryTimeMs: avgDeliveryTime.toFixed(2),
    failureReasons,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Admin authentication
    if (!validateAdminKey(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get system health
    const health = getOTPServiceHealth();

    // Get OTP metrics
    const otpMetrics = getOTPMetrics();

    // Get security data
    const securityData = getAllSecurityData();

    // Get fraud alerts
    const fraudAlerts = getFraudAlerts(50);

    // Calculate performance metrics
    const performanceMetrics = calculateMetrics(otpMetrics);

    // Get last 24 hours metrics
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const last24hMetrics = otpMetrics.filter((m) => {
      const metricTime = new Date(m.timestamp).getTime();
      return metricTime >= oneDayAgo;
    });

    const last24hPerformance = calculateMetrics(last24hMetrics);

    // Prepare dashboard response
    const dashboard = {
      timestamp: new Date().toISOString(),
      health: {
        whatsapp: health.aisensy,
        sms: health.sms,
        overall: health.healthy,
        summary: {
          aisensy_configured: health.aisensy,
          sms_configured: health.sms,
          primary_channel: health.aisensy ? "whatsapp" : "sms",
          fallback_channel: health.sms ? "sms" : "none",
        },
      },
      metrics: {
        last_24_hours: last24hPerformance,
        all_time: performanceMetrics,
        sample_events_count: otpMetrics.length,
      },
      security: {
        total_monitored_phones: securityData.totalPhones,
        blocked_phones: securityData.blockedPhones,
        suspicious_phones: securityData.suspiciousPhones,
        total_fraud_alerts: securityData.totalAlerts,
        recent_alerts: fraudAlerts.slice(-10),
      },
      recent_events: {
        deliveries: otpMetrics
          .filter((m) => m.action === "delivery")
          .slice(-20),
        verifications: otpMetrics
          .filter((m) => m.action === "verification")
          .slice(-20),
        failures: otpMetrics
          .filter((m) => m.action === "failure")
          .slice(-10),
      },
    };

    return NextResponse.json(dashboard, { status: 200 });
  } catch (error) {
    console.error("[Admin API] Error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch monitoring data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
