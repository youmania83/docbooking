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
 * Generate a URL-friendly slug from name + specialty + city
 * e.g. "Dr. Tushar Kalra" + "General Physician" + "Panipat" → "dr-tushar-kalra-general-physician-panipat"
 */
function generateSlug(name: string, specialty: string, city: string = "panipat"): string {
  return [name, specialty, city]
    .join(" ")
    .toLowerCase()
    .replace(/dr\.\s*/g, "dr-")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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
  qualification?: string;
  experience?: string;
  clinicName?: string;
  address?: string;
  googleLocation?: string;
  phone?: string;
  opdFees?: number;
  fee?: number;
  slots?: string[];
  about?: string;
  timings?: { day: string; hours: string }[];
  services?: string[];
  isAvailable?: boolean;
  patientsSeen?: number;
  rating?: number;
  image?: string;
  city?: string;
  slug?: string;
}): Promise<any> {
  try {
    if (
      !doctorData.name ||
      typeof doctorData.name !== "string" ||
      !doctorData.specialty ||
      typeof doctorData.specialty !== "string"
    ) {
      throw new ValidationError("Invalid doctor data provided.");
    }

    const trimmedName = doctorData.name.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new ValidationError("Doctor name must be between 2 and 100 characters.");
    }

    await connectDB();

    // Auto-generate slug if not provided
    let slug = doctorData.slug?.trim() || generateSlug(trimmedName, doctorData.specialty, doctorData.city);

    // Ensure slug uniqueness — append short random suffix if taken
    const existing = await Doctor.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const opdFees = doctorData.opdFees ?? doctorData.fee ?? 0;

    const doctor = new Doctor({
      name: trimmedName,
      specialty: doctorData.specialty.trim(),
      qualification: doctorData.qualification?.trim() || "",
      experience: doctorData.experience?.trim() || "",
      clinicName: doctorData.clinicName?.trim() || "",
      address: doctorData.address?.trim() || "",
      googleLocation: doctorData.googleLocation?.trim() || "",
      phone: doctorData.phone?.trim() || "",
      opdFees,
      slots: doctorData.slots || [],
      about: doctorData.about?.trim() || "",
      timings: doctorData.timings || [],
      services: doctorData.services || [],
      isAvailable: doctorData.isAvailable ?? true,
      patientsSeen: doctorData.patientsSeen ?? 0,
      rating: doctorData.rating ?? 5.0,
      image: doctorData.image?.trim() || "",
      slug,
    });

    const savedDoctor = await doctor.save();

    console.log(`[Doctor Service] ✅ Created doctor: ${savedDoctor._id} uid: ${savedDoctor.uid} slug: ${savedDoctor.slug}`);
    return savedDoctor;
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Failed to create doctor";
    throw new DatabaseError(message);
  }
}
