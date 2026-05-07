import { Star, Award, MapPin, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { Doctor } from "@/data/doctors";

interface DoctorHeaderProps {
  doctor: Doctor;
}

/** Derives up to 2 initials from the doctor's name (excluding "Dr.") */
function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function DoctorHeader({ doctor }: DoctorHeaderProps) {
  const initials = getInitials(doctor.name);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Gradient banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-24 md:h-32" />

      <div className="px-5 sm:px-8 pb-6 -mt-12 md:-mt-16">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          {/* Avatar */}
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-blue-100 flex-shrink-0">
            {/* Initials — always visible as background behind the photo */}
            <div
              aria-hidden="true"
              className="absolute inset-0 z-0 flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-2xl select-none"
            >
              {initials}
            </div>
            <Image
              src={doctor.image}
              alt={doctor.name}
              fill
              sizes="(max-width: 768px) 96px, 128px"
              className="object-cover z-10"
              priority
            />
          </div>

          {/* Doctor info */}
          <div className="flex-1 pb-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {doctor.name}
                  </h1>
                  <CheckCircle2
                    className="text-blue-600 flex-shrink-0"
                    size={22}
                    aria-label="Verified doctor"
                  />
                </div>
                <p className="text-blue-600 font-semibold text-base mt-0.5">
                  {doctor.specialty}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">
                  {doctor.qualification}
                </p>
              </div>

              {/* Availability pill */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold flex-shrink-0 ${
                  doctor.isAvailable
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    doctor.isAvailable
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-gray-400"
                  }`}
                />
                {doctor.isAvailable ? "Available Today" : "Not Available"}
              </span>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3">
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Award size={15} className="text-blue-500" />
                <span>{doctor.experience}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <MapPin size={15} className="text-blue-500" />
                <span>{doctor.city}</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <Star size={15} className="text-amber-500 fill-amber-500" />
                <span className="font-semibold text-gray-800">
                  {doctor.rating}
                </span>
                <span className="text-gray-400">rating</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-800">
                  {doctor.patientsSeen.toLocaleString()}+
                </span>{" "}
                <span className="text-gray-400">patients</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
