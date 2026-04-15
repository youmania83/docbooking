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

    // Mock mode only if explicitly enabled
    const useMockMode = process.env.AISENSY_MOCK_MODE === "true";

    if (useMockMode) {
      console.log(`[AiSensy] 🎭 MOCK MODE: Would send OTP "${otp}" to ${formattedPhone}`);
      console.log(`[AiSensy] ℹ️  For testing: Use OTP "${otp}" to verify`);
      return {
        success: true,
        message: "OTP sent successfully (MOCK MODE)",
        data: { mock: true, phone: formattedPhone, otp: otp },
      };
    }

    const payload = {
      apiKey: process.env.AISENSY_API_KEY,
      campaignName: process.env.AISENSY_CAMPAIGN_NAME,
      destination: phoneWithoutPlus,
      userName: "docbooking",
      template_name: "docbooking_otp_basic",
      language: "en",
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: otp,
            },
          ],
        },
        {
          type: "button",
          sub_type: "copy_code",
          index: 0,
          parameters: [
            {
              type: "text",
              text: otp,
            },
          ],
        },
      ],
    };

    // Log the full payload for debugging
    console.log(`[AiSensy] Full payload being sent:`, JSON.stringify(payload, null, 2));

    console.log(`[AiSensy] Sending OTP to ${formattedPhone}`);

    const response = await fetch(process.env.AISENSY_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    // Log full API response for debugging
    console.log(`[AiSensy] API Response Status: ${response.status}`, {
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries()),
      body: data,
    });

    if (!response.ok) {
      console.error("[AiSensy] API Error:", {
        status: response.status,
        error: data,
        phone: formattedPhone,
        payload: payload, // Log payload for debugging template issues
      });

      return {
        success: false,
        message: data.message || "Failed to send OTP via WhatsApp",
        data: data,
      };
    }

    // Log successful send
    console.log(`[AiSensy] ✅ OTP sent successfully to ${formattedPhone}`, {
      phone: formattedPhone,
      apiResponse: data,
    });

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
