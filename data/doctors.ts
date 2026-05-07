// ============================================================
// DOCTOR DATA — Edit this file to update doctor profiles
// Each doctor needs a unique `slug` (used in the URL).
// ============================================================

export interface DoctorTiming {
  day: string;
  hours: string;
}

export interface Doctor {
  slug: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  /** Path relative to /public — use a square image, min 400×400px */
  image: string;
  /** Include country code, e.g. +919310837724 */
  phone: string;
  clinicName: string;
  clinicAddress: string;
  city: string;
  about: string;
  timings: DoctorTiming[];
  services: string[];
  opdFees: number;
  isAvailable: boolean;
  patientsSeen: number;
  rating: number;
  /** Google Maps share link for "Get Directions" CTA */
  googleLocation?: string;
}

export const doctors: Doctor[] = [
  // ──────────────────────────────────────────────────────────
  // DOCTOR 1 — Edit details below
  // ──────────────────────────────────────────────────────────
  {
    slug: "dr-tushar-kalra-general-physician-panipat",
    name: "Dr. Tushar Kalra",
    specialty: "General Physician",
    qualification: "MBBS, MD (Internal Medicine)",
    experience: "12+ Years Experience",
    image: "/logos/doctor-placeholder.webp",
    phone: "+919310837724",
    clinicName: "Kalra Medical Clinic",
    clinicAddress: "Sector 13, Panipat, Haryana 132103",
    city: "Panipat",
    about:
      "Dr. Tushar Kalra is an experienced General Physician based in Panipat with over 12 years of practice. He specialises in treating common ailments, chronic conditions, and provides preventive healthcare. Known for his patient-first approach and transparent treatment plans.",
    timings: [
      { day: "Monday – Saturday", hours: "9:00 AM – 1:00 PM" },
      { day: "Monday – Saturday", hours: "5:00 PM – 8:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    services: [
      "General Consultation",
      "Fever & Infection Treatment",
      "Diabetes Management",
      "Hypertension Care",
      "Preventive Health Checkup",
    ],
    opdFees: 300,
    isAvailable: true,
    patientsSeen: 5000,
    rating: 4.8,
    googleLocation: "https://maps.google.com",
  },

  // ──────────────────────────────────────────────────────────
  // DOCTOR 2 — Edit details below
  // ──────────────────────────────────────────────────────────
  {
    slug: "dr-ashootosh-kalra-surgeon-panipat",
    name: "Dr. Ashootosh Kalra",
    specialty: "Surgeon",
    qualification: "MBBS, MS (General Surgery)",
    experience: "15+ Years Experience",
    image: "/logos/doctor-placeholder.webp",
    phone: "+919310837724",
    clinicName: "Kalra Surgical Centre",
    clinicAddress: "GT Road, Panipat, Haryana 132103",
    city: "Panipat",
    about:
      "Dr. Ashootosh Kalra is a highly skilled General Surgeon with 15+ years of surgical experience in Panipat. He specialises in laparoscopic and open surgeries, hernia repairs, and appendectomies. His clinic is equipped with modern surgical infrastructure.",
    timings: [
      { day: "Monday – Friday", hours: "10:00 AM – 2:00 PM" },
      { day: "Monday – Friday", hours: "5:00 PM – 8:00 PM" },
      { day: "Saturday", hours: "10:00 AM – 1:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    services: [
      "Laparoscopic Surgery",
      "Hernia Repair",
      "Appendectomy",
      "Wound Care & Dressings",
      "Pre-Surgical Consultation",
    ],
    opdFees: 500,
    isAvailable: true,
    patientsSeen: 8000,
    rating: 4.9,
    googleLocation: "https://maps.google.com",
  },

  // ──────────────────────────────────────────────────────────
  // DOCTOR 3 — Edit details below
  // ──────────────────────────────────────────────────────────
  {
    slug: "dr-keerat-kalra-gynecologist-panipat",
    name: "Dr. Keerat Kalra",
    specialty: "Gynecologist",
    qualification: "MBBS, MS (Obstetrics & Gynaecology)",
    experience: "10+ Years Experience",
    image: "/logos/doctor-placeholder.webp",
    phone: "+919310837724",
    clinicName: "Kalra Women's Clinic",
    clinicAddress: "Model Town, Panipat, Haryana 132103",
    city: "Panipat",
    about:
      "Dr. Keerat Kalra is a dedicated Gynecologist and Obstetrician based in Panipat with over 10 years of experience. She provides comprehensive women's healthcare including prenatal care, high-risk pregnancy management, and gynaecological surgeries.",
    timings: [
      { day: "Monday – Saturday", hours: "10:00 AM – 2:00 PM" },
      { day: "Monday – Saturday", hours: "5:00 PM – 7:30 PM" },
      { day: "Sunday", hours: "By Appointment Only" },
    ],
    services: [
      "Prenatal & Antenatal Care",
      "High-Risk Pregnancy",
      "Gynaecological Consultation",
      "Normal & C-Section Deliveries",
      "PCOD / PCOS Management",
    ],
    opdFees: 400,
    isAvailable: true,
    patientsSeen: 6000,
    rating: 4.9,
    googleLocation: "https://maps.google.com",
  },

  // ──────────────────────────────────────────────────────────
  // DOCTOR 4 — Edit details below
  // ──────────────────────────────────────────────────────────
  {
    slug: "dr-pankaj-bajaj-orthopedic-panipat",
    name: "Dr. Pankaj Bajaj",
    specialty: "Orthopedic",
    qualification: "MBBS, MS (Orthopaedics)",
    experience: "18+ Years Experience",
    image: "/logos/doctor-placeholder.webp",
    phone: "+919310837724",
    clinicName: "Bajaj Bone & Joint Clinic",
    clinicAddress: "Sanjay Colony, Panipat, Haryana 132103",
    city: "Panipat",
    about:
      "Dr. Pankaj Bajaj is one of Panipat's most trusted Orthopedic specialists with 18+ years of experience. He is known for treating sports injuries, joint replacements, and spine problems with precision and minimal recovery time.",
    timings: [
      { day: "Monday – Saturday", hours: "9:30 AM – 1:30 PM" },
      { day: "Monday – Saturday", hours: "5:00 PM – 8:00 PM" },
      { day: "Sunday", hours: "Closed" },
    ],
    services: [
      "Joint Replacement Surgery",
      "Sports Injury Treatment",
      "Fracture Management",
      "Spine & Disc Problems",
      "Arthritis Treatment",
    ],
    opdFees: 600,
    isAvailable: true,
    patientsSeen: 12000,
    rating: 4.8,
    googleLocation: "https://maps.google.com",
  },
];

// ──────────────────────────────────────────────────────────
// Helper functions — do not edit
// ──────────────────────────────────────────────────────────

export function getDoctorBySlug(slug: string): Doctor | undefined {
  return doctors.find((d) => d.slug === slug);
}

export function getDoctorsBySpecialty(specialty: string): Doctor[] {
  return doctors.filter(
    (d) => d.specialty.toLowerCase() === specialty.toLowerCase()
  );
}
