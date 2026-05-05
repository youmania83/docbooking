import { Metadata } from "next";
import SpecialtyLocationPage, {
  generateSpecialtyLocationMetadata,
} from "@/components/SpecialtyLocationPage";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return generateSpecialtyLocationMetadata("Dentist", "Panipat", 200, 1000, "dentist-in-panipat");
}

const FAQ = [
  {
    question: "What is the consultation fee for a dentist in Panipat?",
    answer:
      "Dentist consultation fees in Panipat typically range from ₹200 to ₹1,000. A basic check-up or teeth cleaning costs ₹200–₹350, while procedures like root canals or dental crowns are priced higher. All fees are displayed upfront on DocBooking.",
  },
  {
    question: "How do I find a good dentist near me in Panipat?",
    answer:
      "Use DocBooking.in to browse verified dentists in Panipat. Each doctor profile shows qualifications, experience, clinic address, and consultation fees so you can make an informed choice without any guesswork.",
  },
  {
    question: "Can I book a same-day dentist appointment in Panipat?",
    answer:
      "Yes. Most dentists on DocBooking have same-day or next-day slots available. Select an available time, verify your phone via OTP, and your appointment is confirmed in under 2 minutes.",
  },
  {
    question: "What dental treatments are available in Panipat?",
    answer:
      "Dentists in Panipat offer a wide range of treatments including routine check-ups, fillings, extractions, root canal treatment, scaling and polishing, orthodontic braces, dental implants, and cosmetic dentistry.",
  },
  {
    question: "Is DocBooking free to use for booking dental appointments?",
    answer:
      "Yes, booking appointments on DocBooking is completely free. You only pay the dentist's consultation fee directly at the clinic after your visit.",
  },
];

export default function DentistInPanipatPage() {
  return (
    <SpecialtyLocationPage
      specialty="Dentist"
      specialtySlug="dentist"
      city="Panipat"
      citySlug="panipat"
      minFee={200}
      maxFee={1000}
      content={{
        intro:
          "Find verified dentists in Panipat with transparent consultation fees. Book OPD appointments online in under 2 minutes — no queues, no surprises.",
        section1Title: "Dental Care in Panipat",
        section1Body:
          "Panipat has a growing network of qualified dental professionals offering a full spectrum of oral healthcare services. From routine cleanings and cavity fillings to advanced procedures like root canals, orthodontic treatment, and dental implants, patients can now find and book verified dentists without long waits. DocBooking lists only verified dental professionals — each with their qualifications, experience, clinic location, and transparent OPD fees displayed before you book. This helps patients in Panipat make informed decisions and get timely dental care. Whether you need an emergency extraction or a routine check-up, same-day appointments are frequently available.",
        section2Title: "Why Book a Dentist Through DocBooking?",
        section2Body:
          "Traditional OPD visits mean arriving early and waiting for hours with no guarantee of your turn. DocBooking solves this by giving you a precise appointment slot, reducing your clinic wait to near zero. All dentists on the platform are manually verified — we check credentials, clinic addresses, and contact details before listing. The booking process takes under 2 minutes: select a doctor, choose a slot, verify your phone via WhatsApp OTP, and you are done. Appointment confirmation arrives on WhatsApp instantly. There are no platform fees for patients — you only pay the dentist's consultation fee at the clinic.",
        faq: FAQ,
      }}
    />
  );
}
