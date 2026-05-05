import { Metadata } from "next";
import SpecialtyLocationPage, {
  generateSpecialtyLocationMetadata,
} from "@/components/SpecialtyLocationPage";

export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return generateSpecialtyLocationMetadata(
    "Gynecologist",
    "Panipat",
    300,
    1200,
    "gynecologist-in-panipat"
  );
}

const FAQ = [
  {
    question: "What is the gynecologist consultation fee in Panipat?",
    answer:
      "Gynecologist fees in Panipat range from ₹300 to ₹1,200. A routine gynaecological consultation costs ₹300–₹500. Prenatal check-ups, ultrasounds, and specialized treatments may cost more depending on the procedure.",
  },
  {
    question: "What conditions does a gynecologist treat?",
    answer:
      "Gynecologists treat menstrual irregularities, PCOS, endometriosis, infections, fertility issues, prenatal and postnatal care, contraception counselling, hormonal disorders, and perform routine check-ups like Pap smears and pelvic exams.",
  },
  {
    question: "Can I book a gynecologist appointment online in Panipat?",
    answer:
      "Yes. DocBooking.in lets you book verified gynecologists in Panipat online. Select an available slot, verify your phone via WhatsApp OTP, and receive instant confirmation — all in under 2 minutes.",
  },
  {
    question: "Are female gynecologists available in Panipat?",
    answer:
      "DocBooking lists both male and female gynecologists in Panipat. You can view doctor profiles and choose based on your preference. Patient privacy and comfort are always a priority.",
  },
  {
    question: "Is it safe to book gynecology appointments online?",
    answer:
      "Yes. DocBooking uses WhatsApp OTP verification to confirm your identity. Your personal information is protected and never shared with third parties. All doctors are manually verified before listing.",
  },
];

export default function GynecologistInPanipatPage() {
  return (
    <SpecialtyLocationPage
      specialty="Gynecologist"
      specialtySlug="gynecologist"
      city="Panipat"
      citySlug="panipat"
      minFee={300}
      maxFee={1200}
      content={{
        intro:
          "Book verified gynecologists in Panipat with transparent fees from ₹300. Prenatal care, PCOS, menstrual health, and more — instant online appointment booking, no queues.",
        section1Title: "Women's Healthcare in Panipat",
        section1Body:
          "Access to quality gynaecological care is essential for every woman's health. In Panipat, DocBooking makes it easy to find and book experienced, verified gynecologists — whether you need a routine check-up, prenatal consultation, PCOS management, or specialized treatment. Each doctor profile on DocBooking shows the gynaecologist's qualifications, years of experience, clinic address, and consultation fee — all before you book. This transparency helps women in Panipat make informed healthcare decisions without the uncertainty of walk-in OPD visits. Appointments are confirmed instantly via WhatsApp, and you arrive at a specific scheduled time rather than waiting in unpredictable queues.",
        section2Title: "Gynaecology Services Available in Panipat",
        section2Body:
          "Gynecologists in Panipat on DocBooking offer comprehensive women's health services: routine gynaecological examinations and Pap smears, PCOS (Polycystic Ovary Syndrome) diagnosis and management, menstrual irregularity treatment, prenatal and antenatal care, postnatal consultations, fertility counselling, contraception advice, hormonal disorder management, vaginal infection diagnosis and treatment, endometriosis diagnosis, and menopausal health consultations. Consultation fees start at ₹300 on DocBooking, making professional women's healthcare accessible and affordable in Panipat.",
        faq: FAQ,
      }}
    />
  );
}
