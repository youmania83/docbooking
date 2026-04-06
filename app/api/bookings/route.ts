/**
 * POST /api/bookings - Create a new booking
 * GET /api/bookings - Fetch bookings with optional filtering
 */

import { NextRequest } from "next/server";
import {
  createBooking,
  getAllBookings,
} from "@/services/bookingService";
import {
  successResponse,
  errorResponse,
  createdResponse,
} from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";

/**
 * POST /api/bookings
 * Create a new booking
 * 
 * Request:
 * {
 *   "patientName": "John Doe",
 *   "age": 30,
 *   "gender": "Male",
 *   "phone": "9876543210",
 *   "doctorId": "...",
 *   "slot": "10:00 AM"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create booking via service
    const result = await createBooking(body);

    console.log(`[API] ✅ Booking created: ${result._id}`);

    return createdResponse(
      {
        ...result.toObject?.() || result,
        _id: result._id?.toString?.() || result._id,
      },
      "Booking created successfully"
    );
  } catch (error) {
    console.error("[API] ❌ Create booking error:", error);

    // Handle app errors
    const { statusCode, message, code } = handleError(error);
    return errorResponse(message, code, statusCode);
  }
}

/**
 * GET /api/bookings
 * Fetch bookings with optional filtering
 * 
 * Query parameters:
 * - doctorId: Get booked slots for a specific doctor
 * - phone: Get bookings for a specific phone number
 * - status: Filter by booking status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId") || undefined;
    const phone = searchParams.get("phone") || undefined;
    const status = searchParams.get("status") || undefined;

    // Fetch bookings with optional filters
    const result = await getAllBookings({ doctorId, phone, status });

    console.log(`[API] ✅ Found ${result.length} bookings`);

    return successResponse(result, undefined, 200);
  } catch (error) {
    console.error("[API] ❌ Get bookings error:", error);

    const { statusCode, message, code } = handleError(error);
    return errorResponse(message, code, statusCode);
  }
}
