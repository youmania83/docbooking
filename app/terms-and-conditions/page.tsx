import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions | DocBooking",
  description: "Terms and conditions for using DocBooking appointment booking platform",
};

export default function TermsAndConditions() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: April 12, 2026</p>

          {/* Sections */}
          <div className="space-y-8">
            {/* 1. Agreement to Terms */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using DocBooking, you accept and agree to be bound by the terms and provision
                of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            {/* 2. Use License */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Use License</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Permission is granted to temporarily download one copy of the materials (information or software)
                on DocBooking for personal, non-commercial transitory viewing only. This is the grant of a license,
                not a transfer of title, and under this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to decompile or reverse engineer any software contained on DocBooking</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                <li>Attempt to gain unauthorized access to any portion or feature of the service</li>
              </ul>
            </section>

            {/* 3. Booking and Appointment */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Booking and Appointment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By booking an appointment through DocBooking:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>You confirm that all information provided is accurate and truthful</li>
                <li>You agree to attend the scheduled appointment or provide cancellation notice as per policy</li>
                <li>You understand that no-shows may affect future booking privileges</li>
                <li>You accept the doctor's fees as displayed at the time of booking</li>
              </ul>
            </section>

            {/* 4. User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Responsibilities</h2>
              <p className="text-gray-700 leading-relaxed">
                You are responsible for maintaining the confidentiality of your login credentials and for all
                activities that occur under your account. You agree to notify DocBooking immediately of any
                unauthorized use of your account. DocBooking will not be liable for any loss or damage arising
                from unauthorized use of your account.
              </p>
            </section>

            {/* 5. Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                The materials on DocBooking are provided on an 'as is' basis. DocBooking makes no warranties,
                expressed or implied, and hereby disclaims and negates all other warranties including, without
                limitation, implied warranties or conditions of merchantability, fitness for a particular purpose,
                or non-infringement of intellectual property or other violation of rights.
              </p>
            </section>

            {/* 6. Modifications */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                DocBooking may revise these terms of service for its website at any time without notice. By using
                this website, you are agreeing to be bound by the then current version of these terms of service.
              </p>
            </section>

            {/* 7. Governing Law */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These terms and conditions are governed by and construed in accordance with the laws of India,
                and you irrevocably submit to the exclusive jurisdiction of the courts in India.
              </p>
            </section>

            {/* 8. Contact Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong> support@docbooking.in<br />
                <strong>Phone:</strong> +91-XXXXXXXXXX
              </p>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="flex justify-center gap-6 text-sm text-gray-600">
            <Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-gray-300">•</span>
            <Link href="/refund-policy" className="hover:text-blue-600 transition-colors">
              Refund Policy
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
