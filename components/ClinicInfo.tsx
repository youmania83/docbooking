import { MapPin, Clock, IndianRupee } from "lucide-react";
import { Doctor } from "@/data/doctors";

interface ClinicInfoProps {
  doctor: Doctor;
}

export default function ClinicInfo({ doctor }: ClinicInfoProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      <h2 className="text-lg font-bold text-gray-900">Clinic Information</h2>

      {/* Clinic Address */}
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <MapPin size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{doctor.clinicName}</p>
          <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">
            {doctor.clinicAddress}
          </p>
          {doctor.googleLocation && (
            <a
              href={doctor.googleLocation}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-xs font-medium mt-1.5 inline-block hover:underline"
            >
              Get Directions →
            </a>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Consultation Fee */}
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <IndianRupee size={18} className="text-blue-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">
            Consultation Fee
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-0.5">
            ₹{doctor.opdFees}
          </p>
          <p className="text-xs text-gray-500">per visit</p>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Timings */}
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Clock size={18} className="text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
            Consultation Timings
          </p>
          <div className="space-y-2">
            {doctor.timings.map((timing, i) => (
              <div key={i} className="flex justify-between items-center text-sm gap-2">
                <span className="text-gray-600 flex-shrink-0">{timing.day}</span>
                <span
                  className={`font-medium text-right ${
                    timing.hours === "Closed"
                      ? "text-red-500"
                      : "text-gray-900"
                  }`}
                >
                  {timing.hours}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
