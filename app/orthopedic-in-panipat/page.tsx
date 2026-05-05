import { Metadata } from "next";
import SpecialtyLocationPage, {
  generateSpecialtyLocationMetadata,
} from "@/components/SpecialtyLocationPage";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return generateSpecialtyLocationMetadata(
    "Orthopedic",
    "Panipat",
    400,
    1500,
    "orthopedic-in-panipat"
  );
}

const FAQ = [
  {
    question: "What is the orthopedic doctor consultation fee in Panipat?",
    answer:
      "Orthopedic consultation fees in Panipat range from ₹400 to ₹1,500. A basic consultation for joint pain or fracture assessment costs ₹400–₹700. Advanced procedures or post-surgical consultations may cost up to ₹1,500.",
  },
  {
    question: "What conditions does an orthopedic doctor treat?",
    answer:
      "Orthopedic specialists treat bone fractures, joint pain (knee, hip, shoulder), arthritis, sports injuries, ligament tears, back pain, scoliosis, osteoporosis, carpal tunnel syndrome, and recovery after orthopedic surgeries.",
  },
  {
    question: "Can I book an orthopedic doctor appointment online in Panipat?",
    answer:
      "Yes. Visit DocBooking.in, filter by Orthopedic, choose a doctor, select your preferred slot, and verify via WhatsApp OTP. Your appointment is confirmed in under 2 minutes — no calls, no queues.",
  },
  {
    question: "When should I see an orthopedic specialist?",
    answer:
      "See an orthopedic doctor if you have persistent joint pain lasting more than a few days, difficulty moving a joint or limb, a suspected fracture or sports injury, severe back or neck pain, swelling around a bone or joint, or if you require post-surgical follow-up.",
  },
  {
    question: "Are orthopedic doctors in Panipat available for emergency consultations?",
    answer:
      "Many orthopedic doctors on DocBooking have same-day appointment slots. For genuine emergencies, please visit the nearest hospital emergency department. For urgent but non-emergency consultations, DocBooking can help you get seen within 24 hours.",
  },
];

export default function OrthopedicInPanipatPage() {
  return (
    <SpecialtyLocationPage
      specialty="Orthopedic"
      specialtySlug="orthopedic"
      city="Panipat"
      citySlug="panipat"
      minFee={400}
      maxFee={1500}
      content={{
        intro:
          "Find verified orthopedic doctors in Panipat for bone, joint, and sports injury care. Consultation fees from ₹400. Book appointments online instantly — skip OPD queues.",
        section1Title: "Bone and Joint Care in Panipat",
        section1Body:
          "Bone and joint problems — from arthritis and fractures to sports injuries and back pain — are among the most common reasons adults seek specialist care in India. Panipat has experienced orthopedic doctors who can diagnose and treat a full range of musculoskeletal conditions. Through DocBooking, patients can find verified orthopedic specialists in Panipat with full transparency on fees, experience, and clinic location. Book a specific appointment slot and skip the uncertainty of walk-in OPD visits. Whether you have a sudden sports injury, chronic knee pain, or need post-surgical follow-up, DocBooking makes it fast and simple to see the right specialist.",
        section2Title: "Orthopedic Treatments Available in Panipat",
        section2Body:
          "Orthopedic specialists in Panipat offer comprehensive bone, muscle, and joint care: fracture diagnosis and management (X-ray, casting, surgery referral), knee pain assessment and treatment, hip joint pain and arthritis management, shoulder and rotator cuff injuries, sports injury evaluation and treatment, back and spine pain management, ligament and tendon injuries, osteoporosis diagnosis and treatment, carpal tunnel and nerve compression syndromes, post-surgical rehabilitation guidance, and pediatric orthopedic consultations. Consultation fees start at ₹400 — book instantly on DocBooking without standing in hospital OPD lines.",
        faq: FAQ,
      }}
    />
  );
}
