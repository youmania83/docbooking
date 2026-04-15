const AISENSY_ENDPOINT = "https://backend.aisensy.com/campaign/t1/api/v2";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SendWhatsAppMessageArgs {
  campaignName: string;
  destination: string;
  params: string[];
}

interface WhatsAppResult {
  success: boolean;
  message: string;
  data?: unknown;
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/**
 * Formats a Date object or ISO date string to "DD MMM YYYY" (en-IN).
 * e.g. 2026-04-20 → "20 Apr 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/**
 * Formats a 24-hour time string ("HH:MM") to "hh:mm AM/PM".
 * If the input already contains AM/PM it is returned as-is.
 * e.g. "14:30" → "02:30 pm", "9:00 AM" → "9:00 AM"
 */
export function formatTime(time: string): string {
  if (/am|pm/i.test(time)) return time; // already formatted
  const d = new Date(`1970-01-01T${time}`);
  if (isNaN(d.getTime())) return time; // can't parse — return raw
  return d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Normalise phone ───────────────────────────────────────────────────────────

/** Normalise any raw Indian phone string to "91XXXXXXXXXX" */
export function normalizeWhatsAppPhone(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) {
    if (!/^[6-9]\d{9}$/.test(digits)) throw new Error("Invalid Indian phone number");
    return `91${digits}`;
  }
  if (
    digits.length === 12 &&
    digits.startsWith("91") &&
    /^[6-9]\d{9}$/.test(digits.slice(2))
  ) {
    return digits;
  }
  throw new Error("Phone number must be a valid Indian mobile number");
}

// ── Template param builders ───────────────────────────────────────────────────

/**
 * Build the 7-param array for the "Booking_Confirmation" template.
 *
 * Template:
 *   Hello {{1}},
 *   Your appointment has been successfully booked ✅
 *   👨‍⚕️ Doctor: {{2}}
 *   🏥 Clinic: {{3}}
 *   📅 Date: {{4}}
 *   ⏰ Time: {{5}}
 *   📍 Address: {{6}}
 *   🗺️ Location: {{7}}
 *
 * Param order (MUST NOT change):
 *   {{1}} patient.name
 *   {{2}} doctor.name
 *   {{3}} doctor.clinic_name
 *   {{4}} appointment.date  (formatted DD MMM YYYY)
 *   {{5}} appointment.time  (formatted hh:mm AM/PM)
 *   {{6}} doctor.clinic_address
 *   {{7}} doctor.google_map_link
 */
export function buildPatientTemplateParams({
  patient,
  doctor,
  appointment,
}: {
  patient: { name: string };
  doctor: {
    name: string;
    clinic_name: string;
    clinic_address: string;
    google_map_link: string;
  };
  appointment: { date: Date | string; time: string };
}): string[] {
  const params = [
    patient.name,                 // {{1}}
    doctor.name,                  // {{2}}
    doctor.clinic_name,           // {{3}}
    formatDate(appointment.date), // {{4}}
    formatTime(appointment.time), // {{5}}
    doctor.clinic_address,        // {{6}}
    doctor.google_map_link,       // {{7}}
  ];

  const invalid = params
    .map((v, i) => ({ i: i + 1, v }))
    .filter(({ v }) => v === undefined || v === null || v === "");
  if (invalid.length) {
    throw new Error(
      `buildPatientTemplateParams: missing value(s) at position(s) ${invalid.map((x) => `{{${x.i}}}`).join(", ")}`
    );
  }

  console.log("Patient Template Params:", params);
  return params;
}

/**
 * Build the 7-param array for the "Docbooking_notification" template.
 *
 * Param order (MUST NOT change):
 *   {{1}} doctor.name
 *   {{2}} patient.name
 *   {{3}} patient.phone
 *   {{4}} appointment.date  (formatted DD MMM YYYY)
 *   {{5}} appointment.time  (formatted hh:mm AM/PM)
 *   {{6}} doctor.clinic_address
 *   {{7}} doctor.google_map_link
 */
export function buildDoctorTemplateParams({
  doctor,
  patient,
  appointment,
}: {
  doctor: { name: string; clinic_address: string; google_map_link: string };
  patient: { name: string; phone: string };
  appointment: { date: Date | string; time: string };
}): string[] {
  const params = [
    doctor.name,                  // {{1}}
    patient.name,                 // {{2}}
    patient.phone,                // {{3}}
    formatDate(appointment.date), // {{4}}
    formatTime(appointment.time), // {{5}}
    doctor.clinic_address,        // {{6}}
    doctor.google_map_link,       // {{7}}
  ];

  const invalid = params
    .map((v, i) => ({ i: i + 1, v }))
    .filter(({ v }) => v === undefined || v === null || v === "");
  if (invalid.length) {
    throw new Error(
      `buildDoctorTemplateParams: missing value(s) at position(s) ${invalid.map((x) => `{{${x.i}}}`).join(", ")}`
    );
  }

  console.log("Doctor Template Params:", params);
  return params;
}

// ── Core send function ────────────────────────────────────────────────────────

/**
 * Sends a WhatsApp template message via AiSensy.
 * - API key goes in the request body (NOT in Authorization header)
 * - Validates destination: exactly 12 digits starting with 91
 * - Validates params: exactly 7 items, no null/undefined/empty
 * - Never throws; always returns a result object
 */
export async function sendWhatsAppMessage({
  campaignName,
  destination,
  params,
}: SendWhatsAppMessageArgs): Promise<WhatsAppResult> {
  const apiKey = process.env.AISENSY_API_KEY;

  if (!apiKey) {
    console.error("[WhatsApp] AISENSY_API_KEY is not configured");
    return { success: false, message: "AISENSY_API_KEY not configured" };
  }

  // Validate destination format: 91 + 10-digit Indian mobile
  if (!/^91[6-9]\d{9}$/.test(destination)) {
    console.error(
      `[WhatsApp] Invalid destination "${destination}" — must be 12 digits starting with 91`
    );
    return { success: false, message: `Invalid destination phone: ${destination}` };
  }

  // Validate params count
  if (params.length !== 7) {
    console.error(
      `[WhatsApp] Campaign "${campaignName}" expects 7 params, got ${params.length}`
    );
    return { success: false, message: `Params length must be exactly 7, got ${params.length}` };
  }

  // Validate no null/undefined/empty params
  const invalid = params
    .map((v, i) => ({ i: i + 1, v }))
    .filter(({ v }) => v === undefined || v === null || v === "");
  if (invalid.length) {
    const positions = invalid.map((x) => `{{${x.i}}}`).join(", ");
    console.error(`[WhatsApp] Campaign "${campaignName}" has empty param(s) at ${positions}`);
    return { success: false, message: `Empty param(s) at ${positions}` };
  }

  console.log("Sending WhatsApp to:", destination);
  console.log("Campaign:", campaignName);
  console.log("Params:", params);

  const payload = {
    apiKey: apiKey.trim(),
    campaignName,
    destination,
    userName: "docbooking",
    templateParams: params,
  };

  try {
    const response = await fetch(AISENSY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let data: unknown = rawText;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = rawText;
    }

    console.log(`[WhatsApp] Response HTTP ${response.status}:`, data);

    // AiSensy returns { "success": "true" } (string) on success
    const isSuccess =
      typeof data === "object" &&
      data !== null &&
      (data as Record<string, unknown>).success === "true";

    if (response.ok && isSuccess) {
      console.log(`[WhatsApp] ✅ Campaign="${campaignName}" delivered to ${destination}`);
      return { success: true, message: "Sent", data };
    }

    console.error(`[WhatsApp] ❌ Campaign="${campaignName}" failed`, {
      destination,
      status: response.status,
      data,
    });
    return { success: false, message: "AiSensy returned failure", data };
  } catch (err) {
    console.error(`[WhatsApp] ❌ Network error for campaign="${campaignName}"`, {
      destination,
      error: err instanceof Error ? err.message : String(err),
    });
    return {
      success: false,
      message: `Network error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

// ── Typed wrappers ────────────────────────────────────────────────────────────

/**
 * Send appointment confirmation to patient.
 * Campaign: "Booking_Confirmation"
 *
 * Template param order: patientName, doctorName, clinicName, date, time, address, location
 */
export async function sendPatientConfirmation(args: {
  to: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  date: string;
  time: string;
  address: string;
  location: string;
}): Promise<WhatsAppResult> {
  const destination = normalizeWhatsAppPhone(args.to);
  const params = [
    args.patientName, // {{1}}
    args.doctorName,  // {{2}}
    args.clinicName,  // {{3}}
    args.date,        // {{4}}
    args.time,        // {{5}}
    args.address,     // {{6}}
    args.location,    // {{7}}
  ];
  console.log("Patient Template Params:", params);
  return sendWhatsAppMessage({ campaignName: "Booking_Confirmation", destination, params });
}

/**
 * Send new booking notification to doctor.
 * Campaign: "Docbooking_notification"
 *
 * Template param order: doctorName, patientName, patientPhone, date, time, address, location
 */
export async function sendDoctorNotification(args: {
  to: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  address: string;
  location: string;
}): Promise<WhatsAppResult> {
  const destination = normalizeWhatsAppPhone(args.to);
  const params = [
    args.doctorName,   // {{1}}
    args.patientName,  // {{2}}
    args.patientPhone, // {{3}}
    args.date,         // {{4}}
    args.time,         // {{5}}
    args.address,      // {{6}}
    args.location,     // {{7}}
  ];
  console.log("Doctor Template Params:", params);
  return sendWhatsAppMessage({ campaignName: "Docbooking_notification", destination, params });
}
