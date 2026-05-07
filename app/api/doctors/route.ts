/**
 * GET /api/doctors
 * Fetch doctors with optional filtering
 * 
 * Query parameters:
 * - id: Get specific doctor by ID
 * - specialty: Search by specialty
 * - name: Search by name
 */

import { NextRequest, NextResponse } from "next/server";
import {
  getAllDoctors,
  getDoctorById,
  createDoctor,
} from "@/services/doctorService";
import { successResponse, errorResponse, createdResponse } from "@/lib/utils/response";
import { handleError } from "@/lib/utils/errors";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const specialty = searchParams.get("specialty") || undefined;
    const name = searchParams.get("name") || undefined;

    let result;

    // If ID is provided, fetch specific doctor
    if (id) {
      result = await getDoctorById(id);
      result = [result]; // Wrap in array for consistency
    } else {
      // Fetch all doctors with optional filters
      result = await getAllDoctors({ specialty, name });
    }

    const response = successResponse(result, undefined, 200);

    // Set cache headers based on query
    const cacheTime =
      specialty || name ? 60 : 120; // Less cache for filtered searches
    response.headers.set(
      "Cache-Control",
      `public, max-age=${cacheTime}, s-maxage=${cacheTime}`
    );

    return response;
  } catch (error) {
    console.error("[API] ❌ Get doctors error:", error);

    const { statusCode, message, code } = handleError(error);
    return errorResponse(message, code, statusCode);
  }
}

/**
 * POST /api/doctors
 * Create a new doctor (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create doctor via service — pass all fields from body
    const result = await createDoctor({
      name: body.name,
      specialty: body.specialty,
      qualification: body.qualification,
      experience: body.experience,
      clinicName: body.clinicName,
      address: body.address,
      googleLocation: body.googleLocation,
      phone: body.phone,
      opdFees: body.opdFees ?? body.fee,
      slots: body.slots || [],
      about: body.about,
      timings: body.timings || [],
      services: body.services || [],
      isAvailable: body.isAvailable ?? true,
      patientsSeen: body.patientsSeen ?? 0,
      rating: body.rating ?? 5.0,
      image: body.image,
      city: body.city,
      slug: body.slug,
    });

    console.log(`[API] ✅ Doctor created: ${result._id}`);

    return createdResponse(
      {
        ...result.toObject?.() || result,
        _id: result._id?.toString?.() || result._id,
      },
      "Doctor added successfully"
    );
  } catch (error) {
    console.error("[API] ❌ Create doctor error:", error);

    const { statusCode, message, code } = handleError(error);
    return errorResponse(message, code, statusCode);
  }
}
