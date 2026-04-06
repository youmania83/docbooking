/**
 * EXAMPLE: Booking Page with Email OTP Integration
 * 
 * This file shows how to integrate the EmailOtpVerification component
 * into your booking flow to verify users before allowing bookings.
 * 
 * Location: app/doctors/[id]/booking/page.tsx (example)
 */

"use client";

import { useState } from "react";
import EmailOtpVerification from "@/components/EmailOtpVerification";
import PatientDetailsForm, {
  PatientDetails,
} from "@/components/PatientDetailsForm";
import BookingConfirmationModal from "@/components/BookingConfirmationModal";

interface BookingPageProps {
  params: {
    id: string;
  };
}

export default function BookingPage({ params }: BookingPageProps) {
  const doctorId = params.id;

  // Email verification state
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  // Booking state
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(
    null
  );
  const [isBookingLoading, setIsBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingId, setBookingId] = useState("");

  /**
   * Handle email verification success
   * - Unlock the patient details form
   * - Allow user to proceed with booking
   */
  const handleEmailVerified = (email: string) => {
    setVerifiedEmail(email);
    setIsEmailVerified(true);
    console.log("✅ Email verified successfully:", email);
  };

  /**
   * Handle patient details submission
   * - Validate patient info
   * - Create booking in database
   * - Show confirmation modal
   */
  const handlePatientDetailsSubmit = async (details: PatientDetails) => {
    setIsBookingLoading(true);
    setBookingError("");

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorId,
          patientName: details.name,
          patientEmail: verifiedEmail, // Use verified email
          patientAge: parseInt(details.age),
          patientGender: details.gender,
          patientPhone: details.mobileNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create booking");
      }

      // Booking successful
      setBookingId(data.data._id);
      setPatientDetails(details);
      setBookingSuccess(true);

      console.log("✅ Booking created:", data.data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create booking";
      setBookingError(message);
      console.error("❌ Booking error:", error);
    } finally {
      setIsBookingLoading(false);
    }
  };

  /**
   * Reset form and start over
   */
  const handleReset = () => {
    setIsEmailVerified(false);
    setVerifiedEmail("");
    setPatientDetails(null);
    setBookingSuccess(false);
    setBookingError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Book Appointment</h1>
          <p className="text-gray-600 mt-2">
            Verify your email and fill in your details to book your appointment
          </p>
        </div>

        {/* Booking Success State */}
        {bookingSuccess && patientDetails && (
          <BookingConfirmationModal
            isOpen={bookingSuccess}
            doctor={{
              _id: doctorId,
              name: "Doctor Name",
              specialty: "Specialty",
              opdFees: 500,
              slots: [],
              experience: "",
              address: "",
              phone: "",
              googleLocation: "",
              qualification: "",
            }}
            slot={new Date().toLocaleTimeString()}
            patientDetails={patientDetails}
            onClose={handleReset}
            onNewBooking={handleReset}
          />
        )}

        {/* Main Booking Flow */}
        {!bookingSuccess && (
          <div className="space-y-6">
            {/* Step 1: Email Verification */}
            <div
              className={`rounded-2xl shadow-lg p-8 border-2 transition ${
                isEmailVerified
                  ? "bg-blue-50 border-green-500"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                      isEmailVerified ? "bg-green-500" : "bg-blue-500"
                    }`}
                  >
                    {isEmailVerified ? "✓" : "1"}
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    Email Verification
                  </span>
                </div>

                {isEmailVerified && (
                  <span className="text-green-600 font-semibold">
                    ✅ Verified
                  </span>
                )}
              </div>

              {isEmailVerified ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-900 font-medium">
                    Email verified: <strong>{verifiedEmail}</strong>
                  </p>
                  <button
                    onClick={() => {
                      setIsEmailVerified(false);
                      setVerifiedEmail("");
                    }}
                    className="text-sm text-green-700 hover:text-green-900 mt-2 underline"
                  >
                    Use different email
                  </button>
                </div>
              ) : (
                <EmailOtpVerification
                  onVerified={handleEmailVerified}
                  onEmailChange={(email) => console.log("Email:", email)}
                />
              )}
            </div>

            {/* Step 2: Patient Details */}
            {isEmailVerified && (
              <div className="rounded-2xl shadow-lg p-8 border-2 border-gray-200 bg-white">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-white bg-blue-500">
                    2
                  </div>
                  <span className="text-lg font-semibold text-gray-900">
                    Patient Details
                  </span>
                </div>

                <PatientDetailsForm
                  onSubmit={handlePatientDetailsSubmit}
                  isLoading={isBookingLoading}
                />

                {bookingError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                    <p className="text-red-700 font-medium">{bookingError}</p>
                  </div>
                )}
              </div>
            )}

            {/* Disabled State Info */}
            {!isEmailVerified && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-900 text-sm">
                  💡 <strong>Verify your email first</strong> in Step 1 to fill
                  in your patient details and complete the booking.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * INTEGRATION NOTES:
 *
 * 1. Email Verification First
 *    - User verifies email before filling patient details
 *    - Prevents spam bookings
 *    - Ensures valid contact info
 *
 * 2. Two-Step Flow
 *    - Step 1: EmailOtpVerification component
 *    - Step 2: PatientDetailsForm component
 *
 * 3. Error Handling
 *    - Email verification errors shown in component
 *    - Booking errors shown in main page
 *    - User feedback at each step
 *
 * 4. Success Flow
 *    - Show BookingConfirmationModal
 *    - Display booking ID
 *    - Send confirmation email (optional)
 *
 * 5. Customization Options
 *    - Change styling/colors
 *    - Add more fields to patient form
 *    - Add booking time selection
 *    - Add notes/reason for visit
 *    - Add insurance info
 *
 * 6. API Integration
 *    - /api/send-email-otp - Send verification email
 *    - /api/verify-email-otp - Verify OTP code
 *    - /api/bookings - Create booking (POST)
 *
 * 7. Database Storage
 *    - Otp collection - temporary OTP records
 *    - Booking collection - confirmed appointments
 *    - Uses verified email as contact info
 *
 * 8. Future Enhancements
 *    - SMS backup for OTP
 *    - Calendar picker for appointments
 *    - Payment integration
 *    - Reminder emails before appointment
 *    - Cancel/reschedule functionality
 *
 * 9. Testing
 *    - In development: Use devOtp from API response
 *    - Use test email for development
 *    - Verify all error states work
 *    - Test on mobile devices
 *
 * 10. Production Notes
 *     - Ensure Gmail credentials are set in Vercel env
 *     - Test email sending before launch
 *     - Monitor email delivery rates
 *     - Set up email alerts for failures
 *     - Track booking conversion rates
 */
