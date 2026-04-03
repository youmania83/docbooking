"use client";

import DoctorCard from "@/components/DoctorCard";
import { useEffect, useState } from "react";
import { Search, AlertCircle, Loader } from "lucide-react";

interface Doctor {
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

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);

  // Fetch doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log("🔄 Fetching doctors from /api/doctors...");
        const response = await fetch("/api/doctors", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          // Add cache control for faster subsequent requests
          next: { revalidate: 60 }, // Revalidate cache every 60 seconds
        });

        console.log(`📊 API Response status: ${response.status}`);

        if (!response.ok) {
          console.error(`❌ API returned status ${response.status}`);
          throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✓ API Response:`, data);

        if (data.success && Array.isArray(data.data)) {
          console.log(`✓ Found ${data.data.length} doctors`);
          setDoctors(data.data);
          setFilteredDoctors(data.data);

          // Extract unique specialties
          const uniqueSpecialties = [
            ...new Set(data.data.map((doc: Doctor) => doc.specialty)),
          ];
          setSpecialties(uniqueSpecialties as string[]);
          console.log(`✓ Extracted specialties:`, uniqueSpecialties);
        } else {
          const errorMsg = data.message || "No doctors found or invalid response";
          console.error(`⚠️ ${errorMsg}`);
          setError(errorMsg);
        }
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "An unexpected error occurred";
        console.error(`❌ Error fetching doctors:`, err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Filter doctors based on search and specialty
  useEffect(() => {
    let filtered = doctors;

    if (searchTerm) {
      filtered = filtered.filter((doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (specialtyFilter) {
      filtered = filtered.filter((doc) => doc.specialty === specialtyFilter);
    }

    setFilteredDoctors(filtered);
  }, [searchTerm, specialtyFilter, doctors]);

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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading Doctors</h3>
                <p className="text-red-800 text-sm">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 text-red-700 hover:text-red-900 text-sm font-medium underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Specialty Filter */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSpecialtyFilter("")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  specialtyFilter === ""
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                All Specialties
              </button>
              {specialties.map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => setSpecialtyFilter(specialty)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    specialtyFilter === specialty
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {specialty}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader className="animate-spin text-blue-600" size={32} />
            <span className="ml-4 text-gray-600">Loading doctors...</span>
          </div>
        )}

        {/* Doctor Grid */}
        {!loading && !error && (
          <>
            {doctors.length === 0 ? (
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
            ) : filteredDoctors.length > 0 ? (
              <>
                <p className="text-gray-600 mb-6 text-sm">
                  Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? "s" : ""}
                  {searchTerm && ` matching "${searchTerm}"`}
                  {specialtyFilter && ` in ${specialtyFilter}`}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredDoctors.map((doctor) => (
                    <DoctorCard
                      key={doctor._id}
                      doctor={{
                        id: doctor._id,
                        name: doctor.name,
                        specialty: doctor.specialty,
                        fee: doctor.opdFees,
                        slots: doctor.slots,
                      }}
                    />
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
                  {!searchTerm && !specialtyFilter && "No doctors found"}
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSpecialtyFilter("");
                  }}
                  className="mt-4 text-amber-700 hover:text-amber-900 font-medium underline text-sm"
                >
                  Clear filters
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
