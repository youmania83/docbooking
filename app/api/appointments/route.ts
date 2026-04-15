/**
 * /api/appointments
 *
 * POST  — Create a new appointment (OTP-verified patients only via session token)
 * GET   — Fetch appointments by doctorId or patient phone
 *
 * POST body:
 * {
 *   "patientName": "John Doe",
 *   "phone": "9876543210",
 *   "doctorId": "<ObjectId>",
 *   "appointmentDate": "2026-04-20",
 *   "appointmentTime": "10:00 AM"
 * }
 *
 * GET query params:
 *   ?doctorId=<id>   → appointments for a doctor
 *   ?phone=<10-digit> → appointments for a patient
 */

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";
import Appointment from "@/models/Appointment";
import Patient from "@/models/Patient";
import Doctor from "@/models/Doctor";
import { validateSessionToken } from "@/lib/session-token";
import { sendPatientConfirmation, sendDoctorNotification } from "@/lib/booking-whatsapp";

// ── helpers ────────────────────────────────────────────────────────────────

function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, ...( data as object) }, { status });
}

function fail(message: string, status: number, code?: string) {
  return NextResponse.json({ success: false, message, ...(code ? { code } : {}) }, { status });
}

/** Normalise a 10-digit phone, strip leading 91 if 12 digits */
function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 10) return digits;
  throw new Error("Phone must be a valid 10-digit Indian number");
}

/** Returns midnight UTC for a given date string → consistent uniqueness key */
function toDateOnly(dateStr: string): Date {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) throw new Error("Invalid appointment date");
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function formatDateForTemplate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function readSessionToken(request: NextRequest): string | null {
  const h = request.headers.get("x-session-token");
  if (h) return h;
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7).trim();
  return (
    request.cookies.get("docbooking_session")?.value ||
    request.cookies.get("sessionToken")?.value ||
    null
  );
}

// ── POST /api/appointments ─────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    // 1. Validate session token
    const rawToken = readSessionToken(request);
    if (!rawToken) {
      return fail("Session token is required. Please verify your phone first.", 401, "NO_SESSION");
    }

    const session = validateSessionToken(rawToken);
    if (!session?.verified) {
      return fail("Session is not verified. Please complete OTP verification.", 401, "SESSION_INVALID");
    }

    // 2. Parse body
    const body = await request.json();
    const { patientName, phone, doctorId, appointmentDate, appointmentTime } = body as Record<string, string>;

    // 3. Validate required fields
    const missing = ["patientName", "phone", "doctorId", "appointmentDate", "appointmentTime"].filter(
      (f) => !body[f]?.trim()
    );
    if (missing.length) {
      return fail(`Missing required fields: ${missing.join(", ")}`, 400, "MISSING_FIELDS");
    }

    // 4. Validate phone & cross-check with session
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizePhone(phone);
    } catch {
      return fail("Invalid phone number format", 400, "INVALID_PHONE");
    }

    const sessionPhone = normalizePhone(session.phone);
    if (normalizedPhone !== sessionPhone) {
      return fail("Booking phone does not match verified session phone.", 403, "PHONE_MISMATCH");
    }

    // 5. Validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return fail("Invalid doctorId", 400, "INVALID_DOCTOR_ID");
    }

    // 6. Validate time format
    if (!/^\d{1,2}:\d{2}\s(AM|PM)$/i.test(appointmentTime.trim())) {
      return fail("appointmentTime must be in H:MM AM/PM format (e.g. 9:00 AM)", 400, "INVALID_TIME");
    }

    // 7. Normalise date (midnight UTC = date-only key)
    let dateOnly: Date;
    try {
      dateOnly = toDateOnly(appointmentDate);
    } catch {
      return fail("Invalid appointmentDate", 400, "INVALID_DATE");
    }

    await connectDB();

    // 8. Verify doctor exists
    const doctor = await Doctor.findById(new mongoose.Types.ObjectId(doctorId));
    if (!doctor) {
      return fail("Doctor not found", 404, "DOCTOR_NOT_FOUND");
    }

    // 9. Check for double-booking
    const duplicate = await Appointment.findOne({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      appointmentDate: dateOnly,
      appointmentTime: appointmentTime.trim(),
      status: { $ne: "cancelled" },
    });
    if (duplicate) {
      return fail("This time slot is already booked. Please choose another slot.", 409, "SLOT_TAKEN");
    }

    // 10. Find or create patient
    const patient = await Patient.findOneAndUpdate(
      { phone: normalizedPhone },
      { $set: { name: patientName.trim() }, $setOnInsert: { phone: normalizedPhone } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // 11. Create appointment
    const appointment = await Appointment.create({
      doctorId: new mongoose.Types.ObjectId(doctorId),
      patientId: patient._id,
      appointmentDate: dateOnly,
      appointmentTime: appointmentTime.trim(),
      status: "confirmed",
    });

    console.log("[Booking Created]", {
      uid: appointment.uid,
      doctor: doctor.name,
      patient: patient.name,
      date: appointmentDate,
      time: appointmentTime,
    });

    // 12. Build shared template values
    const formattedDate = formatDateForTemplate(dateOnly);
    const clinicName = doctor.clinicName || doctor.name;
    const address = doctor.address || "";
    const mapLink = doctor.googleLocation || "";

    // 13. Send WhatsApp messages in parallel — never fails the booking on error
    console.log("[WhatsApp] Sending confirmation messages…");
    const [patientResult, doctorResult] = await Promise.allSettled([
      sendPatientConfirmation({
        to: normalizedPhone,
        patientName: patient.name,
        doctorName: doctor.name,
        date: formattedDate,
        time: appointment.appointmentTime,
        clinicName,
        address,
        location: mapLink,
      }),
      sendDoctorNotification({
        to: doctor.phone,
        doctorName: doctor.name,
        patientName: patient.name,
        patientPhone: normalizedPhone,
        date: formattedDate,
        time: appointment.appointmentTime,
        address,
        location: mapLink,
      }),
    ]);

    const patientSent = patientResult.status === "fulfilled" && patientResult.value.success;
    const doctorSent  = doctorResult.status  === "fulfilled" && doctorResult.value.success;

    console.log("[WhatsApp] Results:", {
      patientSent,
      patientError: patientResult.status === "rejected"
        ? patientResult.reason
        : (!patientSent ? (patientResult as PromiseFulfilledResult<{ message: string }>).value.message : null),
      doctorSent,
      doctorError: doctorResult.status === "rejected"
        ? doctorResult.reason
        : (!doctorSent ? (doctorResult as PromiseFulfilledResult<{ message: string }>).value.message : null),
    });

    return ok({
      appointment: {
        uid: appointment.uid,
        appointmentDate: formattedDate,
        appointmentTime: appointment.appointmentTime,
        status: appointment.status,
        createdAt: appointment.createdAt,
      },
      doctor: {
        id: doctor._id,
        name: doctor.name,
        clinicName,
        address,
        googleLocation: mapLink,
        phone: doctor.phone,
        specialty: doctor.specialty,
        opdFees: doctor.opdFees,
      },
      patient: {
        uid: patient.uid,
        name: patient.name,
        phone: patient.phone,
      },
      notifications: {
        patientSent,
        doctorSent,
      },
    }, 201);

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error("[POST /api/appointments]", msg);

    // MongoDB duplicate key (race condition)
    if ((error as NodeJS.ErrnoException).code === "11000") {
      return fail("This time slot was just booked. Please choose another slot.", 409, "SLOT_TAKEN");
    }

    return fail("Internal server error", 500, "SERVER_ERROR");
  }
}

// ── GET /api/appointments ──────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get("doctorId");
    const phone = searchParams.get("phone");

    if (!doctorId && !phone) {
      return fail("Provide doctorId or phone as a query parameter", 400, "MISSING_QUERY");
    }

    await connectDB();

    let appointments: unknown[] = [];

    if (doctorId) {
      if (!mongoose.Types.ObjectId.isValid(doctorId)) {
        return fail("Invalid doctorId", 400, "INVALID_DOCTOR_ID");
      }

      appointments = await Appointment.find({
        doctorId: new mongoose.Types.ObjectId(doctorId),
      })
        .populate("patientId", "uid name phone")
        .populate("doctorId", "name clinicName address googleLocation phone specialty opdFees")
        .sort({ appointmentDate: 1, appointmentTime: 1 })
        .lean();
    } else if (phone) {
      let normalizedPhone: string;
      try {
        normalizedPhone = normalizePhone(phone);
      } catch {
        return fail("Invalid phone number", 400, "INVALID_PHONE");
      }

      const patient = await Patient.findOne({ phone: normalizedPhone }).lean();
      if (!patient) {
        return ok({ count: 0, data: [] });
      }

      appointments = await Appointment.find({ patientId: (patient as { _id: mongoose.Types.ObjectId })._id })
        .populate("doctorId", "name clinicName address googleLocation phone specialty opdFees")
        .sort({ appointmentDate: -1 })
        .lean();
    }

    // Add formatted date and whatsappTemplate to each record
    const data = (appointments as Array<Record<string, unknown>>).map((appt: Record<string, unknown>) => {
      const formattedDate = formatDateForTemplate(appt.appointmentDate as Date);
      const doc = appt.doctorId as Record<string, unknown> | null;
      const pat = appt.patientId as Record<string, unknown> | null;
      const clinicName = (doc?.clinicName as string) || (doc?.name as string) || "";
      const address = (doc?.address as string) || "";
      const mapLink = (doc?.googleLocation as string) || "";

      return {
        ...appt,
        appointmentDateFormatted: formattedDate,
        whatsappTemplate: doc && pat
          ? {
              patient: [pat.name, doc.name, clinicName, formattedDate, appt.appointmentTime, address, mapLink],
              doctor: [doc.name, pat.name, pat.phone, formattedDate, appt.appointmentTime, address, mapLink],
            }
          : undefined,
      };
    });

    return ok({ count: data.length, data });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error("[GET /api/appointments]", msg);
    return fail("Internal server error", 500, "SERVER_ERROR");
  }
}
