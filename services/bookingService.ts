/**
 * Booking Service Layer
 * Handles booking-related business logic
 */

import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Doctor from "@/models/Doctor";
import { ValidationError, DatabaseError, NotFoundError } from "@/lib/utils/errors";
import mongoose from "mongoose";

/**
 * Create a new booking
 */
export async function createBooking(bookingData: {
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  doctorId: string;
  slot: string;
  email?: string;
}): Promise<any> {
  try {
    // Validate required fields
    if (
      !bookingData.patientName ||
      typeof bookingData.patientName !== "string" ||
      !bookingData.age ||
      !bookingData.gender ||
      !bookingData.phone ||
      typeof bookingData.phone !== "string" ||
      !bookingData.doctorId ||
      typeof bookingData.doctorId !== "string" ||
      !bookingData.slot ||
      typeof bookingData.slot !== "string"
    ) {
      throw new ValidationError("Invalid or missing required fields.");
    }

    // Validate patient name
    const trimmedName = bookingData.patientName.trim();
    if (trimmedName.length < 2 || trimmedName.length > 100) {
      throw new ValidationError(
        "Patient name must be between 2 and 100 characters."
      );
    }

    // Validate age
    const parsedAge = parseInt(String(bookingData.age), 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 150) {
      throw new ValidationError("Age must be a valid number between 1 and 150.");
    }

    // Validate gender
    if (!["Male", "Female", "Other"].includes(bookingData.gender)) {
      throw new ValidationError("Gender must be Male, Female, or Other.");
    }

    // Validate phone
    const phoneDigits = bookingData.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      throw new ValidationError("Phone number must be a valid 10-digit number.");
    }

    // Validate email if provided
    if (bookingData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(bookingData.email)) {
        throw new ValidationError("Invalid email address.");
      }
    }

    // Validate doctor ID format
    if (!mongoose.Types.ObjectId.isValid(bookingData.doctorId)) {
      throw new ValidationError("Invalid doctor ID format.");
    }

    await connectDB();

    // Verify doctor exists
    const doctor = await Doctor.findById(
      new mongoose.Types.ObjectId(bookingData.doctorId)
    );

    if (!doctor) {
      throw new NotFoundError("Doctor not found.");
    }

    // Verify slot is available
    if (!doctor.slots || !doctor.slots.includes(bookingData.slot)) {
      throw new ValidationError("Invalid or unavailable time slot.");
    }

    // Create booking
    const booking = new Booking({
      patientName: trimmedName,
      age: parsedAge,
      gender: bookingData.gender,
      phone: phoneDigits,
      doctorId: new mongoose.Types.ObjectId(bookingData.doctorId),
      slot: bookingData.slot,
      email: bookingData.email || undefined,
      status: "confirmed",
    });

    const savedBooking = await booking.save();

    console.log(`[Booking Service] ✅ Created booking: ${savedBooking._id}`);
    return savedBooking;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Failed to create booking";
    throw new DatabaseError(message);
  }
}

/**
 * Get all bookings with optional filtering
 */
export async function getAllBookings(filters?: {
  phone?: string;
  doctorId?: string;
  status?: string;
}): Promise<any[]> {
  try {
    await connectDB();

    let query: Record<string, any> = {};

    if (filters?.phone) {
      query.phone = filters.phone.replace(/\D/g, "");
    }

    if (filters?.doctorId) {
      if (mongoose.Types.ObjectId.isValid(filters.doctorId)) {
        query.doctorId = new mongoose.Types.ObjectId(filters.doctorId);
      }
    }

    if (filters?.status) {
      query.status = filters.status;
    }

    const bookings = await Booking.find(query)
      .populate("doctorId")
      .sort({ createdAt: -1 });

    console.log(`[Booking Service] ✅ Found ${bookings.length} bookings`);
    return bookings;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch bookings";
    throw new DatabaseError(message);
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(bookingId: string): Promise<any> {
  try {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new ValidationError("Invalid booking ID format.");
    }

    await connectDB();

    const booking = await Booking.findById(
      new mongoose.Types.ObjectId(bookingId)
    ).populate("doctorId");

    if (!booking) {
      throw new NotFoundError("Booking not found.");
    }

    console.log(`[Booking Service] ✅ Retrieved booking: ${booking._id}`);
    return booking;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Failed to fetch booking";
    throw new DatabaseError(message);
  }
}

/**
 * Cancel booking
 */
export async function cancelBooking(bookingId: string): Promise<any> {
  try {
    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      throw new ValidationError("Invalid booking ID format.");
    }

    await connectDB();

    const booking = await Booking.findByIdAndUpdate(
      new mongoose.Types.ObjectId(bookingId),
      { status: "cancelled" },
      { new: true }
    );

    if (!booking) {
      throw new NotFoundError("Booking not found.");
    }

    console.log(`[Booking Service] ✅ Cancelled booking: ${booking._id}`);
    return booking;
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError
    ) {
      throw error;
    }
    const message = error instanceof Error ? error.message : "Failed to cancel booking";
    throw new DatabaseError(message);
  }
}
