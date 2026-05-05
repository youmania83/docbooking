import LegalLayout from "@/components/LegalLayout";

export const metadata = {
  title: "Disclaimer | DocBooking",
  description:
    "Important disclaimers regarding DocBooking's role as a technology intermediary and the limitations of its services.",
};

export default function DisclaimerPage() {
  return (
    <LegalLayout title="Disclaimer" lastUpdated="April 16, 2026">
      {/* 1 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Technology Intermediary</h2>
        <p className="text-gray-700 leading-relaxed">
          DocBooking.in is a technology platform that facilitates appointment scheduling between patients and
          registered healthcare providers. DocBooking is not a hospital, clinic, medical establishment, or
          healthcare provider of any kind. We act solely as an intermediary under the Information Technology
          Act, 2000 and related rules.
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. No Medical Advice</h2>
        <p className="text-gray-700 leading-relaxed">
          Nothing on this Platform constitutes professional medical advice, diagnosis, or treatment. All content
          is for informational purposes only. Always seek the advice of a qualified physician or other licensed
          healthcare professional regarding any medical condition, symptoms, or treatment options. Never
          disregard professional medical advice or delay seeking it because of information you read on this
          Platform.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Doctor Information Accuracy</h2>
        <p className="text-gray-700 leading-relaxed">
          Doctor profiles, qualifications, specialisations, fees, clinic addresses, and availability displayed
          on the Platform are sourced from the respective healthcare providers. DocBooking makes reasonable
          efforts to keep this information current but does not warrant the accuracy, completeness, or
          timeliness of any such information. Patients are advised to verify credentials and details directly
          with the doctor or clinic before attending an appointment.
        </p>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Appointment Availability</h2>
        <p className="text-gray-700 leading-relaxed">
          Slot availability shown on the Platform is updated in real time but may be subject to change without
          notice due to technical issues, doctor emergencies, or other factors beyond our control. DocBooking
          does not guarantee that an appointment slot will remain available until the booking is confirmed.
        </p>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Emergency Situations</h2>
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
          <p className="text-red-800 font-semibold leading-relaxed">
            DocBooking is NOT designed for medical emergencies. If you or someone else is experiencing a
            life-threatening emergency, please call 112 (National Emergency) or 108 (Ambulance) immediately.
            Do not rely on DocBooking in emergency situations.
          </p>
        </div>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Third-Party Services</h2>
        <p className="text-gray-700 leading-relaxed">
          The Platform may integrate with third-party services including WhatsApp Business API, Google Maps,
          and payment gateways. DocBooking is not responsible for the availability, accuracy, or conduct of
          these third-party services. Use of such third-party services is governed by the respective provider's
          terms and privacy policies.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitation of Liability</h2>
        <p className="text-gray-700 leading-relaxed">
          DocBooking, its founders, employees, and affiliates shall not be liable for any direct, indirect,
          incidental, consequential, or punitive damages arising from:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
          <li>Healthcare services or advice received from doctors listed on the Platform</li>
          <li>Missed, cancelled, or rescheduled appointments</li>
          <li>Reliance on information presented in doctor profiles</li>
          <li>Platform downtime or technical failures</li>
          <li>Inaccuracies in third-party data</li>
        </ul>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Governing Jurisdiction</h2>
        <p className="text-gray-700 leading-relaxed">
          This Disclaimer is governed by the laws of India. Any disputes shall be subject to the jurisdiction
          of courts at Panipat, Haryana.
        </p>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
        <p className="text-gray-700 leading-relaxed">
          For queries related to this Disclaimer, contact us at{" "}
          <a href="mailto:legal@docbooking.in" className="text-blue-600 underline">
            legal@docbooking.in
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
