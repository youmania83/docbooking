"use client";

import { Check, Phone, User, Calendar, Stethoscope, X, Loader, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { PatientDetails } from "./PatientDetailsForm";

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

interface BookingConfirmationModalProps {
  isOpen: boolean;
  doctor: Doctor;
  slot: string;
  appointmentDate?: Date | null;
  patientDetails: PatientDetails;
  onClose: () => void;
  onNewBooking: () => void;
  onEdit?: () => void;
  onBookingCreated?: (bookingId: string) => void;
  existingBookingId?: string | null;
  verifiedPhone?: string | null;
}

export default function BookingConfirmationModal({
  isOpen,
  doctor,
  slot,
  appointmentDate,
  patientDetails,
  onClose,
  onNewBooking,
  onEdit,
  onBookingCreated,
  existingBookingId,
  verifiedPhone,
}: BookingConfirmationModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(existingBookingId || null);
  const [bookingConfirmed, setBookingConfirmed] = useState(!!existingBookingId);

  useEffect(() => {
    if (isOpen && !bookingConfirmed && !loading && !bookingId) {
      createBooking();
    }
  }, [isOpen, bookingConfirmed, loading, bookingId]);

  const createBooking = async () => {
    if (bookingConfirmed || bookingId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientName: patientDetails.name,
          age: patientDetails.age,
          gender: patientDetails.gender,
          phone: verifiedPhone || patientDetails.mobileNumber,
          doctorId: doctor._id,
          appointmentDate: appointmentDate || new Date(),
          appointmentTime: slot,
          slot: slot, // Legacy support
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingId(data.data._id);
        setBookingConfirmed(true);
        onBookingCreated?.(data.data._id);
      } else {
        setError(data.message || "Failed to create booking");
      }
    } catch (err) {
      setError("An error occurred while creating your booking. Please try again.");
      console.error("Booking error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <div className="p-8 flex flex-col items-center gap-4">
            <Loader className="animate-spin text-blue-600" size={40} />
            <p className="text-gray-600 text-center">Creating your booking...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !bookingId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors z-10"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          <div className="bg-red-50 px-6 py-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle size={32} className="text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Booking Failed</h2>
            <p className="text-red-800 text-sm mb-6">{error}</p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setError(null);
                  createBooking();
                }}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Retry
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (bookingConfirmed && bookingId) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] overflow-hidden animate-in relative flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors z-10"
            aria-label="Close"
          >
            <X size={24} />
          </button>

          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-6 text-center flex-shrink-0">
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-full p-3">
                <Check size={32} className="text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Booking Confirmed!
            </h2>
            <p className="text-green-100 text-sm">
              Your appointment has been successfully scheduled
            </p>
          </div>

          {/* Booking Details */}
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {/* Booking Reference */}
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                Booking Reference ID
              </p>
              <p className="text-lg font-bold text-blue-600 break-all">{bookingId}</p>
            </div>

            {/* Patient Information */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                Patient Information
              </h3>
              <div className="space-y-2 ml-7">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Name</p>
                  <p className="text-gray-900 font-medium">{patientDetails.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Age</p>
                    <p className="text-gray-900 font-medium">{patientDetails.age}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Gender</p>
                    <p className="text-gray-900 font-medium">{patientDetails.gender}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase flex items-center gap-1">
                    <Phone size={12} /> Mobile
                  </p>
                  <p className="text-gray-900 font-medium">+91 {patientDetails.mobileNumber}</p>
                </div>
              </div>
            </div>

            {/* Appointment Details */}
            <div className="space-y-2 pt-3 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                <Calendar size={18} className="text-blue-600" />
                Appointment Details
              </h3>
              <div className="space-y-2 ml-7">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Doctor</p>
                  <p className="text-gray-900 font-medium flex items-center gap-2">
                    <Stethoscope size={16} className="text-blue-600" />
                    {doctor.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Specialty</p>
                  <p className="text-gray-900 font-medium">{doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Time Slot</p>
                  <p className="text-gray-900 font-semibold text-lg">{slot}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Consultation Fee</p>
                  <p className="text-blue-600 font-bold text-lg">₹{doctor.opdFees}</p>
                </div>
              </div>
            </div>

            {/* Footer Notes */}
            <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-200">
              <p className="text-xs text-yellow-800">
                ℹ️ Please save your booking reference ID. Please arrive 10 minutes early for your appointment.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-3 flex-shrink-0 border-t border-gray-100 bg-white sticky bottom-0">
              <button
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 text-sm rounded-lg transition-colors duration-200"
              >
                Done
              </button>
              <button
                onClick={onNewBooking}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-2 px-4 text-sm rounded-lg transition-colors duration-200"
              >
                New Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
