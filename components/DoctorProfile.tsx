import { Shield, Star, CheckCircle2 } from "lucide-react";
import { Doctor } from "@/data/doctors";
import ActionButtons from "./ActionButtons";
import ClinicInfo from "./ClinicInfo";
import DoctorHeader from "./DoctorHeader";

interface DoctorProfileProps {
  doctor: Doctor;
}

export default function DoctorProfile({ doctor }: DoctorProfileProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Navigation */}
        <a
          href="/doctors"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium mb-6 transition-colors"
        >
          ← Back to Doctors
        </a>

        {/* Doctor Header Card */}
        <DoctorHeader doctor={doctor} />

        {/* Main content grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ─── LEFT / MAIN COLUMN ─── */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-3">
                About {doctor.name}
              </h2>
              <p className="text-gray-600 leading-relaxed">{doctor.about}</p>
            </div>

            {/* Services */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Services Offered
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {doctor.services.map((service, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 bg-blue-50 rounded-xl border border-blue-100"
                  >
                    <CheckCircle2
                      size={15}
                      className="text-blue-600 flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-gray-800">
                      {service}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
              <h2 className="text-lg font-bold mb-5">
                Why Patients Trust {doctor.name}
              </h2>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {doctor.patientsSeen.toLocaleString()}+
                  </p>
                  <p className="text-blue-100 text-xs mt-1">Patients Treated</p>
                </div>
                <div className="text-center border-x border-blue-500">
                  <p className="text-3xl font-bold">{doctor.rating}</p>
                  <p className="text-blue-100 text-xs mt-1">Patient Rating</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold">
                    {doctor.experience.replace("+ Years Experience", "+")}
                  </p>
                  <p className="text-blue-100 text-xs mt-1">Years Exp.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 bg-white/10 rounded-xl p-3">
                <Shield size={18} className="text-blue-200 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-100 leading-relaxed">
                  Verified by DocBooking.in — trusted platform for doctor
                  appointments in Panipat
                </p>
              </div>
            </div>

            {/* Book CTA — desktop inline (hidden on lg where sticky card shows) */}
            <div className="block lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">
                Book an Appointment
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Connect via WhatsApp for instant booking confirmation
              </p>
              <ActionButtons phone={doctor.phone} doctorName={doctor.name} />
            </div>
          </div>

          {/* ─── RIGHT / SIDEBAR ─── */}
          <div className="space-y-6">
            {/* Clinic Info */}
            <ClinicInfo doctor={doctor} />

            {/* Floating booking card — sticky on desktop */}
            <div className="hidden lg:block bg-white rounded-2xl border-2 border-blue-100 shadow-md p-6 sticky top-24 space-y-4">
              <div className="text-center pb-4 border-b border-gray-100">
                <p className="text-3xl font-bold text-gray-900">
                  ₹{doctor.opdFees}
                </p>
                <p className="text-sm text-gray-500 mt-0.5">Consultation Fee</p>
              </div>
              <ActionButtons phone={doctor.phone} doctorName={doctor.name} />
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                <Star size={11} className="text-amber-500 fill-amber-500" />
                <span>
                  {doctor.rating} · {doctor.patientsSeen.toLocaleString()}+
                  patients
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer so sticky mobile CTA doesn't overlap last content */}
        <div className="h-28 md:h-0" />
      </div>

      {/* Mobile Sticky CTA Bar */}
      <ActionButtons
        phone={doctor.phone}
        doctorName={doctor.name}
        variant="sticky"
      />
    </div>
  );
}
