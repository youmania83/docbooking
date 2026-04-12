import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Cancellation Policy | DocBooking",
  description: "Cancellation policy for DocBooking appointment booking platform",
};

export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-8 flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cancellation Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: April 12, 2026</p>

          {/* Sections */}
          <div className="space-y-8">
            {/* 1. Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                This Cancellation Policy outlines how you can cancel or reschedule your appointment booked through
                DocBooking. We understand that plans can change, and we want to make cancellations as simple as possible.
              </p>
            </section>

            {/* 2. Cancellation Window */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Cancellation Window</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can cancel your appointment under the following conditions:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-900 font-semibold">
                  ✓ Full Refund: Cancel up to 24 hours before your appointment
                </p>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-orange-900 font-semibold">
                  ⚠ 50% Refund: Cancel between 12-24 hours before appointment
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                <p className="text-red-900 font-semibold">
                  ✗ No Refund: Cancel less than 12 hours before appointment
                </p>
              </div>
            </section>

            {/* 3. How to Cancel */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How to Cancel Your Appointment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To cancel your appointment:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li>Log into your DocBooking account</li>
                <li>Go to "My Bookings" or "Appointments"</li>
                <li>Select the appointment you wish to cancel</li>
                <li>Click "Cancel Appointment"</li>
                <li>Confirm your cancellation request</li>
              </ol>
            </section>

            {/* 4. Rescheduling */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Rescheduling Your Appointment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can reschedule your appointment to a different date or time:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Rescheduling is allowed up to 24 hours before the appointment</li>
                <li>Select a new date and time during the rescheduling process</li>
                <li>No additional fees for rescheduling</li>
                <li>Rescheduled appointments must be within 30 days of original booking</li>
              </ul>
            </section>

            {/* 5. Doctor-Initiated Cancellation */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Doctor-Initiated Cancellation</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If the doctor cancels your appointment:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>You will receive immediate notification via SMS/Email</li>
                <li>Full refund will be processed automatically</li>
                <li>You can reschedule with the doctor for a different time</li>
              </ul>
            </section>

            {/* 6. No-Show Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. No-Show Policy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you do not attend your scheduled appointment without prior cancellation:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>No refund will be issued</li>
                <li>Multiple no-shows may affect your future booking privileges</li>
                <li>The doctor may choose not to accept future bookings from you</li>
                <li>You will be notified if your account is flagged for excessive no-shows</li>
              </ul>
            </section>

            {/* 7. Special Circumstances */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Special Circumstances</h2>
              <p className="text-gray-700 leading-relaxed">
                In case of emergencies or exceptional circumstances, please contact our support team immediately.
                We will review your case and may make exceptions on a case-by-case basis.
              </p>
            </section>

            {/* 8. Contact Support */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Support</h2>
              <p className="text-gray-700 leading-relaxed">
                For cancellation or rescheduling assistance:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong> support@docbooking.in<br />
                <strong>Phone:</strong> +91-XXXXXXXXXX<br />
                <strong>Available:</strong> 24/7
              </p>
            </section>

            {/* 9. Policy Updates */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                DocBooking reserves the right to modify this Cancellation Policy at any time. You will be notified
                of any changes via email or through our platform.
              </p>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <Link href="/terms-and-conditions" className="hover:text-blue-600 transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/refund-policy" className="hover:text-blue-600 transition-colors">
              Refund Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
