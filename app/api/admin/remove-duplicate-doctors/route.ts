/**
 * Admin API: Remove duplicate doctors
 * POST /api/admin/remove-duplicate-doctors
 * 
 * Requires admin authentication
 * Removes duplicate doctor entries, keeping only the first one
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { successResponse, errorResponse } from "@/lib/utils/response";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCookie = request.cookies.get("adminToken");
    if (!adminCookie) {
      return errorResponse(
        "Unauthorized. Please login as admin first.",
        "UNAUTHORIZED",
        401
      );
    }

    console.log("🔍 [Admin] Starting duplicate doctor removal...");

    await connectDB();

    // Get all doctors sorted by creation date
    const allDoctors = await Doctor.find().sort({ createdAt: 1 });
    console.log(`📊 Total doctors in database: ${allDoctors.length}`);

    // Track seen names and IDs to delete
    const seenNames = new Map<string, string>();
    const idsToDelete: string[] = [];
    const keptDoctors: any[] = [];

    for (const doctor of allDoctors) {
      const doctorName = doctor.name.toLowerCase().trim();

      if (seenNames.has(doctorName)) {
        console.log(
          `❌ Duplicate found: "${doctor.name}" (ID: ${doctor._id})`
        );
        idsToDelete.push(doctor._id.toString());
      } else {
        console.log(`✅ Keeping: "${doctor.name}" (ID: ${doctor._id})`);
        seenNames.set(doctorName, doctor._id.toString());
        keptDoctors.push({
          id: doctor._id.toString(),
          name: doctor.name,
          specialty: doctor.specialty,
        });
      }
    }

    if (idsToDelete.length === 0) {
      return successResponse(
        {
          duplicatesFound: 0,
          duplicatesDeleted: 0,
          totalDoctors: allDoctors.length,
          keptDoctors,
          message: "No duplicates found!",
        },
        "No duplicates found. Database is clean."
      );
    }

    // Delete duplicate doctors
    console.log(`🗑️  Deleting ${idsToDelete.length} duplicate doctor(s)...`);

    const result = await Doctor.deleteMany({
      _id: {
        $in: idsToDelete.map((id) => new mongoose.Types.ObjectId(id)),
      },
    });

    const finalCount = await Doctor.countDocuments();

    console.log(`✅ Deleted ${result.deletedCount} doctor(s)`);
    console.log(`📈 Final doctor count: ${finalCount}`);

    return successResponse(
      {
        duplicatesFound: idsToDelete.length,
        duplicatesDeleted: result.deletedCount,
        totalDoctorsRemaining: finalCount,
        keptDoctors,
        deletedDoctorIds: idsToDelete,
      },
      `Successfully removed ${result.deletedCount} duplicate doctor(s)`
    );
  } catch (error) {
    console.error("[Admin] Error removing duplicates:", error);

    return errorResponse(
      error instanceof Error ? error.message : "Failed to remove duplicates",
      "ADMIN_ERROR",
      500
    );
  }
}

/**
 * GET /api/admin/remove-duplicate-doctors
 * Check for duplicates without removing
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminCookie = request.cookies.get("adminToken");
    if (!adminCookie) {
      return errorResponse(
        "Unauthorized. Please login as admin first.",
        "UNAUTHORIZED",
        401
      );
    }

    console.log("🔍 [Admin] Checking for duplicate doctors...");

    await connectDB();

    const allDoctors = await Doctor.find().sort({ createdAt: 1 });

    const seenNames = new Map<string, string>();
    const duplicates: any[] = [];

    for (const doctor of allDoctors) {
      const doctorName = doctor.name.toLowerCase().trim();

      if (seenNames.has(doctorName)) {
        duplicates.push({
          id: doctor._id.toString(),
          name: doctor.name,
          specialty: doctor.specialty,
          createdAt: doctor.createdAt,
          willBeDeleted: true,
        });
      } else {
        seenNames.set(doctorName, doctor._id.toString());
      }
    }

    return successResponse(
      {
        totalDoctors: allDoctors.length,
        duplicatesFound: duplicates.length,
        duplicates,
      },
      duplicates.length > 0
        ? `Found ${duplicates.length} duplicate doctor(s)`
        : "No duplicates found"
    );
  } catch (error) {
    console.error("[Admin] Error checking duplicates:", error);

    return errorResponse(
      error instanceof Error ? error.message : "Failed to check duplicates",
      "ADMIN_ERROR",
      500
    );
  }
}
