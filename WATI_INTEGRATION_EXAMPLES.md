/**
 * EXAMPLE: Integration with DocBooking Booking Flow
 * Shows how to use the WATI OTP and Notification system in your booking workflow
 * 
 * This is a reference implementation - adapt to your specific needs
 */

// ============================================================================
// EXAMPLE 1: Integrate OTP Verification Component in Login/Booking Page
// ============================================================================

// File: app/page.tsx or app/doctor/[id]/page.tsx

"use client";

import React, { useState } from "react";
import OTPVerificationForm from "@/components/OTPVerificationWhatsApp";
import BookingForm from "@/components/PatientDetailsForm"; // Existing component

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<"otp" | "booking">("otp");

  const handleOTPVerified = (phone: string) => {
    setVerifiedPhone(phone);
    setCurrentStep("booking");
  };

  if (!verifiedPhone) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Book an Appointment</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <OTPVerificationForm onVerified={handleOTPVerified} />
          </div>
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Why WhatsApp OTP?</h2>
            <ul className="space-y-2 text-sm">
              <li>✓ Instant verification</li>
              <li>✓ No emails required</li>
              <li>✓ Direct communication</li>
              <li>✓ Appointment reminders</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // After OTP verification, show booking form
  return (
    <div className="container mx-auto py-8">
      <div className="mb-4 p-3 bg-green-100 rounded">
        ✓ Verified: {verifiedPhone}
      </div>
      <BookingForm phone={verifiedPhone} />
    </div>
  );
}

// ============================================================================
// EXAMPLE 2: Send OTP in Registration/Signup Flow
// ============================================================================

// File: app/api/auth/register/route.ts

import { NextRequest, NextResponse } from "next/server";
import { generateOTP, storeOTP } from "@/lib/otp";
import { sendOTPMessage } from "@/lib/wati";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    const { phone, email, name } = await request.json();

    // Validate phone
    if (!phone) {
      return errorResponse("Phone number is required", "MISSING_PHONE", 400);
    }

    // Generate OTP
    const otp = generateOTP();

    // Store OTP
    storeOTP(phone, otp);

    // Send via WhatsApp
    const result = await sendOTPMessage(phone, otp);

    if (!result.success) {
      return errorResponse(
        "Failed to send OTP",
        "OTP_SEND_FAILED",
        500
      );
    }

    // Don't return OTP to frontend for security
    return successResponse(
      { phone },
      "OTP sent to your WhatsApp. Please verify.",
      200
    );
  } catch (error) {
    console.error("Registration error:", error);
    return errorResponse(
      "Registration failed",
      "REGISTRATION_ERROR",
      500
    );
  }
}

// ============================================================================
// EXAMPLE 3: Complete Booking Creation with Notifications
// ============================================================================

// File: app/api/bookings/create/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Doctor } from "@/models/Doctor";
import { sendBookingNotifications } from "@/services/notificationService";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const {
      patientPhone,
      patientName,
      doctorId,
      appointmentDate,
      appointmentTime,
      symptoms,
    } = await request.json();

    // Validate inputs
    if (!patientPhone || !patientName || !doctorId || !appointmentDate || !appointmentTime) {
      return errorResponse("Missing required fields", "INVALID_INPUT", 400);
    }

    // Get doctor details
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return errorResponse("Doctor not found", "DOCTOR_NOT_FOUND", 404);
    }

    // Create booking
    const booking = await Booking.create({
      patientPhone,
      patientName,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      symptoms,
      status: "confirmed",
      createdAt: new Date(),
    });

    // Send notifications to both parties
    const notificationResult = await sendBookingNotifications({
      patientPhone,
      patientName,
      doctorPhone: doctor.phone,
      doctorName: doctor.name,
      appointmentDate: appointmentDate,
      appointmentTime,
      bookingId: booking._id.toString(),
    });

    console.log("Notification result:", notificationResult);

    // Return booking even if notifications fail
    return successResponse(
      {
        booking: {
          id: booking._id.toString(),
          status: booking.status,
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
        },
        notifications: {
          patientNotified: notificationResult.patientNotified,
          doctorNotified: notificationResult.doctorNotified,
        },
      },
      "Booking confirmed! Notifications sent.",
      201
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return errorResponse(
      "Failed to create booking",
      "BOOKING_ERROR",
      500
    );
  }
}

// ============================================================================
// EXAMPLE 4: API to Trigger Appointment Reminders (Scheduled Job)
// ============================================================================

// File: app/api/jobs/appointment-reminders/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { notifyPatientAppointmentReminder } from "@/services/notificationService";
import { successResponse, errorResponse } from "@/lib/utils/response";

/**
 * This endpoint should be called by a cron job (e.g., once daily)
 * To trigger reminders for appointments happening tomorrow
 */
export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const apiKey = request.headers.get("x-api-key");
    if (apiKey !== process.env.CRON_SECRET) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }

    await connectDB();

    // Calculate tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startOfDay = new Date(tomorrow.setHours(0, 0, 0, 0));
    const endOfDay = new Date(tomorrow.setHours(23, 59, 59, 999));

    // Find appointments for tomorrow
    const upcomingBookings = await Booking.find({
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      status: "confirmed",
    });

    console.log(`Found ${upcomingBookings.length} appointments for tomorrow`);

    // Send reminders
    let successCount = 0;
    let failureCount = 0;

    for (const booking of upcomingBookings) {
      const result = await notifyPatientAppointmentReminder(
        booking.patientPhone,
        booking.appointmentDate.toLocaleDateString("en-IN"),
        booking.appointmentTime
      );

      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        console.error(
          `Failed to send reminder to ${booking.patientPhone}:`,
          result.message
        );
      }
    }

    return successResponse(
      {
        total: upcomingBookings.length,
        sent: successCount,
        failed: failureCount,
      },
      "Appointment reminders processed",
      200
    );
  } catch (error) {
    console.error("Reminder job error:", error);
    return errorResponse(
      "Failed to send reminders",
      "JOB_ERROR",
      500
    );
  }
}

// ============================================================================
// EXAMPLE 5: Handle Booking Cancellation with Notification
// ============================================================================

// File: app/api/bookings/[id]/cancel/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Booking } from "@/models/Booking";
import { Doctor } from "@/models/Doctor";
import { sendTemplateMessage } from "@/lib/wati";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;
    const { cancellationReason } = await request.json();

    const booking = await Booking.findByIdAndUpdate(
      id,
      {
        status: "cancelled",
        cancellationReason,
        cancelledAt: new Date(),
      },
      { new: true }
    );

    if (!booking) {
      return errorResponse("Booking not found", "NOT_FOUND", 404);
    }

    // Get doctor details
    const doctor = await Doctor.findById(booking.doctorId);

    // Send cancellation notification to patient
    await sendTemplateMessage(
      booking.patientPhone,
      "docbooking_booking_cancelled",
      [booking._id.toString(), cancellationReason || "No reason provided"]
    );

    // Notify doctor about cancellation
    if (doctor) {
      await sendTemplateMessage(
        doctor.phone,
        "docbooking_booking_cancelled_doctor",
        [booking.patientName, booking.appointmentDate.toLocaleDateString()]
      );
    }

    return successResponse(
      { booking },
      "Booking cancelled. Notifications sent.",
      200
    );
  } catch (error) {
    console.error("Cancellation error:", error);
    return errorResponse(
      "Failed to cancel booking",
      "CANCELLATION_ERROR",
      500
    );
  }
}

// ============================================================================
// EXAMPLE 6: Vercel Cron Job Configuration
// ============================================================================

// File: vercel.json (ADD THIS TO YOUR EXISTING vercel.json)

/*
{
  "crons": [
    {
      "path": "/api/jobs/appointment-reminders",
      "schedule": "0 9 * * *"
    }
  ]
}

Settings:
- "0 9 * * *" = Every day at 9:00 AM UTC
- Remember to set CRON_SECRET environment variable in Vercel dashboard
- Call API with header: x-api-key: your_secret_key
*/

// ============================================================================
// EXAMPLE 7: Frontend Hook to Create Booking
// ============================================================================

// File: hooks/useCreateBooking.ts

"use client";

import { useState } from "react";

interface CreateBookingParams {
  patientPhone: string;
  patientName: string;
  doctorId: string;
  appointmentDate: Date;
  appointmentTime: string;
  symptoms: string;
}

export function useCreateBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (params: CreateBookingParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientPhone: params.patientPhone,
          patientName: params.patientName,
          doctorId: params.doctorId,
          appointmentDate: params.appointmentDate.toISOString(),
          appointmentTime: params.appointmentTime,
          symptoms: params.symptoms,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking");
      }

      return {
        success: true,
        booking: data.data.booking,
        notifications: data.data.notifications,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  return { createBooking, loading, error };
}

// Usage in component:
// const { createBooking, loading } = useCreateBooking();
// await createBooking({ patientPhone, patientName, ... });

// ============================================================================
// EXAMPLE 8: Complete Booking Form Component
// ============================================================================

// This shows how all the pieces work together

"use client";

import React, { useState } from "react";
import { useCreateBooking } from "@/hooks/useCreateBooking";

interface BookingFormProps {
  verifiedPhone: string;
  doctorId: string;
}

export default function CompleteBookingForm({
  verifiedPhone,
  doctorId,
}: BookingFormProps) {
  const [patientName, setPatientName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [bookingStep, setBookingStep] = useState<
    "form" | "confirmation" | "success"
  >("form");

  const { createBooking, loading, error } = useCreateBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await createBooking({
      patientPhone: verifiedPhone,
      patientName,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      symptoms,
    });

    if (result.success) {
      setBookingStep("success");
    }
  };

  if (bookingStep === "success") {
    return (
      <div className="p-6 bg-green-50 rounded-lg border border-green-200">
        <h2 className="text-2xl font-bold text-green-800 mb-4">
          ✓ Booking Confirmed!
        </h2>
        <p className="text-gray-700 mb-4">
          You'll receive a confirmation message on WhatsApp shortly.
        </p>
        <p className="text-sm text-gray-600">
          Booking Date: {appointmentDate} at {appointmentTime}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-2xl font-bold">Complete Your Booking</h2>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Verified Phone</label>
        <input
          type="tel"
          value={verifiedPhone}
          disabled
          className="w-full px-3 py-2 border rounded bg-gray-100"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Your Name</label>
        <input
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Appointment Date</label>
        <input
          type="date"
          value={appointmentDate}
          onChange={(e) => setAppointmentDate(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Appointment Time</label>
        <input
          type="time"
          value={appointmentTime}
          onChange={(e) => setAppointmentTime(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Symptoms/Issues</label>
        <textarea
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 rounded"
      >
        {loading ? "Creating Booking..." : "Confirm Booking"}
      </button>
    </form>
  );
}

export default CompleteBookingForm;
