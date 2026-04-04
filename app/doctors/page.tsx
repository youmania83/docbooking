import DoctorCard from "@/components/DoctorCard";
import { Search, AlertCircle } from "lucide-react";
import { Metadata } from "next";
import { connectDB } from "@/lib/mongodb";
import Doctor from "@/models/Doctor";

// ISR: Revalidate cached data every 60 seconds
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find Your Doctor | DocBooking",
  description: "Browse our network of verified healthcare professionals in Panipat. Search and book appointments with top doctors.",
  keywords: ["doctors", "panipat", "healthcare", "appointments", "medical"],
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
    const allDoctors = await Doctor.find()
      .lean()
      .exec();

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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Find Your Doctor
          </h1>
          <p className="text-lg text-gray-600">
            Browse our network of verified healthcare professionals in Panipat
          </p>
        </div>

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

          {/* Specialty Filter */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <a
                href="/doctors"
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  !specialtyFilter
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All Specialties
              </a>
              {specialties.map((specialty) => (
                <a
                  key={specialty}
                  href={`/doctors?specialty=${encodeURIComponent(specialty)}`}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    specialtyFilter === specialty
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {specialty}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Empty State - No Doctors */}
        {!error && doctors.length === 0 && (
          <div className="text-center py-12 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="text-blue-600 mx-auto mb-3" size={40} />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">No Doctors Available</h3>
            <p className="text-blue-700 mb-4">
              There are currently no doctors in the system.
            </p>
            <a
              href="/admin"
              className="inline-block text-blue-600 hover:text-blue-700 font-medium underline"
            >
              Add doctors from admin panel →
            </a>
          </div>
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
    </div>
  );
}
