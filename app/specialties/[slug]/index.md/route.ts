import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { SPECIALTIES, SITE_URL } from "@/lib/seo-data";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { slug } = await params;

  const specialtyData = SPECIALTIES.find((s) => s.slug === slug);
  if (!specialtyData) {
    return new NextResponse("# Specialty Not Found\n\nNo specialty matches this slug.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let doctors: any[] = [];
  try {
    await connectDB();
    doctors = await Doctor.find({ specialty: specialtyData.name })
      .select("name specialty opdFees experience address qualification")
      .lean();
  } catch {
    // Proceed with empty doctor list
  }

  const today = new Date().toISOString().split("T")[0];
  const canonicalUrl = `${SITE_URL}/specialties/${slug}`;

  const doctorList =
    doctors.length > 0
      ? doctors
          .map(
            (d: any) =>
              `- ${d.name} (${d.qualification || d.specialty}) — ₹${d.opdFees} — ${d.address}`
          )
          .join("\n")
      : "- More doctors being onboarded. Check DocBooking.in for current listings.";

  const markdown = `---
title: ${specialtyData.name} Doctors in Panipat — Book Appointment | DocBooking
description: Find and book verified ${specialtyData.name} doctors in Panipat. Consultation fees from ₹${specialtyData.minFee} to ₹${specialtyData.maxFee}. Instant appointment booking.
url: ${canonicalUrl}
last_updated: ${today}
---

# ${specialtyData.name} Doctors in Panipat

Specialty: ${specialtyData.name}
Location: Panipat, Haryana, India
Consultation Fee Range: ₹${specialtyData.minFee}–₹${specialtyData.maxFee}
Booking: Free via DocBooking.in

## About This Specialty
${specialtyData.description}

## Available Doctors
${doctorList}

## How to Book a ${specialtyData.name} in Panipat
1. Visit ${SITE_URL}/doctors
2. Filter by "${specialtyData.name}"
3. Choose a doctor and select an available slot
4. Verify your phone number via WhatsApp OTP
5. Receive instant confirmation

## Pricing
- Minimum fee: ₹${specialtyData.minFee}
- Maximum fee: ₹${specialtyData.maxFee}
- Payment: Paid directly at the clinic (cash/UPI)

## Related Pages
- All Doctors in Panipat: ${SITE_URL}/doctors
- ${specialtyData.name} in Panipat: ${SITE_URL}/${slug}-in-panipat
- DocBooking Homepage: ${SITE_URL}
`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
