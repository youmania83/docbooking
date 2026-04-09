/**
 * POST /api/bookings/notify
 * Internal API to send booking notifications
 * Should be called after successful booking creation
 * 
 * Request:
 * POST /api/bookings/notify
 * {
 *   "patientPhone": "+91XXXXXXXXXX",
 *   "patientName": "John Doe",
 *   "doctorPhone": "+91XXXXXXXXXX",
 *   "doctorName": "Dr. Smith",
 *   "appointmentDate": "2024-04-15",
 *   "appointmentTime": "10:00 AM",
 *   "bookingId": "booking_123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Notifications sent",
 *   "patientNotified": true,
 *   "doctorNotified": true
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { sendBookingNotifications } from "@/services/notificationService";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "patientPhone",
      "patientName",
      "doctorPhone",
      "doctorName",
      "appointmentDate",
      "appointmentTime",
      "bookingId",
    ];

    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return errorResponse(
        `Missing required fields: ${missingFields.join(", ")}`,
        "MISSING_FIELDS",
        400
      );
    }

    // Send notifications
    const result = await sendBookingNotifications({
      patientPhone: body.patientPhone,
      patientName: body.patientName,
      doctorPhone: body.doctorPhone,
      doctorName: body.doctorName,
      appointmentDate: body.appointmentDate,
      appointmentTime: body.appointmentTime,
      bookingId: body.bookingId,
    });

    const statusCode = result.success ? 200 : 207; // 207 for partial success

    return successResponse(
      {
        patientNotified: result.patientNotified,
        doctorNotified: result.doctorNotified,
      },
      result.message,
      statusCode
    );
  } catch (error) {
    console.error("[API] Notification error:", error);

    const { statusCode, message, code } = handleError(error);
    return errorResponse(message, code, statusCode);
  }
}

/**
 * GET /api/bookings/notify
 * Health check
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Booking notification service is running",
  });
}
