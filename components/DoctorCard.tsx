import Link from "next/link";
import { CheckCircle2, Award, MapPin, Star } from "lucide-react";

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
  isVerified?: boolean;
  /** Optional slug — if present, links to /doctors/[slug]; otherwise /doctor/[_id] */
  slug?: string;
}

interface DoctorCardProps {
  doctor: Doctor;
}

/** Derives up to 2 initials from the doctor name (skipping "Dr.") */
function getInitials(name: string): string {
  return name
    .replace(/^Dr\.\s*/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const isVerified = doctor.isVerified !== false;
  const profileHref = doctor.slug
    ? `/doctors/${doctor.slug}`
    : `/doctor/${doctor._id}`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
      {/* Top accent */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-blue-600" />

      <div className="p-6">
        {/* Avatar + Name row */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg flex-shrink-0 border border-blue-200">
            {getInitials(doctor.name)}
          </div>

          {/* Name & meta */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-gray-900 text-base leading-snug truncate">
                {doctor.name}
              </h3>
              {isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full whitespace-nowrap flex-shrink-0 border border-blue-100">
                  <CheckCircle2 size={11} />
                  Verified
                </span>
              )}
            </div>
            <p className="text-blue-600 text-sm font-semibold mt-0.5">
              {doctor.specialty}
            </p>
            {doctor.qualification && (
              <p className="text-gray-400 text-xs mt-0.5 truncate">
                {doctor.qualification}
              </p>
            )}
          </div>
        </div>

        {/* Info pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {doctor.experience && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100">
              <Award size={12} className="text-blue-500" />
              {doctor.experience}
            </span>
          )}
          {doctor.address && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 text-gray-600 text-xs rounded-lg border border-gray-100 truncate max-w-[160px]">
              <MapPin size={12} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{doctor.address.split(",")[0]}</span>
            </span>
          )}
        </div>

        {/* Fee section */}
        <div className="bg-blue-50 rounded-xl p-3.5 mb-5 border border-blue-100 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
              OPD Fees
            </p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">
              ₹{doctor.opdFees}
              <span className="text-xs font-normal text-gray-400 ml-1.5">
                / visit
              </span>
            </p>
          </div>
          {doctor.slots && doctor.slots.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-500">Next slot</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {doctor.slots[0]}
              </p>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <Link href={profileHref}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-sm group-hover:shadow-md">
            View Profile &amp; Book →
          </button>
        </Link>
      </div>
    </div>
  );
}

