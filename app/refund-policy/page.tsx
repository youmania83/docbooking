import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Refund Policy | DocBooking",
  description: "Refund policy for DocBooking appointment booking platform",
};

export default function RefundPolicy() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Refund Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: April 12, 2026</p>

          {/* Sections */}
          <div className="space-y-8">
            {/* 1. Overview */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
              <p className="text-gray-700 leading-relaxed">
                This Refund Policy outlines the terms and conditions under which payments made through DocBooking
                may be refunded. Please read this policy carefully before making any payment.
              </p>
            </section>

            {/* 2. Eligible for Refund */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. When You Are Eligible for a Refund</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may be eligible for a refund in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Doctor cancels the appointment</li>
                <li>Double charge due to technical error</li>
                <li>Payment failure but amount was debited</li>
                <li>You cancel within 24 hours of booking (see Cancellation Policy)</li>
              </ul>
            </section>

            {/* 3. Non-Refundable Situations */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Non-Refundable Situations</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Refunds will NOT be provided in the following cases:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>No-show: You do not attend the appointment without prior cancellation</li>
                <li>Cancellation after the allowed cancellation window</li>
                <li>Services already rendered (doctor consultation completed)</li>
                <li>Patient-requested changes leading to rebooking</li>
              </ul>
            </section>

            {/* 4. Refund Process */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Refund Process</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you are eligible for a refund:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Contact our support team within 7 days of the transaction</li>
                <li>Provide booking confirmation and proof of payment</li>
                <li>Refund processing typically takes 5-7 business days</li>
                <li>Refunds are credited to the original payment method</li>
              </ul>
            </section>

            {/* 5. Refund Timeline */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Timeline</h2>
              <p className="text-gray-700 leading-relaxed">
                Once your refund request is approved and processed, it may take 5-7 business days for the amount
                to appear in your account. Please note that delays may occur due to your bank or payment provider.
              </p>
            </section>

            {/* 6. Contact for Refund Issues */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact for Refund Issues</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have not received your refund after 10 business days, please contact us immediately:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong> refunds@docbooking.in<br />
                <strong>Phone:</strong> +91-XXXXXXXXXX
              </p>
            </section>

            {/* 7. Modifications to Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Modifications to This Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                DocBooking reserves the right to modify this Refund Policy at any time. Changes will be effective
                immediately upon posting to the website.
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
            <Link href="/cancellation-policy" className="hover:text-blue-600 transition-colors">
              Cancellation Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
