import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { SITE_URL, SPECIALTIES } from "@/lib/seo-data";
import FAQSection from "@/components/FAQSection";
import JsonLdSchema from "@/components/JsonLdSchema";
import { Metadata } from "next";

interface SpecialtyLocationPageProps {
  specialty: string;
  specialtySlug: string;
  city: string;
  citySlug: string;
  minFee: number;
  maxFee: number;
  content: {
    intro: string;
    section1Title: string;
    section1Body: string;
    section2Title: string;
    section2Body: string;
    faq: { question: string; answer: string }[];
  };
}

interface DoctorDoc {
  _id: string;
  uid?: string;
  name: string;
  specialty: string;
  opdFees: number;
  experience: string;
  address: string;
  qualification: string;
}

export async function generateSpecialtyLocationMetadata(
  specialty: string,
  city: string,
  minFee: number,
  maxFee: number,
  slug: string
): Promise<Metadata> {
  return {
    title: `${specialty} in ${city} — Book Appointment | DocBooking`,
    description: `Find verified ${specialty} doctors in ${city}. Consultation fees ₹${minFee}–₹${maxFee}. Instant online appointment booking. Verified doctors, no queues.`,
    alternates: {
      canonical: `${SITE_URL}/${slug}`,
    },
    openGraph: {
      title: `${specialty} in ${city} — Book Appointment | DocBooking`,
      description: `Find verified ${specialty} doctors in ${city}. Consultation fees ₹${minFee}–₹${maxFee}.`,
      url: `${SITE_URL}/${slug}`,
      type: "website",
    },
    keywords: [
      `${specialty.toLowerCase()} in ${city.toLowerCase()}`,
      `best ${specialty.toLowerCase()} ${city.toLowerCase()}`,
      `${specialty.toLowerCase()} near me`,
      `book ${specialty.toLowerCase()} appointment ${city.toLowerCase()}`,
      `${specialty.toLowerCase()} fees ${city.toLowerCase()}`,
    ],
  };
}

export default async function SpecialtyLocationPage({
  specialty,
  specialtySlug,
  city,
  citySlug,
  minFee,
  maxFee,
  content,
}: SpecialtyLocationPageProps) {
  let doctors: DoctorDoc[] = [];

  try {
    await connectDB();
    const raw = await Doctor.find({ specialty })
      .select("uid _id name specialty opdFees experience address qualification")
      .limit(6)
      .lean();
    doctors = raw.map((d: any) => ({
      _id: d._id.toString(),
      uid: d.uid,
      name: d.name,
      specialty: d.specialty,
      opdFees: d.opdFees,
      experience: d.experience,
      address: d.address,
      qualification: d.qualification,
    }));
  } catch {
    // Render without doctor list
  }

  const relatedSpecialties = SPECIALTIES.filter((s) => s.slug !== specialtySlug).slice(0, 4);

  return (
    <>
      <JsonLdSchema
        page="specialty"
        specialtyData={{ name: specialty, slug: specialtySlug, minFee, maxFee }}
        includeFaq={true}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-blue-200 text-sm mb-6">
              <Link href="/" className="hover:text-white">Home</Link>
              {" / "}
              <Link href="/doctors" className="hover:text-white">Doctors</Link>
              {" / "}
              <span className="text-white">{specialty} in {city}</span>
            </nav>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {specialty} in {city}
            </h1>
            <p className="text-xl text-blue-100 mb-6 max-w-2xl">
              {content.intro}
            </p>
            <div className="flex flex-wrap gap-4 items-center">
              <Link
                href={`/doctors?specialty=${encodeURIComponent(specialty)}`}
                className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition"
              >
                Book Appointment Now
              </Link>
              <span className="text-blue-200 text-sm">
                Consultation: ₹{minFee}–₹{maxFee} · Free to book
              </span>
            </div>
          </div>
        </section>

        {/* Quick facts */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Min Fee", value: `₹${minFee}` },
              { label: "Max Fee", value: `₹${maxFee}` },
              { label: "Booking", value: "Free" },
              { label: "City", value: city },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 text-center">
                <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Main content */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.section1Title}</h2>
            <p className="text-gray-600 leading-relaxed">{content.section1Body}</p>
          </div>

          {/* Doctor listing preview */}
          {doctors.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {specialty} Doctors in {city}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {doctors.map((doc) => (
                  <Link
                    key={doc._id}
                    href={`/doctor/${doc.uid || doc._id}`}
                    className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                          {doc.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">{doc.qualification}</p>
                        <p className="text-sm text-gray-500">{doc.experience} experience</p>
                      </div>
                      <span className="text-blue-700 font-bold text-sm bg-blue-50 px-3 py-1 rounded-lg">
                        ₹{doc.opdFees}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-3 truncate">{doc.address}</p>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  href={`/doctors?specialty=${encodeURIComponent(specialty)}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                  View all {specialty} doctors →
                </Link>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{content.section2Title}</h2>
            <p className="text-gray-600 leading-relaxed">{content.section2Body}</p>
          </div>

          {/* Pricing section */}
          <div className="bg-blue-50 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {specialty} Consultation Fees in {city}
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-white rounded-lg px-4 py-3">
                <span className="text-gray-700">Routine Consultation</span>
                <span className="font-semibold text-gray-900">₹{minFee}–₹{Math.round(minFee * 1.5)}</span>
              </div>
              <div className="flex justify-between items-center bg-white rounded-lg px-4 py-3">
                <span className="text-gray-700">Follow-up Visit</span>
                <span className="font-semibold text-gray-900">₹{Math.round(minFee * 0.7)}–₹{Math.round(minFee * 1.2)}</span>
              </div>
              <div className="flex justify-between items-center bg-white rounded-lg px-4 py-3">
                <span className="text-gray-700">Specialist Consultation</span>
                <span className="font-semibold text-gray-900">₹{Math.round(maxFee * 0.6)}–₹{maxFee}</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3">* Fees are indicative. Confirm with the doctor at the time of booking.</p>
          </div>

          {/* How to book */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              How to Book a {specialty} Appointment in {city}
            </h2>
            <ol className="space-y-4">
              {[
                `Visit DocBooking.in or go to /doctors?specialty=${encodeURIComponent(specialty)}`,
                `Browse verified ${specialty} doctors in ${city}`,
                "Select a doctor and choose your preferred date and time slot",
                "Enter your phone number and verify via WhatsApp OTP",
                "Receive instant booking confirmation on WhatsApp",
                "Visit the clinic at your scheduled time — no waiting in queue",
              ].map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0 font-bold">
                    {i + 1}
                  </span>
                  <span className="text-gray-600 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Related specialties */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Other Specialties in {city}</h2>
            <div className="flex flex-wrap gap-3">
              {relatedSpecialties.map((s) => (
                <Link
                  key={s.slug}
                  href={`/${s.slug}-in-${citySlug}`}
                  className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:border-blue-300 hover:text-blue-600 transition"
                >
                  {s.name} in {city}
                </Link>
              ))}
              <Link
                href="/doctors"
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:border-blue-300 hover:text-blue-600 transition"
              >
                All Doctors →
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white border-t border-gray-100">
          <FAQSection
            items={content.faq}
            title={`${specialty} in ${city} — FAQs`}
          />
        </section>
      </div>
    </>
  );
}
