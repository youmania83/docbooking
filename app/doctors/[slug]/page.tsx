import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDoctorBySlug, doctors } from "@/data/doctors";
import DoctorProfile from "@/components/DoctorProfile";

interface Props {
  params: Promise<{ slug: string }>;
}

/** Pre-build all static doctor profile pages at build time */
export function generateStaticParams() {
  return doctors.map((doctor) => ({ slug: doctor.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const doctor = getDoctorBySlug(slug);

  if (!doctor) {
    return { title: "Doctor Not Found | DocBooking.in" };
  }

  return {
    title: `${doctor.name} — ${doctor.specialty} in ${doctor.city} | DocBooking.in`,
    description: `Book appointment with ${doctor.name}, ${doctor.specialty} in ${doctor.city}. ${doctor.experience}. Consultation fee ₹${doctor.opdFees}. Book online via DocBooking.in.`,
    alternates: {
      canonical: `https://docbooking.in/doctors/${slug}`,
    },
    openGraph: {
      title: `${doctor.name} — ${doctor.specialty} in ${doctor.city} | DocBooking.in`,
      description: `Book appointment with ${doctor.name}. ${doctor.experience}. Consultation fee ₹${doctor.opdFees}.`,
      url: `https://docbooking.in/doctors/${slug}`,
      type: "website",
    },
    keywords: [
      `${doctor.name}`,
      `${doctor.specialty} in ${doctor.city}`,
      `best ${doctor.specialty.toLowerCase()} ${doctor.city}`,
      `book ${doctor.specialty.toLowerCase()} appointment ${doctor.city}`,
      `${doctor.clinicName}`,
    ],
  };
}

export default async function DoctorSlugPage({ params }: Props) {
  const { slug } = await params;
  const doctor = getDoctorBySlug(slug);

  if (!doctor) {
    notFound();
  }

  return <DoctorProfile doctor={doctor} />;
}
