/**
 * WATI API Integration Utility
 * Handles all WhatsApp communication via WATI API
 * Backend-only: Never expose API token to frontend
 */

interface WATITemplateParam {
  [key: string]: string | number;
}

interface WATIResponse {
  success: boolean;
  message: string;
  data?: any;
}

interface WATIError {
  status: number;
  message: string;
  details?: any;
}

/**
 * Validates WATI API configuration
 */
function validateWATIConfig(): void {
  const token = process.env.WATI_API_TOKEN;
  const baseUrl = process.env.WATI_BASE_URL;

  if (!token || !baseUrl) {
    throw new Error(
      'WATI_API_TOKEN and WATI_BASE_URL must be set in environment variables'
    );
  }
}

/**
 * Validates Indian phone number format
 * Accepts: +91XXXXXXXXXX or XXXXXXXXXX (10 digits)
 */
export function validateIndianPhoneNumber(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Match +91 (country code) followed by 10 digits OR just 10 digits
  const phoneRegex = /^(\+91)?[6-9]\d{9}$/;

  return phoneRegex.test(cleaned);
}

/**
 * Formats phone number to +91XXXXXXXXXX format
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[\s\-()]/g, '');

  // Remove +91 if present, we'll add it back
  if (cleaned.startsWith('+91')) {
    cleaned = cleaned.slice(3);
  }

  // Ensure 10 digits
  if (cleaned.length !== 10) {
    throw new Error('Phone number must be 10 digits');
  }

  return `+91${cleaned}`;
}

/**
 * Sends a template message via WATI API
 * Supports: OTP messages, booking confirmations, notifications
 *
 * @param phone - Phone number (will be formatted to +91XXXXXXXXXX)
 * @param templateName - WATI template identifier
 * @param parameters - Template parameters (array of strings for placeholders)
 * @returns WATI API response
 */
export async function sendTemplateMessage(
  phone: string,
  templateName: string,
  parameters: string[]
): Promise<WATIResponse> {
  validateWATIConfig();

  if (!validateIndianPhoneNumber(phone)) {
    return {
      success: false,
      message: 'Invalid phone number format. Expected Indian number (+91 or 10 digits)',
    };
  }

  try {
    const formattedPhone = formatPhoneNumber(phone);

    const payload = {
      whatsappNumber: formattedPhone,
      templateName,
      parameters,
    };

    const response = await fetch(
      `${process.env.WATI_BASE_URL}/api/v1/sendSessionTemplateMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.WATI_API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('WATI API Error:', {
        status: response.status,
        error: data,
        phone: formattedPhone,
        template: templateName,
      });

      return {
        success: false,
        message: data.message || 'Failed to send message via WATI',
        data: data,
      };
    }

    // Log successful sends (without sensitive data in production)
    if (process.env.NODE_ENV === 'development') {
      console.log(`✓ Message sent to ${formattedPhone} (${templateName})`);
    }

    return {
      success: true,
      message: 'Message sent successfully',
      data: data,
    };
  } catch (error) {
    console.error('WATI Integration Error:', error);

    return {
      success: false,
      message: 'Internal server error while sending message',
      data: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Sends OTP message to patient
 * Template: docbooking_otp
 * Message: "Your DocBooking OTP is {{1}}. Do not share this code."
 */
export async function sendOTPMessage(phone: string, otp: string): Promise<WATIResponse> {
  return sendTemplateMessage(phone, 'docbooking_otp', [otp]);
}

/**
 * Sends booking confirmation to patient
 * Template: docbooking_booking_confirm
 * Parameters: [doctorName, appointmentDate, appointmentTime, bookingId]
 */
export async function sendBookingConfirmation(
  phone: string,
  doctorName: string,
  appointmentDate: string,
  appointmentTime: string,
  bookingId: string
): Promise<WATIResponse> {
  return sendTemplateMessage(phone, 'docbooking_booking_confirm', [
    doctorName,
    appointmentDate,
    appointmentTime,
    bookingId,
  ]);
}

/**
 * Sends doctor notification about new booking
 * Template: docbooking_doctor_alert
 * Parameters: [doctorName, patientName, appointmentDate, appointmentTime]
 */
export async function sendDoctorNotification(
  doctorPhone: string,
  doctorName: string,
  patientName: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<WATIResponse> {
  return sendTemplateMessage(doctorPhone, 'docbooking_doctor_alert', [
    doctorName,
    patientName,
    appointmentDate,
    appointmentTime,
  ]);
}

/**
 * Sends reminder message (24 hours before appointment)
 * Template: docbooking_appointment_reminder
 * Parameters: [appointmentDate, appointmentTime]
 */
export async function sendAppointmentReminder(
  phone: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<WATIResponse> {
  return sendTemplateMessage(phone, 'docbooking_appointment_reminder', [
    appointmentDate,
    appointmentTime,
  ]);
}

export default {
  validateIndianPhoneNumber,
  formatPhoneNumber,
  sendTemplateMessage,
  sendOTPMessage,
  sendBookingConfirmation,
  sendDoctorNotification,
  sendAppointmentReminder,
};
