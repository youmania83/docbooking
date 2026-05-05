import { Metadata } from "next";
import SpecialtyLocationPage, {
  generateSpecialtyLocationMetadata,
} from "@/components/SpecialtyLocationPage";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return generateSpecialtyLocationMetadata(
    "Dermatologist",
    "Panipat",
    300,
    1500,
    "dermatologist-in-panipat"
  );
}

const FAQ = [
  {
    question: "What is the consultation fee for a dermatologist in Panipat?",
    answer:
      "Dermatologist consultation fees in Panipat range from ₹300 to ₹1,500. A routine skin consultation typically costs ₹300–₹600. Advanced procedures like chemical peels, laser treatments, or hair loss treatment cost more. Exact fees are listed on each doctor's profile on DocBooking.",
  },
  {
    question: "What skin conditions do dermatologists in Panipat treat?",
    answer:
      "Dermatologists in Panipat treat acne, eczema, psoriasis, fungal infections, melasma, vitiligo, hair fall, dandruff, allergies, warts, and skin infections. They also provide cosmetic treatments like chemical peels, microdermabrasion, and anti-aging consultations.",
  },
  {
    question: "Can I see a dermatologist the same day in Panipat?",
    answer:
      "Yes, DocBooking frequently has same-day and next-day dermatology slots available in Panipat. Book online in under 2 minutes by selecting an available slot and verifying your phone number via WhatsApp OTP.",
  },
  {
    question: "How do I find the best skin doctor in Panipat?",
    answer:
      "Visit DocBooking.in and filter by Dermatologist. Each doctor profile shows their full qualifications, years of experience, clinic address, and consultation fee — helping you pick the right specialist with confidence.",
  },
  {
    question: "Is online booking available for dermatology appointments in Panipat?",
    answer:
      "Yes. DocBooking.in offers online appointment booking for dermatologists in Panipat. The process is free for patients, takes under 2 minutes, and includes instant WhatsApp confirmation.",
  },
];

export default function DermatologistInPanipatPage() {
  return (
    <SpecialtyLocationPage
      specialty="Dermatologist"
      specialtySlug="dermatologist"
      city="Panipat"
      citySlug="panipat"
      minFee={300}
      maxFee={1500}
      content={{
        intro:
          "Book verified dermatologists in Panipat with upfront consultation fees. Treat acne, eczema, hair loss, and skin allergies — skip OPD queues with instant online booking.",
        section1Title: "Skin and Hair Care in Panipat",
        section1Body:
          "Skin problems are among the most common reasons people visit doctors in India — acne, eczema, fungal infections, hair fall, and allergic reactions affect millions. Panipat now has qualified dermatologists who can diagnose and treat a wide range of skin, hair, and nail conditions. Through DocBooking, patients can find verified skin specialists in Panipat, view their consultation fees upfront, and book a specific appointment slot — without calling the clinic repeatedly or waiting in unpredictable OPD queues. Whether you need urgent treatment for a skin allergy or a longer consultation for chronic eczema or hair loss, DocBooking has you covered with clear availability and instant booking.",
        section2Title: "Dermatology Treatments Available in Panipat",
        section2Body:
          "Dermatologists in Panipat offer complete skin and hair care including acne treatment (topical prescriptions, oral antibiotics, or advanced procedures), eczema and psoriasis management, pigmentation and melasma treatment, hair fall diagnosis and PRP therapy, wart/mole removal, cosmetic consultations (anti-aging, chemical peels), fungal infection treatment, and allergy testing. Consultation fees range from ₹300 for a basic check-up to ₹1,500 for specialist procedures. All doctors listed on DocBooking have been verified for credentials and clinic location before being listed.",
        faq: FAQ,
      }}
    />
  );
}
