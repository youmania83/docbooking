/**
 * AiSensy WhatsApp API Integration
 * Meta WhatsApp Cloud API wrapper for OTP delivery
 * Backend-only: Never expose API key to frontend
 */

interface AiSensyResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Validates AiSensy API configuration
 */
function validateAiSensyConfig(): void {
  const apiKey = process.env.AISENSY_API_KEY;
  const campaignName = process.env.AISENSY_CAMPAIGN_NAME;
  const apiUrl = process.env.AISENSY_API_URL;

  if (!apiKey || !campaignName || !apiUrl) {
    throw new Error(
      "AiSensy configuration missing: AISENSY_API_KEY, AISENSY_CAMPAIGN_NAME, AISENSY_API_URL"
    );
  }
}

/**
 * Validates Indian phone number format
 * Accepts: +91XXXXXXXXXX or XXXXXXXXXX (10 digits)
 */
export function validateIndianPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Formats phone number to +91XXXXXXXXXX format
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.length !== 10) {
    throw new Error("Phone number must be 10 digits");
  }

  return `+91${cleaned}`;
}

/**
 * Sends OTP via WhatsApp using AiSensy API
 * Uses template message for reliability
 */
export async function sendOTPViaAiSensy(
  phone: string,
  otp: string
): Promise<AiSensyResponse> {
  validateAiSensyConfig();

  if (!validateIndianPhoneNumber(phone)) {
    return {
      success: false,
      message: "Invalid phone number format. Expected Indian number (+91 or 10 digits)",
    };
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);
    const phoneWithoutPlus = formattedPhone.replace("+", "");

    const payload = {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: process.env.AISENSY_CAMPAIGN_NAME,
      destination: phoneWithoutPlus,
      templateParams: [otp],
      source: "new-landing-page",
      media: {},
      userName: "DocBooking",
    };

    console.log(`[AiSensy] Sending OTP to ${formattedPhone}`);

    const response = await fetch(process.env.AISENSY_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[AiSensy] API Error:", {
        status: response.status,
        error: data,
        phone: formattedPhone,
      });

      return {
        success: false,
        message: data.message || "Failed to send OTP via WhatsApp",
        data: data,
      };
    }

    // Log successful send (development only)
    if (process.env.NODE_ENV === "development") {
      console.log(`✓ OTP sent to ${formattedPhone}`);
    }

    return {
      success: true,
      message: "OTP sent successfully",
      data: data,
    };
  } catch (error) {
    console.error("[AiSensy] Integration Error:", error);

    return {
      success: false,
      message: "Failed to send OTP. Please try again.",
      data: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export default {
  validateIndianPhoneNumber,
  formatPhoneNumber,
  sendOTPViaAiSensy,
};
