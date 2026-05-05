import { Metadata } from "next";
import SpecialtyLocationPage, {
  generateSpecialtyLocationMetadata,
} from "@/components/SpecialtyLocationPage";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return generateSpecialtyLocationMetadata(
    "General Physician",
    "Panipat",
    100,
    500,
    "general-physician-in-panipat"
  );
}

const FAQ = [
  {
    question: "What is the General Physician consultation fee in Panipat?",
    answer:
      "General Physician fees in Panipat range from ₹100 to ₹500. A basic consultation for fever, cold, or minor illness typically costs ₹100–₹250. More detailed health check-ups or consultations for chronic conditions may cost ₹300–₹500.",
  },
  {
    question: "When should I see a General Physician?",
    answer:
      "See a General Physician for fever, cold, flu, cough, stomach infections, diabetes management, hypertension monitoring, routine health check-ups, minor injuries, and initial diagnosis of new symptoms. GPs are your first point of contact for most health concerns.",
  },
  {
    question: "Can I book a General Physician the same day in Panipat?",
    answer:
      "Yes. General Physicians on DocBooking typically have same-day slots available. Book in under 2 minutes online — select a slot, verify your phone via WhatsApp OTP, and get instant confirmation.",
  },
  {
    question: "How is a General Physician different from a specialist doctor?",
    answer:
      "A General Physician (GP) is trained to diagnose and treat a wide range of common conditions. Specialists focus on one area (e.g., Cardiologist for the heart, Dermatologist for skin). Your GP will often refer you to a specialist if needed.",
  },
  {
    question: "Are General Physicians in Panipat available on weekends?",
    answer:
      "Many General Physicians listed on DocBooking.in offer Saturday and Sunday appointments. Check individual doctor profiles for real-time slot availability and book your preferred time.",
  },
];

export default function GeneralPhysicianInPanipatPage() {
  return (
    <SpecialtyLocationPage
      specialty="General Physician"
      specialtySlug="general-physician"
      city="Panipat"
      citySlug="panipat"
      minFee={100}
      maxFee={500}
      content={{
        intro:
          "Find trusted General Physicians in Panipat. Affordable consultations from ₹100. Book your OPD appointment online instantly and skip the long waiting room queues.",
        section1Title: "Primary Care in Panipat",
        section1Body:
          "A General Physician (GP) is the backbone of primary healthcare — the doctor you turn to for fevers, infections, coughs, stomach problems, chronic condition management, and routine check-ups. In Panipat, GPs are in high demand, and OPD queues at clinics can mean waiting for 1–3 hours without any guarantee of your turn. DocBooking solves this by letting you book a specific appointment time with a verified General Physician in Panipat. You pick the slot, verify your phone, and show up at your scheduled time — no waiting, no uncertainty. Consultation fees start as low as ₹100, making quality primary care accessible for every family in Panipat.",
        section2Title: "What Does a General Physician Treat?",
        section2Body:
          "General Physicians in Panipat treat a broad spectrum of conditions: fever and viral infections, seasonal flu and cold, cough and respiratory problems, stomach infections, food poisoning, diabetes management and monitoring, hypertension (high blood pressure), thyroid disorders (initial diagnosis), minor skin and wound care, vitamin deficiencies, general fatigue and weakness, routine health check-ups, and pre-employment medical examinations. They also provide referrals to specialists when needed. With fees starting at ₹100 per consultation on DocBooking, getting timely primary care in Panipat has never been easier.",
        faq: FAQ,
      }}
    />
  );
}
