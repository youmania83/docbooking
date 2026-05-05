import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { SITE_URL } from "@/lib/seo-data";
import JsonLdSchema from "@/components/JsonLdSchema";

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;

  try {
    await connectDB();
    const doctor = await Doctor.findOne({
      $or: [
        { uid: id },
        ...(id.length === 24 ? [{ _id: id }] : []),
      ],
    })
      .select("name specialty opdFees experience address qualification")
      .lean() as any;

    if (!doctor) {
      return { title: "Doctor Not Found | DocBooking" };
    }

    const city = doctor.address?.split(",").pop()?.trim() || "Panipat";
    const title = `${doctor.name} — ${doctor.specialty} in ${city} | DocBooking`;
    const description = `Book an appointment with ${doctor.name}, ${doctor.specialty} in ${city}. ${doctor.experience} experience. Consultation fee: ₹${doctor.opdFees}. ${doctor.qualification}.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${SITE_URL}/doctor/${id}`,
      },
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/doctor/${id}`,
        type: "profile",
      },
      keywords: [
        `${doctor.name}`,
        `${doctor.specialty} in ${city}`,
        `book ${doctor.specialty.toLowerCase()} ${city.toLowerCase()}`,
        `${doctor.specialty.toLowerCase()} doctor ${city.toLowerCase()}`,
      ],
    };
  } catch {
    return { title: "Doctor | DocBooking" };
  }
}

export default async function DoctorLayout({ params, children }: Props) {
  const { id } = await params;

  let doctorData = null;
  try {
    await connectDB();
    const doctor = await Doctor.findOne({
      $or: [
        { uid: id },
        ...(id.length === 24 ? [{ _id: id }] : []),
      ],
    })
      .select("name specialty opdFees address uid")
      .lean() as any;

    if (doctor) {
      doctorData = {
        name: doctor.name,
        specialty: doctor.specialty,
        opdFees: doctor.opdFees,
        address: doctor.address,
        uid: doctor.uid || id,
      };
    }
  } catch {
    // Render without schema
  }

  return (
    <>
      {doctorData && (
        <JsonLdSchema page="doctor" doctorData={doctorData} />
      )}
      {children}
    </>
  );
}
