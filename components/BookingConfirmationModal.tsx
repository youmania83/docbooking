"use client";

import { Check, Phone, User, Calendar, Stethoscope } from "lucide-react";
import Link from "next/link";
import { PatientDetails } from "./PatientDetailsForm";
import { Doctor } from "@/lib/data";

interface BookingConfirmationModalProps {
  isOpen: boolean;
  doctor: Doctor;
  slot: string;
  patientDetails: PatientDetails;
  onClose: () => void;
  onNewBooking: () => void;
}

export default function BookingConfirmationModal({
  isOpen,
  doctor,
  slot,
  patientDetails,
  onClose,
  onNewBooking,
}: BookingConfirmationModalProps) {
  if (!isOpen) return null;

  const bookingId = `DB${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const bookingDate = new Date();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in">
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
                <p className="text-blue-600 font-bold text-lg">₹{doctor.fee}</p>
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Finish
            </button>
            <Link href="/doctors">
              <button className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors duration-200">
                Book Another Appointment
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
