"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Award, Loader, AlertCircle } from "lucide-react";
import PatientDetailsForm, { PatientDetails } from "@/components/PatientDetailsForm";
import BookingConfirmationModal from "@/components/BookingConfirmationModal";
import EmailOtpVerification from "@/components/EmailOtpVerification";

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  opdFees: number;
  slots: string[];
  experience: string;
  address: string;
  phone: string;
  googleLocation: string;
  qualification: string;
}

export default function DoctorDetailPage() {
  const params = useParams();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookingStep, setBookingStep] = useState<"slot-selection" | "otp-verification" | "patient-details">("slot-selection");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);

  // Fetch doctor data from API
  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/doctors?id=${params.id}`);
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          setDoctor(data.data[0]);
        } else {
          setError("Doctor not found");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load doctor");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader className="animate-spin text-blue-600" size={32} />
          <span className="text-gray-600">Loading doctor information...</span>
        </div>
      </div>
    );
  }

  if (!doctor || error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Doctor not found"}
            </h1>
            <Link href="/doctors">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg">
                Back to Doctors
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleConfirmBooking = () => {
    if (selectedSlot) {
      setBookingStep("otp-verification");
    }
  };

  const handleOtpVerified = (email: string) => {
    setVerifiedEmail(email);
    setBookingStep("patient-details");
  };

  const handlePatientDetailsSubmit = (details: PatientDetails) => {
    setPatientDetails(details);
    setShowConfirmation(true);
  };

  const handleNewBooking = () => {
    setSelectedSlot(null);
    setBookingStep("slot-selection");
    setPatientDetails(null);
    setShowConfirmation(false);
    setVerifiedEmail(null);
  };

  const handleEditDetails = () => {
    setShowConfirmation(false);
    setBookingStep("patient-details");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/doctors">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors">
            <ArrowLeft size={20} />
            Back to Doctors
          </button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Doctor Info Card */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 sticky top-24">
              <div className="mb-6 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {doctor.name.charAt(0)}
                  </span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                {doctor.name}
              </h1>
              <p className="text-blue-600 font-semibold text-center mb-6">
                {doctor.specialty}
              </p>

              <div className="space-y-4 mb-6 border-b border-gray-200 pb-6">
                <div className="flex items-center gap-3">
                  <Award size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">
                      Experience
                    </p>
                    <p className="text-gray-900 font-semibold">{doctor.experience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Qualification</p>
                    <p className="text-gray-900 font-semibold text-sm">{doctor.qualification}</p>
                  </div>
                </div>
              </div>

              <p className="text-3xl font-bold text-gray-900 text-center mb-2">
                ₹{doctor.opdFees}
              </p>
              <p className="text-sm text-gray-500 text-center">per consultation</p>
              
              {/* Details */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Address</p>
                  <p className="text-sm text-gray-700">{doctor.address}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase mb-1">Phone</p>
                  <p className="text-sm text-gray-700">{doctor.phone}</p>
                </div>
                <a
                  href={doctor.googleLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition"
                >
                  View on Map
                </a>
              </div>
            </div>
          </div>

          {/* Booking Section */}
          <div className="md:col-span-2">
            {bookingStep === "slot-selection" ? (
              // Slot Selection Step
              <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Calendar size={24} className="text-blue-600" />
                    Select Time Slot
                  </h2>
                  <p className="text-gray-600">
                    Choose your preferred appointment time
                  </p>
                </div>

                {/* Time Slots Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                  {doctor.slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-4 px-4 rounded-xl font-semibold transition-all duration-200 border-2 ${
                        selectedSlot === slot
                          ? "bg-blue-600 text-white border-blue-600 shadow-lg scale-105"
                          : "bg-white text-gray-900 border-gray-200 hover:border-blue-600 hover:shadow-md"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                {/* Selected Slot Display */}
                {selectedSlot && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                    <p className="text-gray-700 mb-2">
                      <span className="font-semibold">Selected Slot:</span>
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {selectedSlot}
                    </p>
                  </div>
                )}

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Booking Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Doctor</span>
                      <span className="font-semibold text-gray-900">
                        {doctor.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialty</span>
                      <span className="font-semibold text-gray-900">
                        {doctor.specialty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Slot</span>
                      <span className="font-semibold text-gray-900">
                        {selectedSlot || "Not selected"}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="text-gray-900 font-semibold">Fee</span>
                      <span className="text-xl font-bold text-blue-600">
                        ₹{doctor.opdFees}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirm Booking Button */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={!selectedSlot}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    selectedSlot
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl cursor-pointer"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {selectedSlot ? "Confirm Booking" : "Select a Time Slot"}
                </button>

                {/* Footer Note */}
                <p className="text-xs text-gray-500 text-center mt-6">
                  You will verify your email address in the next step
                </p>
              </div>
            ) : bookingStep === "otp-verification" ? (
              // OTP Verification Step
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => setBookingStep("slot-selection")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Change Slot
                  </button>
                </div>

                {/* Current Selection Display */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Current Selection
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Doctor</p>
                      <p className="text-gray-900 font-semibold">{doctor.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Time Slot</p>
                      <p className="text-blue-600 font-bold text-lg">{selectedSlot}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Specialty</p>
                      <p className="text-gray-900 font-semibold">{doctor.specialty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Fee</p>
                      <p className="text-blue-600 font-bold">₹{doctor.opdFees}</p>
                    </div>
                  </div>
                </div>

                <EmailOtpVerification
                  onVerified={handleOtpVerified}
                />
              </div>
            ) : (
              // Patient Details Step
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => setBookingStep("slot-selection")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Change Slot
                  </button>
                </div>
                
                {/* Current Selection Display */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-8">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Current Selection
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Doctor</p>
                      <p className="text-gray-900 font-semibold">{doctor.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Time Slot</p>
                      <p className="text-blue-600 font-bold text-lg">{selectedSlot}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Specialty</p>
                      <p className="text-gray-900 font-semibold">{doctor.specialty}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Fee</p>
                      <p className="text-blue-600 font-bold">₹{doctor.opdFees}</p>
                    </div>
                  </div>
                </div>

                {/* Email Verified Display */}
                {verifiedEmail && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                    <p className="text-green-700 font-semibold">✅ Email Verified</p>
                    <p className="text-green-600 text-sm">{verifiedEmail}</p>
                  </div>
                )}

                <PatientDetailsForm onSubmit={handlePatientDetailsSubmit} />
              </div>
            )}
          </div>
        </div>

        {/* Booking Confirmation Modal */}
        {doctor && selectedSlot && patientDetails && (
          <BookingConfirmationModal
            isOpen={showConfirmation}
            doctor={doctor}
            slot={selectedSlot}
            patientDetails={patientDetails}
            onClose={handleNewBooking}
            onNewBooking={handleNewBooking}
            onEdit={handleEditDetails}
          />
        )}
      </div>
    </div>
  );
}
