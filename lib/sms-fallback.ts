/**
 * SMS Fallback Service (Fast2SMS)
 * Optional fallback mechanism when WhatsApp delivery fails
 * Testing phase: SMS disabled (only WhatsApp)
 * Production: SMS enabled for maximum reliability
 */

interface SMSResponse {
  success: boolean;
  message: string;
  requestId?: string;
  carrier?: string;
}

/**
 * Checks if Fast2SMS is configured (optional in testing phase)
 */
export function isFast2SMSConfigured(): boolean {
  return !!process.env.FAST2SMS_API_KEY;
}

/**
 * Validates Fast2SMS configuration (throws if not available)
 */
function validateFast2SMSConfig(): void {
  if (!isFast2SMSConfigured()) {
    throw new Error("FAST2SMS_API_KEY not configured - SMS fallback disabled");
  }
}

/**
 * Formats phone number to 10-digit format
 */
function formatPhoneForSMS(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  
  if (cleaned.length === 10) return cleaned;
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned.slice(2);
  }
  
  throw new Error("Invalid phone number for SMS");
}

/**
 * Sends OTP via SMS as fallback
 * @param phone - Phone number (Indian, 10 digits)
 * @param otp - 6-digit OTP
 * @returns SMS send result
 */
export async function sendOTPViaSMS(
  phone: string,
  otp: string
): Promise<SMSResponse> {
  try {
    validateFast2SMSConfig();

    const cleanPhone = formatPhoneForSMS(phone);
    const apiKey = process.env.FAST2SMS_API_KEY!;

    console.log(`[SMS Fallback] 📱 Sending SMS OTP to ${cleanPhone}`);

    // Fast2SMS payload
    const requestBody = {
      route: "otp",
      variables_values: otp,
      numbers: cleanPhone,
    };

    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    console.log(`[SMS Fallback] API Response:`, {
      status: response.status,
      body: data,
    });

    if (!response.ok || data.return === false) {
      console.error("[SMS Fallback] ❌ SMS Send Failed:", {
        phone: cleanPhone,
        error: data?.message || "Unknown error",
        data: data,
      });

      return {
        success: false,
        message: data?.message || "Failed to send SMS OTP",
      };
    }

    console.log(`[SMS Fallback] ✅ SMS queued. Request ID: ${data.request_id}`);

    return {
      success: true,
      message: "OTP sent via SMS",
      requestId: data.request_id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[SMS Fallback] ❌ Critical Error:`, {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      message: `SMS service unavailable: ${message}`,
    };
  }
}

/**
 * Check SMS service health
 */
export async function checkSMSServiceHealth(): Promise<{
  healthy: boolean;
  message: string;
}> {
  try {
    validateFast2SMSConfig();
    return { healthy: true, message: "SMS service configured" };
  } catch (error) {
    return {
      healthy: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default {
  sendOTPViaSMS,
  checkSMSServiceHealth,
  isFast2SMSConfigured,
};
