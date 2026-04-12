"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Award, Loader, AlertCircle } from "lucide-react";
import PatientDetailsForm, { PatientDetails } from "@/components/PatientDetailsForm";
import BookingConfirmationModal from "@/components/BookingConfirmationModal";
import OTPVerificationWhatsApp from "@/components/OTPVerificationWhatsApp";
import AppointmentDateTimeSelector from "@/components/AppointmentDateTimeSelector";
import StickyAppointmentCTA from "@/components/StickyAppointmentCTA";

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
  
  // Appointment date and time states
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Booking flow states
  const [bookingStep, setBookingStep] = useState<"appointment-selection" | "otp-verification" | "patient-details">("appointment-selection");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);

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

  const handleAppointmentChange = (date: Date | null, time: string | null) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  const handleConfirmBooking = () => {
    if (selectedDate && selectedTime) {
      setBookingStep("otp-verification");
    }
  };

  const handleOtpVerified = (phone: string) => {
    setVerifiedPhone(phone);
    setBookingStep("patient-details");
  };

  const handlePatientDetailsSubmit = (details: PatientDetails) => {
    setPatientDetails(details);
    setShowConfirmation(true);
  };

  const handleNewBooking = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setBookingStep("appointment-selection");
    setPatientDetails(null);
    setShowConfirmation(false);
    setVerifiedPhone(null);
  };

  const handleEditDetails = () => {
    setShowConfirmation(false);
    setBookingStep("patient-details");
  };

  // Format selected date for display
  const formattedDate = selectedDate 
    ? new Date(selectedDate).toLocaleDateString('en-IN', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      })
    : "Not selected";

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/doctors">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-8 transition-colors">
            <ArrowLeft size={20} />
            Back to Doctors
          </button>
        </Link>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Doctor Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sticky top-24">
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
          <div className="lg:col-span-3 pb-32 lg:pb-0">
            {bookingStep === "appointment-selection" ? (
              // Appointment Date and Time Selection
              <div>
                <AppointmentDateTimeSelector
                  onSelectionChange={handleAppointmentChange}
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  availableSlots={doctor.slots}
                  minDaysFromNow={0}
                  maxDaysFromNow={30}
                  isLoadingSlots={false}
                />

                {/* Booking Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mt-8 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                    Booking Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Doctor</span>
                      <span className="font-semibold text-gray-900">
                        {doctor.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Specialty</span>
                      <span className="font-semibold text-gray-900">
                        {doctor.specialty}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Appointment Date</span>
                      <span className="font-semibold text-gray-900">
                        {formattedDate}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Appointment Time</span>
                      <span className="font-semibold text-blue-600">
                        {selectedTime || "Not selected"}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex justify-between items-center">
                      <span className="text-gray-900 font-semibold">Fee</span>
                      <span className="text-2xl font-bold text-blue-600">
                        ₹{doctor.opdFees}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleConfirmBooking}
                  disabled={!selectedDate || !selectedTime}
                  className={`w-full mt-8 py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
                    selectedDate && selectedTime
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl active:bg-blue-800"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {selectedDate && selectedTime ? "Proceed to Booking →" : "Select Date & Time"}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  Proceed to verify your phone number and enter patient details
                </p>
              </div>
            ) : bookingStep === "otp-verification" ? (
              // OTP Verification Step
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => setBookingStep("appointment-selection")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Change Appointment
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
                      <p className="text-xs text-gray-600 uppercase">Date</p>
                      <p className="text-blue-600 font-bold text-lg">{formattedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Time</p>
                      <p className="text-blue-600 font-bold">{selectedTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Fee</p>
                      <p className="text-blue-600 font-bold">₹{doctor.opdFees}</p>
                    </div>
                  </div>
                </div>

                <OTPVerificationWhatsApp onVerified={handleOtpVerified} />
              </div>
            ) : (
              // Patient Details Step
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => setBookingStep("appointment-selection")}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                  >
                    <ArrowLeft size={20} />
                    Change Appointment
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
                      <p className="text-xs text-gray-600 uppercase">Date</p>
                      <p className="text-blue-600 font-bold text-lg">{formattedDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Time</p>
                      <p className="text-blue-600 font-bold">{selectedTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 uppercase">Fee</p>
                      <p className="text-blue-600 font-bold">₹{doctor.opdFees}</p>
                    </div>
                  </div>
                </div>

                {/* Phone Verified Display */}
                {verifiedPhone && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
                    <p className="text-green-700 font-semibold">✅ Phone Verified</p>
                    <p className="text-green-600 text-sm">{verifiedPhone}</p>
                  </div>
                )}

                <PatientDetailsForm onSubmit={handlePatientDetailsSubmit} />
              </div>
            )}
          </div>
        </div>

        {/* Booking Confirmation Modal */}
        {doctor && selectedDate && selectedTime && patientDetails && (
          <BookingConfirmationModal
            isOpen={showConfirmation}
            doctor={doctor}
            slot={selectedTime}
            appointmentDate={selectedDate}
            patientDetails={patientDetails}
            onClose={handleNewBooking}
            onNewBooking={handleNewBooking}
            onEdit={handleEditDetails}
            verifiedPhone={verifiedPhone}
          />
        )}

        {/* Sticky CTA Bar - Only visible on mobile/tablet for appointment-selection step */}
        {bookingStep === "appointment-selection" && (
          <div className="lg:hidden">
            <StickyAppointmentCTA
              doctorName={doctor.name}
              opdFees={doctor.opdFees}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              onProceed={handleConfirmBooking}
            />
          </div>
        )}
      </div>
    </div>
  );
}
