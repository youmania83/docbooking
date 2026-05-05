export const SITE_URL = "https://docbooking.in";

export const LOCATIONS = [
  { city: "Panipat", state: "Haryana", slug: "panipat" },
  { city: "Delhi NCR", state: "Delhi", slug: "delhi-ncr" },
];

export const SPECIALTIES = [
  {
    name: "Dentist",
    slug: "dentist",
    minFee: 200,
    maxFee: 1000,
    description:
      "Dental care including teeth cleaning, fillings, extractions, and cosmetic dentistry.",
  },
  {
    name: "General Physician",
    slug: "general-physician",
    minFee: 100,
    maxFee: 500,
    description:
      "Primary care for fevers, infections, chronic illnesses, and general health check-ups.",
  },
  {
    name: "Dermatologist",
    slug: "dermatologist",
    minFee: 300,
    maxFee: 1500,
    description:
      "Skin, hair, and nail treatments including acne, eczema, and skin allergy management.",
  },
  {
    name: "Gynecologist",
    slug: "gynecologist",
    minFee: 300,
    maxFee: 1200,
    description:
      "Women's health including prenatal care, fertility, and routine gynaecological check-ups.",
  },
  {
    name: "Orthopedic",
    slug: "orthopedic",
    minFee: 400,
    maxFee: 1500,
    description:
      "Bone, joint, and muscle care including fractures, arthritis, and sports injuries.",
  },
  {
    name: "Cardiologist",
    slug: "cardiologist",
    minFee: 500,
    maxFee: 2000,
    description:
      "Heart and cardiovascular care including ECG, cholesterol management, and heart disease prevention.",
  },
];

export const HOMEPAGE_FAQ = [
  {
    question: "How do I book a doctor appointment on DocBooking?",
    answer:
      "Search for a doctor by specialty or name on DocBooking.in, select an available slot, verify your phone number via OTP, and your appointment is confirmed instantly. The entire process takes under 2 minutes.",
  },
  {
    question: "What are doctor consultation fees in Panipat?",
    answer:
      "Consultation fees in Panipat range from ₹100 for General Physicians to ₹2,000 for specialists like Cardiologists. Dentists typically charge ₹200–₹1,000 and Dermatologists charge ₹300–₹1,500.",
  },
  {
    question: "Is DocBooking free for patients?",
    answer:
      "Yes, booking appointments on DocBooking is completely free for patients. You only pay the doctor's consultation fee at the clinic.",
  },
  {
    question: "Which cities does DocBooking serve?",
    answer:
      "DocBooking currently serves patients in Panipat, Haryana and is expanding to Delhi NCR. We are adding more cities across North India throughout 2026.",
  },
  {
    question: "Are the doctors on DocBooking verified?",
    answer:
      "Yes, all doctors listed on DocBooking are verified medical professionals with valid registrations. We manually verify each doctor's credentials, clinic address, and contact information before listing.",
  },
  {
    question: "What is the best dentist consultation fee in Panipat?",
    answer:
      "Dentist consultation fees in Panipat range from ₹200 to ₹1,000 depending on the procedure. A routine dental check-up typically costs ₹200–₹350, while specialist treatments like root canals are higher.",
  },
  {
    question: "Can I cancel or reschedule a booked appointment?",
    answer:
      "Appointment modifications must be done directly by contacting the clinic. We recommend calling the doctor's clinic at least 2 hours before your scheduled appointment time.",
  },
  {
    question: "How long does it take to get a doctor appointment in Panipat?",
    answer:
      "With DocBooking, you can book a same-day appointment in under 2 minutes. Most doctors on our platform have slots available within 24 hours.",
  },
  {
    question: "What specialties are available on DocBooking?",
    answer:
      "DocBooking offers appointments with General Physicians, Dentists, Dermatologists, Gynecologists, Orthopedic specialists, Cardiologists, Surgeons, and Pediatricians in Panipat.",
  },
  {
    question: "Do I need to create an account to book a doctor appointment?",
    answer:
      "No account creation is required. Simply enter your phone number, verify via OTP, and book your appointment in seconds. Your booking confirmation is sent via WhatsApp.",
  },
];

export const SPECIALTY_LOCATION_PAGES = [
  {
    specialty: "Dentist",
    specialtySlug: "dentist",
    city: "Panipat",
    citySlug: "panipat",
    route: "dentist-in-panipat",
    minFee: 200,
    maxFee: 1000,
  },
  {
    specialty: "Dermatologist",
    specialtySlug: "dermatologist",
    city: "Panipat",
    citySlug: "panipat",
    route: "dermatologist-in-panipat",
    minFee: 300,
    maxFee: 1500,
  },
  {
    specialty: "General Physician",
    specialtySlug: "general-physician",
    city: "Panipat",
    citySlug: "panipat",
    route: "general-physician-in-panipat",
    minFee: 100,
    maxFee: 500,
  },
  {
    specialty: "Gynecologist",
    specialtySlug: "gynecologist",
    city: "Panipat",
    citySlug: "panipat",
    route: "gynecologist-in-panipat",
    minFee: 300,
    maxFee: 1200,
  },
  {
    specialty: "Orthopedic",
    specialtySlug: "orthopedic",
    city: "Panipat",
    citySlug: "panipat",
    route: "orthopedic-in-panipat",
    minFee: 400,
    maxFee: 1500,
  },
];
