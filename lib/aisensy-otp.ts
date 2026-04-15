/**
 * AiSensy WhatsApp OTP Service
 * Direct integration with AiSensy API endpoint
 * Sends OTP with copy_code button support
 */

/**
 * Sends OTP via WhatsApp using AiSensy API
 * 
 * @param phoneNumber - Phone number with 91 prefix (e.g., "918368137724")
 * @param otp - 6-digit OTP code
 * @param patientName - Patient name for personalization
 * @returns { success: boolean, message: string }
 */
export async function sendWhatsAppOTP(
  phoneNumber: string,
  otp: string,
  patientName: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Validate environment variables
    const apiKey = process.env.AISENSY_API_KEY;
    if (!apiKey) {
      console.error("[AiSensy] Missing AISENSY_API_KEY");
      return {
        success: false,
        message: "WhatsApp service not configured",
      };
    }

    // Format phone: input is "+91XXXXXXXXXX", need "91XXXXXXXXXX"
    const destination = phoneNumber.replace(/^\+/, "").trim();
    
    if (!destination.startsWith("91")) {
      return {
        success: false,
        message: "Invalid phone format - must start with 91",
      };
    }

    // Fix destination: remove all non-digits, remove 91 prefix, pad to 10 digits, add 91
    const cleanDest = destination.replace(/[^0-9]/g, "").replace(/^91/, "").padStart(10, "");
    const finalDestination = "91" + cleanDest;
    
    const payload = {
      apiKey: apiKey.trim(),  // ← .trim() removes any \n or whitespace
      campaignName: "Docbooking",
      destination: finalDestination,  // Format: 91XXXXXXXXXX (exactly 12 digits)
      userName: patientName,
      source: "DocBooking Website",
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
      tags: ["otp-verification"],
      attributes: {}
    };

    console.log(`[AiSensy] Sending OTP to ${destination}`, {
      patientName,
      otp,
      payload,
    });

    const response = await fetch("https://backend.aisensy.com/campaign/t1/api/v2", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Get raw response first for debugging
    const rawResponse = await response.text();
    console.log("[AiSensy] Raw response:", rawResponse);

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(rawResponse);
    } catch (parseError) {
      console.error("[AiSensy] Failed to parse response:", {
        rawResponse,
        parseError,
      });
      return {
        success: false,
        message: "Invalid response from WhatsApp service",
      };
    }

    console.log(`[AiSensy] API Response:`, {
      status: response.status,
      data,
    });

    // CRITICAL: AiSensy returns 200 even on failure - check response body for error
    if (!response.ok || data.error) {
      console.error("[AiSensy] API Error:", {
        status: response.status,
        error: data.error || data.message,
        data,
      });

      return {
        success: false,
        message: data.error || data.message || "Failed to send OTP via WhatsApp",
      };
    }

    console.log(`[AiSensy] ✅ OTP sent successfully to ${destination}`);

    return {
      success: true,
      message: "OTP sent successfully via WhatsApp",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[AiSensy] Error sending OTP:", {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return {
      success: false,
      message: `Error: ${message}`,
    };
  }
}

export default {
  sendWhatsAppOTP,
};
