import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | DocBooking",
  description: "Privacy policy for DocBooking appointment booking platform",
};

export default function PrivacyPolicy() {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: April 12, 2026</p>

          {/* Sections */}
          <div className="space-y-8">
            {/* 1. Introduction */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed">
                At DocBooking, we take your privacy very seriously. This Privacy Policy explains how we collect,
                use, disclose, and safeguard your information when you visit our platform.
              </p>
            </section>

            {/* 2. Information We Collect */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect information in the following ways:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Personal Information:</strong> Name, phone number, age, gender</li>
                <li><strong>Appointment Details:</strong> Doctor selected, date, time, fees paid</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Usage Data:</strong> How you interact with our platform</li>
              </ul>
            </section>

            {/* 3. How We Use Your Information */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Process and fulfill your appointment bookings</li>
                <li>Send appointment reminders via phone or email</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our platform and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* 4. Data Security */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-700 leading-relaxed">
                We implement appropriate technical and organizational measures to protect your personal information
                against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
                over the Internet is 100% secure.
              </p>
            </section>

            {/* 5. Third-Party Sharing */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Third-Party Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to third parties. We may share information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Healthcare providers and doctors to facilitate your appointments</li>
                <li>Payment processors to handle transactions</li>
                <li>Service providers who assist in platform operations</li>
                <li>When required by law or court orders</li>
              </ul>
            </section>

            {/* 6. Your Rights */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to access, correct, update, or delete your personal information. To exercise these
                rights, please contact us using the details provided at the end of this policy.
              </p>
            </section>

            {/* 7. Cookies */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform uses cookies to enhance your experience. You can choose to disable cookies through your
                browser settings, but this may affect functionality of our platform.
              </p>
            </section>

            {/* 8. Children's Privacy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                DocBooking is not intended for children under 18 years old without parental consent. We do not knowingly
                collect information from children without proper authorization.
              </p>
            </section>

            {/* 9. Contact Us */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="text-gray-700 mt-4">
                <strong>Email:</strong> privacy@docbooking.in<br />
                <strong>Phone:</strong> +91-XXXXXXXXXX
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
