/**
 * Meta WhatsApp Cloud API Integration
 * Direct integration with Meta's WhatsApp Cloud API (v18.0)
 * Send OTP via WhatsApp with copy_code button
 */

interface WhatsAppResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Validates Meta WhatsApp configuration
 */
function validateMetaConfig(): void {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;

  if (!phoneNumberId || !accessToken || !businessAccountId) {
    throw new Error(
      "Meta WhatsApp configuration missing: WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN, WHATSAPP_BUSINESS_ACCOUNT_ID"
    );
  }
}

/**
 * Validates Indian phone number format
 */
export function validateIndianPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Formats phone number to 91XXXXXXXXXX format (without +)
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("91")) {
    cleaned = cleaned.slice(2);
  }

  if (cleaned.length !== 10) {
    throw new Error("Phone number must be 10 digits");
  }

  return `91${cleaned}`;
}

/**
 * Sends OTP via WhatsApp using Meta Cloud API
 * Template: docbooking_otp_basic
 * Components: BODY (OTP) + BUTTON (copy_code with OTP)
 */
export async function sendOTPViaWhatsApp(
  phone: string,
  otp: string
): Promise<WhatsAppResponse> {
  try {
    validateMetaConfig();

    if (!validateIndianPhoneNumber(phone)) {
      return {
        success: false,
        message: "Invalid phone number format. Expected Indian number (+91 or 10 digits)",
      };
    }

    const formattedPhone = formatPhoneNumber(phone);

    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "docbooking_otp_basic",
        language: {
          code: "en",
        },
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
      },
    };

    console.log(`[WhatsApp Meta] Sending OTP to ${formattedPhone}`);
    console.log(`[WhatsApp Meta] Payload:`, JSON.stringify(payload, null, 2));

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    console.log(`[WhatsApp Meta] API Response Status: ${response.status}`, {
      ok: response.ok,
      body: data,
    });

    if (!response.ok) {
      console.error("[WhatsApp Meta] API Error:", {
        status: response.status,
        error: data,
        phone: formattedPhone,
      });

      return {
        success: false,
        message: data.error?.message || "Failed to send OTP via WhatsApp",
        data: data,
      };
    }

    console.log(`[WhatsApp Meta] ✅ OTP sent successfully to ${formattedPhone}`, {
      phone: formattedPhone,
      messageId: data.messages?.[0]?.id,
    });

    return {
      success: true,
      message: "OTP sent successfully via WhatsApp",
      data: data,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[WhatsApp Meta] ❌ Error:`, {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      message: `WhatsApp service error: ${message}`,
      data: error,
    };
  }
}

export default {
  sendOTPViaWhatsApp,
};
