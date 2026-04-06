/**
 * Doctor Service Layer
 * Handles doctor-related business logic
 */

import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { ValidationError, DatabaseError, NotFoundError } from "@/lib/utils/errors";
import mongoose from "mongoose";

/**
 * Sanitize input to prevent regex injection
 */
function sanitizeInput(input: string, maxLength: number = 100): string {
  if (typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[^a-zA-Z0-9\s\-.,()&@]+/g, "");
}

/**
 * Get all doctors with optional filtering
 */
export async function getAllDoctors(filters?: {
  specialty?: string;
  name?: string;
}): Promise<any[]> {
  try {
    await connectDB();

    let query: Record<string, any> = {};

    if (filters?.specialty) {
      const sanitized = sanitizeInput(filters.specialty, 50);
      query.specialty = { $regex: sanitized, $options: "i" };
    }

    if (filters?.name) {
      const sanitized = sanitizeInput(filters.name, 50);
      query.name = { $regex: sanitized, $options: "i" };
    }

    const doctors = await Doctor.find(query).sort({ createdAt: -1 });

    console.log(`[Doctor Service] ✅ Found ${doctors.length} doctors`);
    return doctors;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch doctors";
    throw new DatabaseError(message);
  }
}

/**
 * Get doctor by ID
 */
export async function getDoctorById(doctorId: string): Promise<any> {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      throw new ValidationError("Invalid doctor ID format.");
    }

    await connectDB();

    const doctor = await Doctor.findById(
      new mongoose.Types.ObjectId(doctorId)
    );

    if (!doctor) {
      throw new NotFoundError("Doctor not found.");
    }

    console.log(`[Doctor Service] ✅ Retrieved doctor: ${doctor._id}`);
    return doctor;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NotFoundError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Failed to fetch doctor";
    throw new DatabaseError(message);
  }
}

/**
 * Create a new doctor (admin only)
 */
export async function createDoctor(doctorData: {
  name: string;
  specialty: string;
  fee: number;
  slots: string[];
}): Promise<any> {
  try {
    // Validate required fields
    if (
      !doctorData.name ||
      typeof doctorData.name !== "string" ||
      !doctorData.specialty ||
      typeof doctorData.specialty !== "string" ||
      typeof doctorData.fee !== "number" ||
      !Array.isArray(doctorData.slots)
    ) {
      throw new ValidationError("Invalid doctor data provided.");
    }

    // Validate name
    const trimmedName = doctorData.name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new ValidationError("Doctor name must be between 2 and 100 characters.");
    }

    // Validate fee
    if (doctorData.fee < 0 || doctorData.fee > 100000) {
      throw new ValidationError("Valid fee must be between 0 and 100000.");
    }

    await connectDB();

    const doctor = new Doctor({
      name: trimmedName,
      specialty: doctorData.specialty.trim(),
      fee: doctorData.fee,
      slots: doctorData.slots,
    });

    const savedDoctor = await doctor.save();

    console.log(`[Doctor Service] ✅ Created doctor: ${savedDoctor._id}`);
    return savedDoctor;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Failed to create doctor";
    throw new DatabaseError(message);
  }
}
