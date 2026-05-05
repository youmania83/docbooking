import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { SITE_URL } from "@/lib/seo-data";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { id } = await params;

  try {
    await connectDB();
    const doctor = await Doctor.findOne({
      $or: [{ _id: id.length === 24 ? id : null }, { uid: id }],
    }).lean() as any;

    if (!doctor) {
      return new NextResponse("# Doctor Not Found\n\nNo doctor found with this ID.", {
        status: 404,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const doctorId = doctor.uid || doctor._id.toString();
    const canonicalUrl = `${SITE_URL}/doctor/${doctorId}`;

    const slots = doctor.slots && doctor.slots.length > 0
      ? doctor.slots.map((s: string) => `- ${s}`).join("\n")
      : "- Contact clinic for available slots";

    const markdown = `---
title: ${doctor.name} - ${doctor.specialty} in ${doctor.address?.split(",").pop()?.trim() || "Panipat"}
description: Book an appointment with ${doctor.name}, ${doctor.specialty} at ${doctor.clinicName || "their clinic"}. Consultation fee: ₹${doctor.opdFees}. ${doctor.experience} experience.
url: ${canonicalUrl}
last_updated: ${today}
---

# ${doctor.name}

Specialty: ${doctor.specialty}
Qualification: ${doctor.qualification}
Experience: ${doctor.experience}
Consultation Fee: ₹${doctor.opdFees}
Location: ${doctor.address}

## About
${doctor.name} is a ${doctor.specialty} with ${doctor.experience} of experience${doctor.clinicName ? `, practicing at ${doctor.clinicName}` : ""}. ${doctor.qualification ? `Qualified with ${doctor.qualification}.` : ""} Consultation fee is ₹${doctor.opdFees}.

## Clinic Information
${doctor.clinicName ? `Clinic: ${doctor.clinicName}` : ""}
Address: ${doctor.address}
Google Maps: ${doctor.googleLocation}

## Available Slots
${slots}

## How to Book
1. Visit ${canonicalUrl}
2. Select a date and available time slot
3. Verify your phone number via WhatsApp OTP
4. Receive instant booking confirmation

## Contact
Book online at: ${canonicalUrl}
Platform: DocBooking.in — https://docbooking.in
`;

    return new NextResponse(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    return new NextResponse("# Error\n\nFailed to load doctor information.", {
      status: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
