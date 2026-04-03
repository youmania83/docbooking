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
        const response = await fetch("/api/doctors");
        const data = await response.json();

        if (data.success) {
          setDoctors(data.data);
          setFilteredDoctors(data.data);

          // Extract unique specialties
          const uniqueSpecialties = [
            ...new Set(data.data.map((doc: Doctor) => doc.specialty)),
          ];
          setSpecialties(uniqueSpecialties as string[]);
        } else {
          setError(data.message || "Failed to load doctors");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An error occurred"
        );
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="text-red-600" />
            <p className="text-red-800">{error}</p>
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
        {!loading && (
          <>
            {filteredDoctors.length > 0 ? (
              <>
                <p className="text-gray-600 mb-6">
                  Showing {filteredDoctors.length} doctor
                  {filteredDoctors.length !== 1 ? "s" : ""}
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
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">No doctors found</p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
