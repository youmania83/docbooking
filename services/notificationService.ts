/**
 * Booking Notification Service
 * Sends WhatsApp notifications for booking events via WATI API
 * Handles: confirmation, cancellation, reminder, status updates
 */

import {
  sendBookingConfirmation,
  sendDoctorNotification,
  sendAppointmentReminder,
  formatPhoneNumber,
} from "@/lib/wati";

interface BookingNotificationPayload {
  patientPhone: string;
  patientName: string;
  doctorPhone: string;
  doctorName: string;
  appointmentDate: string; // Format: DD-MM-YYYY or YYYY-MM-DD (will be formatted)
  appointmentTime: string; // Format: HH:MM AM/PM
  bookingId: string;
}

/**
 * Format date to readable format
 * Handles multiple input formats
 */
function formatDateForMessage(dateInput: string | Date): string {
  try {
    let date: Date;

    if (typeof dateInput === "string") {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateInput.toString(); // Fallback to original string
    }

    // Format: "15 April 2024"
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    return date.toLocaleDateString("en-IN", options);
  } catch (error) {
    console.error("Date formatting error:", error);
    return dateInput.toString();
  }
}

/**
 * Sends booking confirmation to patient via WhatsApp
 * Triggered: When booking is successfully created
 */
export async function notifyPatientBookingConfirmed(
  payload: BookingNotificationPayload
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const formattedDate = formatDateForMessage(payload.appointmentDate);

    const response = await sendBookingConfirmation(
      payload.patientPhone,
      payload.doctorName,
      formattedDate,
      payload.appointmentTime,
      payload.bookingId
    );

    if (!response.success) {
      console.error("Failed to send patient booking confirmation:", {
        phone: payload.patientPhone,
        booking: payload.bookingId,
        error: response.message,
      });

      return {
        success: false,
        message: "Failed to send booking confirmation to patient",
      };
    }

    console.log(`✓ Patient notification sent for booking ${payload.bookingId}`);

    return {
      success: true,
      message: "Booking confirmation sent to patient",
    };
  } catch (error) {
    console.error("Patient notification error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown notification error",
    };
  }
}

/**
 * Sends booking alert to doctor via WhatsApp
 * Triggered: When new booking is created
 */
export async function notifyDoctorNewBooking(
  payload: BookingNotificationPayload
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const formattedDate = formatDateForMessage(payload.appointmentDate);

    const response = await sendDoctorNotification(
      payload.doctorPhone,
      payload.doctorName,
      payload.patientName,
      formattedDate,
      payload.appointmentTime
    );

    if (!response.success) {
      console.error("Failed to send doctor notification:", {
        phone: payload.doctorPhone,
        booking: payload.bookingId,
        error: response.message,
      });

      return {
        success: false,
        message: "Failed to send notification to doctor",
      };
    }

    console.log(
      `✓ Doctor notification sent for booking ${payload.bookingId}`
    );

    return {
      success: true,
      message: "Booking alert sent to doctor",
    };
  } catch (error) {
    console.error("Doctor notification error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown notification error",
    };
  }
}

/**
 * Sends appointment reminder to patient
 * Triggered: 24 hours before appointment
 * Note: Implement as a scheduled job (cron or external service)
 */
export async function notifyPatientAppointmentReminder(
  phone: string,
  appointmentDate: string,
  appointmentTime: string
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const formattedDate = formatDateForMessage(appointmentDate);

    const response = await sendAppointmentReminder(
      phone,
      formattedDate,
      appointmentTime
    );

    if (!response.success) {
      console.error("Failed to send appointment reminder:", {
        phone,
        error: response.message,
      });

      return {
        success: false,
        message: "Failed to send appointment reminder",
      };
    }

    console.log(`✓ Appointment reminder sent to ${phone}`);

    return {
      success: true,
      message: "Reminder sent successfully",
    };
  } catch (error) {
    console.error("Appointment reminder error:", error);

    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Unknown reminder error",
    };
  }
}

/**
 * Sends both patient and doctor notifications after booking
 * Use this as the main entry point in booking creation
 */
export async function sendBookingNotifications(
  payload: BookingNotificationPayload
): Promise<{
  success: boolean;
  patientNotified: boolean;
  doctorNotified: boolean;
  message: string;
}> {
  const results = {
    patientNotified: false,
    doctorNotified: false,
    message: "",
  };

  try {
    // Send to patient
    const patientResult = await notifyPatientBookingConfirmed(payload);
    results.patientNotified = patientResult.success;

    // Send to doctor
    const doctorResult = await notifyDoctorNewBooking(payload);
    results.doctorNotified = doctorResult.success;

    if (!results.patientNotified && !results.doctorNotified) {
      return {
        success: false,
        ...results,
        message: "Failed to send notifications to both parties",
      };
    }

    if (!results.patientNotified || !results.doctorNotified) {
      return {
        success: true, // Partial success
        ...results,
        message: "Partial notification - some recipients may not have received message",
      };
    }

    return {
      success: true,
      ...results,
      message: "All notifications sent successfully",
    };
  } catch (error) {
    console.error("Booking notification batch error:", error);

    return {
      success: false,
      ...results,
      message:
        error instanceof Error ? error.message : "Unknown notification error",
    };
  }
}

export default {
  notifyPatientBookingConfirmed,
  notifyDoctorNewBooking,
  notifyPatientAppointmentReminder,
  sendBookingNotifications,
  formatDateForMessage,
};
