import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { LOCATIONS, SPECIALTIES, SITE_URL } from "@/lib/seo-data";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

interface Props {
  params: Promise<{ city: string }>;
}

export async function GET(_req: Request, { params }: Props) {
  const { city } = await params;

  const locationData = LOCATIONS.find((l) => l.slug === city);
  if (!locationData) {
    return new NextResponse("# Location Not Found\n\nNo data available for this city.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  let doctors: any[] = [];
  let specialtiesInCity: string[] = [];

  try {
    await connectDB();
    doctors = await Doctor.find()
      .select("name specialty opdFees experience address qualification")
      .lean();
    specialtiesInCity = [...new Set(doctors.map((d: any) => d.specialty as string))].sort();
  } catch {
    specialtiesInCity = SPECIALTIES.map((s) => s.name);
  }

  const today = new Date().toISOString().split("T")[0];
  const canonicalUrl = `${SITE_URL}/locations/${city}`;

  const doctorList =
    doctors.length > 0
      ? doctors
          .map(
            (d: any) =>
              `- ${d.name} (${d.specialty}) — ₹${d.opdFees} — ${d.address}`
          )
          .join("\n")
      : "- Visit DocBooking.in to see current doctor listings.";

  const specialtyLinks = SPECIALTIES.map(
    (s) =>
      `- ${s.name} in ${locationData.city}: ${SITE_URL}/${s.slug}-in-${locationData.slug}`
  ).join("\n");

  const markdown = `---
title: Doctors in ${locationData.city} — Book Appointment Online | DocBooking
description: Find and book verified doctors in ${locationData.city}, ${locationData.state}. ${specialtiesInCity.join(", ")} and more. Instant OPD appointment booking via DocBooking.in.
url: ${canonicalUrl}
last_updated: ${today}
---

# Doctors in ${locationData.city}, ${locationData.state}

City: ${locationData.city}
State: ${locationData.state}
Country: India
Platform: DocBooking.in
Booking: Free for patients

## About Healthcare in ${locationData.city}
DocBooking connects patients in ${locationData.city} with verified local doctors across multiple specialties. Skip OPD queues by booking appointments online in under 2 minutes.

## Available Specialties
${specialtiesInCity.map((s) => `- ${s}`).join("\n")}

## Doctors in ${locationData.city}
${doctorList}

## Consultation Fees in ${locationData.city}
${SPECIALTIES.map((s) => `- ${s.name}: ₹${s.minFee}–₹${s.maxFee}`).join("\n")}

## Specialty Pages
${specialtyLinks}

## How to Book a Doctor in ${locationData.city}
1. Visit ${SITE_URL}/doctors
2. Browse or search for your required specialty
3. Select an available slot
4. Verify via WhatsApp OTP
5. Receive booking confirmation

## About DocBooking
DocBooking is an India-first doctor appointment booking platform. All doctors are manually verified. Booking is free for patients — pay consultation fee directly at the clinic.

Platform URL: ${SITE_URL}
`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
