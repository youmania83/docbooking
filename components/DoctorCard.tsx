import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

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
}

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  // Check if doctor is verified (for now, we'll show it for all, can be toggled via isVerified prop)
  const isVerified = doctor.isVerified !== false; // Default to true

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        {/* Doctor Name with Verified Badge */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-18 font-bold text-gray-900 leading-tight flex-1">
            {doctor.name}
          </h3>
          {isVerified && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-700 text-11 font-semibold rounded whitespace-nowrap flex-shrink-0">
              <CheckCircle2 size={14} className="flex-shrink-0" />
              Verified
            </span>
          )}
        </div>

        {/* Specialty */}
        <p className="text-sm text-blue-600 font-semibold mb-2">
          {doctor.specialty}
        </p>

        {/* Experience */}
        <p className="text-xs text-gray-600 mb-4">
          {doctor.experience}
        </p>

        {/* Fees Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
          <p className="text-11 text-gray-600 font-semibold uppercase tracking-wide mb-1">
            OPD Fees
          </p>
          <p className="text-22 font-bold text-gray-900">
            ₹{doctor.opdFees}
            <span className="text-xs font-normal text-gray-500 ml-2">
              per visit
            </span>
          </p>
        </div>

        {/* CTA Button */}
        <Link href={`/doctor/${doctor._id}`}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-base">
            View & Book →
          </button>
        </Link>
      </div>
    </div>
  );
}
