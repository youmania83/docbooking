import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { SPECIALTIES, LOCATIONS, HOMEPAGE_FAQ } from "@/lib/seo-data";

export const dynamic = "force-dynamic";
export const revalidate = 3600;

export async function GET() {
  let doctorCount = 0;
  let specialtyList: string[] = [];

  try {
    await connectDB();
    doctorCount = await Doctor.countDocuments();
    const docs = await Doctor.find().select("specialty").lean();
    specialtyList = [...new Set(docs.map((d: any) => d.specialty as string))].sort();
  } catch {
    specialtyList = SPECIALTIES.map((s) => s.name);
  }

  const specialtyPricing = SPECIALTIES.map(
    (s) => `- ${s.name}: ₹${s.minFee}–₹${s.maxFee} consultation`
  ).join("\n");

  const locationList = LOCATIONS.map((l) => `- ${l.city}, ${l.state}`).join("\n");

  const faqText = HOMEPAGE_FAQ.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join(
    "\n\n"
  );

  const content = `# DocBooking.in

> DocBooking is an India-focused doctor discovery and online appointment booking platform. Patients can find verified doctors by specialty and location, view real consultation fees, and book OPD slots instantly without standing in queues.

## About
DocBooking helps patients in Panipat and nearby areas skip OPD queues by booking doctor appointments online. Every doctor is manually verified. Appointments are confirmed instantly via WhatsApp OTP.

## Platform Facts
- Active doctors: ${doctorCount > 0 ? doctorCount : "Growing network"}
- Primary city: Panipat, Haryana, India
- Booking method: Online via phone OTP (WhatsApp)
- Cost to patients: Free (pay consultation fee at clinic)
- Founded: 2024

## Services and Pricing
${specialtyPricing}

## Specialties Available
${specialtyList.map((s) => `- ${s}`).join("\n")}

## Locations Served
${locationList}

## How It Works
1. Search → Browse doctors by specialty or name
2. Select → View doctor profile, fees, and available slots
3. Verify → Confirm identity via WhatsApp OTP
4. Book → Receive instant appointment confirmation
5. Visit → Arrive at clinic at your scheduled time

## For Patients
- Free appointment booking
- Verified, credentialed doctors
- Transparent consultation pricing before booking
- Instant WhatsApp confirmation
- Same-day appointments available

## For Doctors
- Direct patient booking system
- No spam or unqualified leads
- Better patient quality and show rates
- Professional clinic profile listing

## Key Facts
- India-focused doctor discovery platform
- Real clinic-based in-person appointments (not telemedicine)
- WhatsApp-based OTP verification
- Growing network of verified doctors in North India

## Website Sections
- Homepage: https://docbooking.in
- Find Doctors: https://docbooking.in/doctors
- Dentist in Panipat: https://docbooking.in/dentist-in-panipat
- Dermatologist in Panipat: https://docbooking.in/dermatologist-in-panipat
- General Physician in Panipat: https://docbooking.in/general-physician-in-panipat
- Gynecologist in Panipat: https://docbooking.in/gynecologist-in-panipat
- Orthopedic in Panipat: https://docbooking.in/orthopedic-in-panipat

## FAQ
${faqText}

## Contact & Legal
- Privacy Policy: https://docbooking.in/privacy-policy
- Terms & Conditions: https://docbooking.in/terms-and-conditions
- Cancellation Policy: https://docbooking.in/cancellation-policy
- Refund Policy: https://docbooking.in/refund-policy
`;

  return new NextResponse(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
