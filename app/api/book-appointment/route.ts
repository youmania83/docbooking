import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { sendDoctorNotification, sendPatientConfirmation, normalizeWhatsAppPhone } from "@/lib/booking-whatsapp";
import { connectDB } from "@/lib/mongodb";
import { validateSessionToken } from "@/lib/session-token";
import AppointmentBooking from "@/models/AppointmentBooking";
import Doctor from "@/models/Doctor";

interface BookAppointmentBody {
  patientName: string;
  phone: string;
  doctor: string;
  clinic: string;
  date: string;
  time: string;
  address: string;
  location: string;
}

function readSessionToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const sessionHeader = request.headers.get("x-session-token");
  const cookieToken =
    request.cookies.get("docbooking_session")?.value ||
    request.cookies.get("sessionToken")?.value;

  if (sessionHeader) {
    return sessionHeader;
  }

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return cookieToken || null;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeDate(dateInput: string): Date {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  date.setHours(0, 0, 0, 0);
  return date;
}

function validateBody(body: Partial<BookAppointmentBody>): asserts body is BookAppointmentBody {
  const requiredFields: Array<keyof BookAppointmentBody> = [
    "patientName",
    "phone",
    "doctor",
    "clinic",
    "date",
    "time",
    "address",
    "location",
  ];

  for (const field of requiredFields) {
    if (!body[field] || typeof body[field] !== "string" || !body[field]?.trim()) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
}

async function findDoctorRecord(doctorValue: string) {
  if (mongoose.Types.ObjectId.isValid(doctorValue)) {
    return Doctor.findById(new mongoose.Types.ObjectId(doctorValue));
  }

  return Doctor.findOne({
    name: { $regex: new RegExp(`^${escapeRegex(doctorValue.trim())}$`, "i") },
  });
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = readSessionToken(request);
    const session = sessionToken ? validateSessionToken(sessionToken) : null;

    if (!session?.verified) {
      return NextResponse.json({ error: "Phone not verified" }, { status: 401 });
    }

    const body = (await request.json()) as Partial<BookAppointmentBody>;
    validateBody(body);

    const normalizedPhone = normalizeWhatsAppPhone(body.phone);
    const normalizedSessionPhone = normalizeWhatsAppPhone(session.phone);

    if (normalizedPhone !== normalizedSessionPhone) {
      return NextResponse.json(
        { error: "Verified session does not match booking phone" },
        { status: 401 }
      );
    }

    await connectDB();

    const doctorRecord = await findDoctorRecord(body.doctor);

    if (!doctorRecord) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    const bookingDate = normalizeDate(body.date);
    const nextDate = new Date(bookingDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const doubleBookingQuery = doctorRecord._id
      ? {
          doctorId: doctorRecord._id,
          date: { $gte: bookingDate, $lt: nextDate },
          time: body.time.trim(),
        }
      : {
          doctor: body.doctor.trim(),
          clinic: body.clinic.trim(),
          date: { $gte: bookingDate, $lt: nextDate },
          time: body.time.trim(),
        };

    const existingBooking = await AppointmentBooking.findOne(doubleBookingQuery).lean();

    if (existingBooking) {
      return NextResponse.json(
        { error: "This slot is already booked" },
        { status: 409 }
      );
    }

    const bookingId = `DB${Date.now()}`;

    const booking = await AppointmentBooking.create({
      bookingId,
      patientName: body.patientName.trim(),
      phone: normalizedPhone,
      doctor: doctorRecord.name,
      doctorId: doctorRecord._id,
      clinic: body.clinic.trim(),
      date: bookingDate,
      time: body.time.trim(),
      address: body.address.trim(),
      location: body.location.trim(),
      status: "confirmed",
    });

    const [patientMessage, doctorMessage] = await Promise.allSettled([
      sendPatientConfirmation({
        to: normalizedPhone,
        patientName: body.patientName.trim(),
        doctorName: doctorRecord.name,
        clinicName: body.clinic.trim(),
        date: body.date.trim(),
        time: body.time.trim(),
        address: body.address.trim(),
        location: body.location.trim(),
      }),
      sendDoctorNotification({
        to: doctorRecord.phone,
        doctorName: doctorRecord.name,
        patientName: body.patientName.trim(),
        patientPhone: normalizedPhone,
        date: body.date.trim(),
        time: body.time.trim(),
        address: body.address.trim(),
        location: body.location.trim(),
      }),
    ]);

    const patientSent = patientMessage.status === "fulfilled" && patientMessage.value.success;
    const doctorSent = doctorMessage.status === "fulfilled" && doctorMessage.value.success;

    await AppointmentBooking.updateOne(
      { _id: booking._id },
      {
        $set: {
          notificationStatus: {
            patientSent,
            doctorSent,
          },
        },
      }
    );

    if (!patientSent || !doctorSent) {
      console.error("[Book Appointment] WhatsApp notification failure", {
        bookingId,
        patient: patientMessage,
        doctor: doctorMessage,
      });
    }

    return NextResponse.json(
      {
        success: true,
        bookingId,
        data: {
          id: booking._id,
          bookingId,
          patientName: booking.patientName,
          doctor: booking.doctor,
          clinic: booking.clinic,
          date: body.date.trim(),
          time: booking.time,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create booking";

    if (message.startsWith("Missing required field") || message === "Invalid date" || message.includes("Phone number must be a valid Indian mobile number")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("[Book Appointment] Error", {
      error: message,
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Unable to create booking" },
      { status: 500 }
    );
  }
}