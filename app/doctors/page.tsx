import DoctorCard from "@/components/DoctorCard";
import {
  Search,
  AlertCircle,
  Heart,
  Smile,
  Stethoscope,
  Baby,
  Bone,
  Scissors,
  UserRound,
  Syringe,
  Shield,
  CheckCircle2,
} from "lucide-react";
import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";
import { doctors as staticDoctors } from "@/data/doctors";

// Specialty to icon mapping
const specialtyIconMap: Record<string, React.ReactNode> = {
  "Cardiologist": <Heart size={14} />,
  "Dentist": <Smile size={14} />,
  "General Physician": <UserRound size={14} />,
  "Gynecologist": <Syringe size={14} />,
  "Orthopedic": <Bone size={14} />,
  "Pediatrician": <Baby size={14} />,
  "Specialist/Surgeon/Best Orthopedic": <Scissors size={14} />,
  "Surgeon": <Scissors size={14} />,
};

function getSpecialtyIcon(specialty: string): React.ReactNode {
  return specialtyIconMap[specialty] || <Stethoscope size={14} />;
}

// ISR: Revalidate cached data every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find Doctors in Panipat — Book OPD Appointments | DocBooking",
  description:
    "Browse verified doctors in Panipat by specialty. Book appointments with General Physicians, Dentists, Dermatologists, Gynecologists, and Orthopedic doctors. Fees from ₹100. Instant confirmation.",
  alternates: {
    canonical: "https://docbooking.in/doctors",
  },
  openGraph: {
    title: "Find Doctors in Panipat — Book OPD Appointments | DocBooking",
    description:
      "Verified doctors in Panipat. Browse by specialty. Transparent fees. Instant online booking.",
    url: "https://docbooking.in/doctors",
    type: "website",
  },
  keywords: [
    "doctors in Panipat",
    "book doctor appointment Panipat",
    "OPD booking Panipat",
    "best doctors Panipat",
    "doctor consultation fees Panipat",
  ],
};

interface DoctorData {
  _id: string;
  name: string;
  specialty: string;
  opdFees: number;
  slots: string[];
  qualification: string;
  experience: string;
  address: string;
  phone: string;
  googleLocation: string;
}

interface DoctorsPageProps {
  searchParams: Promise<{ search?: string; specialty?: string }>;
}

export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const params = await searchParams;
  const searchTerm = params.search?.toLowerCase() || "";
  const specialtyFilter = params.specialty || "";

  let doctors: DoctorData[] = [];
  let filteredDoctors: DoctorData[] = [];
  let error: string | null = null;
  let specialties: string[] = [];

  try {
    // Connect to database
    await connectDB();

    // Fetch all doctors from database using lean() for better performance
    const allDoctors = await Doctor.find().lean().exec();

    // Convert MongoDB documents to our interface
    doctors = allDoctors.map((doc: any) => ({
      _id: doc._id.toString(),
      name: doc.name,
      specialty: doc.specialty,
      opdFees: doc.opdFees,
      slots: doc.slots || [],
      qualification: doc.qualification,
      experience: doc.experience,
      address: doc.address,
      phone: doc.phone,
      googleLocation: doc.googleLocation,
    }));

    // Apply filtering
    filteredDoctors = doctors;

    if (searchTerm) {
      filteredDoctors = filteredDoctors.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm)
      );
    }

    if (specialtyFilter) {
      filteredDoctors = filteredDoctors.filter(
        (doc) => doc.specialty === specialtyFilter
      );
    }

    // Extract unique specialties sorted alphabetically
    specialties = [...new Set(doctors.map((doc) => doc.specialty))].sort();
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Unknown error occurred";
    error = errorMessage;
  }

  // When DB has no doctors, show static sample doctors as demo cards
  const showStaticFallback = !error && doctors.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Page Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 text-sm font-medium mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Verified Doctors in Panipat
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Find Your Doctor
              </h1>
              <p className="text-blue-100 text-base md:text-lg">
                Browse verified healthcare professionals in Panipat
              </p>
            </div>
            <div className="flex gap-6 md:gap-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{doctors.length || staticDoctors.length}+</p>
                <p className="text-blue-100 text-xs mt-0.5">Doctors</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-blue-100 text-xs mt-0.5">Verified</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">₹100+</p>
                <p className="text-blue-100 text-xs mt-0.5">From</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading Doctors</h3>
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <form method="get" className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              name="search"
              defaultValue={searchTerm}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
            />
          </form>

          {/* Specialty Filter with Icons - Mobile Scrollable */}
          {specialties.length > 0 && (
            <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex gap-2 flex-wrap sm:flex-wrap">
                <a
                  href="/doctors"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    !specialtyFilter
                      ? "bg-blue-600 text-white border-blue-600 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                  }`}
                >
                  <Stethoscope size={15} />
                  All Specialties
                </a>
                {specialties.map((specialty) => (
                  <a
                    key={specialty}
                    href={`/doctors?specialty=${encodeURIComponent(specialty)}`}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                      specialtyFilter === specialty
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {getSpecialtyIcon(specialty)}
                    {specialty}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Static Fallback — shown when DB has no doctors yet */}
        {showStaticFallback && (
          <>
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 size={18} className="text-blue-600" />
              <p className="text-sm font-medium text-gray-600">
                Showing {staticDoctors.length} featured doctor{staticDoctors.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {staticDoctors.map((doc) => (
                <DoctorCard
                  key={doc.slug}
                  doctor={{
                    _id: doc.slug,
                    name: doc.name,
                    specialty: doc.specialty,
                    opdFees: doc.opdFees,
                    slots: [],
                    qualification: doc.qualification,
                    experience: doc.experience,
                    address: doc.clinicAddress,
                    phone: doc.phone,
                    googleLocation: doc.googleLocation || "",
                    slug: doc.slug,
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Doctor Grid */}
        {!error && doctors.length > 0 && (
          <>
            {filteredDoctors.length > 0 ? (
              <>
                <p className="text-gray-600 mb-6 text-sm">
                  Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {specialtyFilter && ` in ${specialtyFilter}`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard key={doctor._id} doctor={doctor} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="text-amber-600 mx-auto mb-3" size={40} />
                <h3 className="text-lg font-semibold text-amber-900 mb-2">No Results Found</h3>
                <p className="text-amber-700">
                  {searchTerm && `No doctors match "${searchTerm}"`}
                  {!searchTerm && specialtyFilter && `No doctors found in ${specialtyFilter}`}
                </p>
                <a
                  href="/doctors"
                  className="inline-block mt-4 text-amber-700 hover:text-amber-900 font-medium underline text-sm"
                >
                  Clear filters
                </a>
              </div>
            )}
          </>
        )}
      </div>

      {/* Trust Banner */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-blue-600" />
              <span>All doctors verified by DocBooking</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-blue-600" />
              <span>Transparent consultation fees</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-blue-600" />
              <span>Patient-first approach</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
