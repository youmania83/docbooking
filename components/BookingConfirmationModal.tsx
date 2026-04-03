"use client";

import { Check, Phone, User, Calendar, Stethoscope, X, Edit } from "lucide-react";
import Link from "next/link";
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
  patientDetails: PatientDetails;
  onClose: () => void;
  onNewBooking: () => void;
  onEdit?: () => void;
}

export default function BookingConfirmationModal({
  isOpen,
  doctor,
  slot,
  patientDetails,
  onClose,
  onNewBooking,
  onEdit,
}: BookingConfirmationModalProps) {
  if (!isOpen) return null;

  const bookingId = `DB${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const bookingDate = new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors z-10"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
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
        <div className="p-6 space-y-6">
          {/* Booking Reference */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
              Booking Reference ID
            </p>
            <p className="text-lg font-bold text-blue-600">{bookingId}</p>
          </div>

          {/* Patient Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
          <div className="space-y-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
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
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <p className="text-xs text-yellow-800">
              ℹ️ A confirmation SMS will be sent to +91 {patientDetails.mobileNumber}. Please arrive 10 minutes early.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={onClose}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Done
            </button>
            {onEdit && (
              <button
                onClick={onEdit}
                className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <Edit size={20} />
                Edit Details
              </button>
            )}
            <Link href="/doctors" className="w-full">
              <button className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Book Another Appointment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
