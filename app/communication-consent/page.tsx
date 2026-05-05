import LegalLayout from "@/components/LegalLayout";

export const metadata = {
  title: "Communication Consent | DocBooking",
  description:
    "Understand how and why DocBooking communicates with you via WhatsApp and SMS for appointment notifications.",
};

export default function CommunicationConsentPage() {
  return (
    <LegalLayout title="Communication Consent" lastUpdated="April 16, 2026">
      {/* 1 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          By registering on DocBooking.in or booking an appointment, you expressly consent to receiving
          communications from DocBooking and its authorised messaging partners via WhatsApp and/or SMS to the
          mobile number provided during registration. This document explains the nature, purpose, and opt-out
          mechanism for those communications.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Types of Communications</h2>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Transactional Messages (Mandatory)</h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          These messages are essential for the functioning of the Platform and cannot be opted out of while
          using the service:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mb-4">
          <li>OTP (One-Time Password) for phone verification</li>
          <li>Appointment booking confirmation</li>
          <li>Appointment reminder (sent 24 hours and 1 hour before your appointment)</li>
          <li>Appointment cancellation or rescheduling notification</li>
        </ul>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Informational Messages (Optional)</h3>
        <p className="text-gray-700 leading-relaxed mb-3">
          These messages are sent with your consent and can be opted out of at any time:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Health tips and preventive care reminders</li>
          <li>New doctor listings near your area</li>
          <li>Platform updates and new features</li>
          <li>Survey requests for service improvement</li>
        </ul>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Messaging Channels</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          DocBooking uses the following channels to communicate with users:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>
            <strong>WhatsApp Business API</strong> — powered by AiSensy (Meta-approved Business Solution
            Provider). Messages will appear from an official DocBooking WhatsApp Business number.
          </li>
          <li>
            <strong>SMS Fallback</strong> — If WhatsApp delivery fails, an SMS may be sent via an authorised
            telecom channel as a fallback for critical transactional messages only.
          </li>
        </ul>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Message Frequency</h2>
        <p className="text-gray-700 leading-relaxed">
          For each appointment, you will receive a maximum of 3 transactional messages (confirmation, 24-hour
          reminder, 1-hour reminder). Informational messages will not exceed 4 per month. We will not send bulk
          promotional spam.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Used for Communication</h2>
        <p className="text-gray-700 leading-relaxed">
          Only your mobile number and first name are shared with our messaging partner (AiSensy) for the
          purpose of sending appointment-related communications. This data is not used for any other purpose by
          our messaging partner. Please refer to{" "}
          <a href="https://aisensy.com/privacy-policy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">
            AiSensy's Privacy Policy
          </a>{" "}
          for their data handling practices.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. How to Opt Out</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          You can withdraw consent for informational/promotional communications at any time by:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>
            Replying <strong>"STOP"</strong> to any WhatsApp message from DocBooking
          </li>
          <li>
            Emailing us at{" "}
            <a href="mailto:support@docbooking.in" className="text-blue-600 underline">
              support@docbooking.in
            </a>{" "}
            with the subject <strong>"Unsubscribe"</strong>
          </li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          Please note that opting out of informational messages will not stop transactional messages required
          for your active bookings.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Compliance</h2>
        <p className="text-gray-700 leading-relaxed">
          Our communication practices comply with the Telecom Commercial Communications Customer Preference
          Regulations (TCCCPR), the Information Technology Act, 2000, and WhatsApp's Business Messaging Policy.
          We maintain suppression lists and honour all opt-out requests within 5 business days.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact</h2>
        <p className="text-gray-700 leading-relaxed">
          For questions about our communications, email{" "}
          <a href="mailto:support@docbooking.in" className="text-blue-600 underline">
            support@docbooking.in
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
