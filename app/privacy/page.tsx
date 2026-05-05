import LegalLayout from "@/components/LegalLayout";

export const metadata = {
  title: "Privacy Policy | DocBooking",
  description:
    "Understand how DocBooking collects, uses, and protects your personal and health-related data.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalLayout title="Privacy Policy" lastUpdated="April 16, 2026">
      {/* 1 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
        <p className="text-gray-700 leading-relaxed">
          DocBooking ("we", "our", "us") is committed to protecting the privacy and security of your personal
          information. This Privacy Policy explains how we collect, use, share, and safeguard data when you
          access or use the DocBooking.in platform. By using our Platform you consent to the practices described
          in this Policy.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Information You Provide</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
          <li>Full name and date of birth</li>
          <li>Mobile / WhatsApp number</li>
          <li>Gender and age</li>
          <li>Appointment preferences (doctor, date, time)</li>
          <li>Any health concerns submitted voluntarily before a consultation</li>
        </ul>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Information Collected Automatically</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
          <li>IP address and approximate geolocation</li>
          <li>Browser type and operating system</li>
          <li>Pages viewed and time spent on the Platform</li>
          <li>Referral source (how you arrived at our Platform)</li>
          <li>Device identifiers</li>
        </ul>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Information from Third Parties</h3>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Doctor profile data provided by registered healthcare providers</li>
          <li>WhatsApp delivery receipts via our messaging partner (AiSensy)</li>
        </ul>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>To process and confirm your appointment bookings</li>
          <li>To send booking confirmations and reminders via WhatsApp</li>
          <li>To identify you via OTP verification</li>
          <li>To improve our Platform features and user experience</li>
          <li>To prevent fraudulent or abusive use of the Platform</li>
          <li>To comply with legal obligations under Indian law</li>
          <li>To send service-related notifications (no unsolicited marketing without consent)</li>
        </ul>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Sharing of Information</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          We do not sell your personal data. We may share your data with:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>
            <strong>Healthcare Providers:</strong> Your name, phone number, and appointment details are shared
            with the doctor or clinic you book with.
          </li>
          <li>
            <strong>Technology Partners:</strong> WhatsApp messaging services (e.g., AiSensy / Meta) for OTP
            and appointment notifications.
          </li>
          <li>
            <strong>Cloud Services:</strong> MongoDB Atlas for database storage; Vercel for hosting.
          </li>
          <li>
            <strong>Analytics:</strong> Anonymised usage data may be shared with analytics providers.
          </li>
          <li>
            <strong>Legal Authorities:</strong> When required by law, court order, or government regulation.
          </li>
        </ul>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
        <p className="text-gray-700 leading-relaxed">
          We retain your personal information for as long as necessary to fulfill the purposes for which it was
          collected, including to satisfy legal, accounting, or reporting obligations. Appointment records are
          retained for a minimum of 3 years in line with healthcare regulatory requirements in India. OTP session
          tokens are automatically deleted within 15 minutes of generation.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Security</h2>
        <p className="text-gray-700 leading-relaxed">
          We implement industry-standard security measures including HTTPS encryption, hashed/salted session
          tokens, rate limiting, and access controls to protect your data. However, no method of electronic
          transmission or storage is 100% secure, and we cannot guarantee absolute security.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
        <p className="text-gray-700 leading-relaxed">
          DocBooking uses session cookies and local storage solely for functional purposes (e.g., maintaining
          your verified session during booking). We do not use tracking cookies or third-party advertising
          cookies. You can disable cookies in your browser settings, but this may affect the Platform's
          functionality.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Children's Privacy</h2>
        <p className="text-gray-700 leading-relaxed">
          The Platform is not directed at children under 13 years of age. We do not knowingly collect personal
          information from children under 13. If you believe we have inadvertently collected such information,
          please contact us and we will promptly delete it.
        </p>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Your Rights</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Subject to applicable law (including the Digital Personal Data Protection Act, 2023), you have the
          right to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Access the personal data we hold about you</li>
          <li>Request correction of inaccurate data</li>
          <li>Request deletion of your data (subject to legal retention obligations)</li>
          <li>Withdraw consent for communications</li>
          <li>Lodge a complaint with the relevant Data Protection Board</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          To exercise any of these rights, email us at{" "}
          <a href="mailto:privacy@docbooking.in" className="text-blue-600 underline">
            privacy@docbooking.in
          </a>
          .
        </p>
      </section>

      {/* 10 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Third-Party Links</h2>
        <p className="text-gray-700 leading-relaxed">
          The Platform may contain links to third-party websites (e.g., Google Maps for doctor location).
          DocBooking is not responsible for the privacy practices or content of such websites. We encourage you
          to read their privacy policies before providing any personal information.
        </p>
      </section>

      {/* 11 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to This Policy</h2>
        <p className="text-gray-700 leading-relaxed">
          We may update this Privacy Policy from time to time. We will notify you of material changes by
          updating the "Last Updated" date and, where appropriate, via a WhatsApp notification. Your continued
          use of the Platform after changes are posted constitutes acceptance of the updated Policy.
        </p>
      </section>

      {/* 12 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact Us</h2>
        <p className="text-gray-700 leading-relaxed">
          For privacy-related queries, contact our Data Protection Officer at:{" "}
          <a href="mailto:privacy@docbooking.in" className="text-blue-600 underline">
            privacy@docbooking.in
          </a>
          , DocBooking.in, Panipat, Haryana — 132103, India.
        </p>
      </section>
    </LegalLayout>
  );
}
