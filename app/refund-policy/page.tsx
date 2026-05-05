import LegalLayout from "@/components/LegalLayout";

export const metadata = {
  title: "Refund Policy | DocBooking",
  description:
    "Learn about DocBooking's refund policy — when you are eligible for a refund and how to request one.",
};

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" lastUpdated="April 16, 2026">
      {/* 1 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Overview</h2>
        <p className="text-gray-700 leading-relaxed">
          This Refund Policy outlines the terms and conditions under which payments made through DocBooking may
          be refunded. Please read this policy carefully before making any payment through the Platform. This
          Policy is supplementary to our{" "}
          <a href="/cancellation-policy" className="text-blue-600 underline">
            Cancellation Policy
          </a>
          .
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Current Payment Status</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-900 leading-relaxed text-sm">
            <strong>Note:</strong> DocBooking currently operates in a pre-payment model where consultation fees
            are paid directly to the doctor at the clinic. Online prepaid booking is being introduced
            progressively. This policy applies to any prepaid transactions processed through the Platform.
          </p>
        </div>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Circumstances Eligible for Refund</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          You are eligible for a full refund in the following situations:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>The doctor cancels or does not honour the confirmed appointment</li>
          <li>A duplicate/double charge occurs due to a technical error</li>
          <li>Payment is debited but the booking is not confirmed (transaction failure)</li>
          <li>DocBooking cancels the appointment due to a platform error</li>
          <li>You cancel at least 24 hours before the appointment time</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          You are eligible for a <strong>50% refund</strong> if you cancel between 12 and 24 hours before the
          appointment.
        </p>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Non-Refundable Situations</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Refunds will <strong>not</strong> be provided in the following cases:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>No-show: patient does not attend the appointment without prior cancellation</li>
          <li>Cancellation less than 12 hours before the appointment</li>
          <li>Consultation already completed</li>
          <li>Patient-initiated rebooking or change of doctor after payment</li>
          <li>Dissatisfaction with the quality of medical advice rendered</li>
        </ul>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Refund Process</h2>
        <p className="text-gray-700 leading-relaxed mb-4">To raise a refund request:</p>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
          <li>Email us at{" "}
            <a href="mailto:refunds@docbooking.in" className="text-blue-600 underline">
              refunds@docbooking.in
            </a>
            {" "}within 7 calendar days of the scheduled appointment date.
          </li>
          <li>Include your booking ID, registered phone number, and reason for the refund.</li>
          <li>Attach any supporting evidence (e.g., screenshot of double charge).</li>
          <li>Our team will acknowledge your request within 2 business days.</li>
          <li>Approved refunds will be processed within 5–7 business days.</li>
        </ol>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Refund Timeline</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-800 mb-1">UPI / Net Banking</p>
            <p className="text-green-700 text-sm">2–3 business days after approval</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="font-semibold text-green-800 mb-1">Credit / Debit Card</p>
            <p className="text-green-700 text-sm">5–7 business days after approval</p>
          </div>
        </div>
        <p className="text-gray-600 text-sm mt-3">
          Delays caused by your bank or payment provider are beyond DocBooking's control.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Dispute Resolution</h2>
        <p className="text-gray-700 leading-relaxed">
          If your refund request is denied and you disagree with our decision, you may escalate by emailing{" "}
          <a href="mailto:legal@docbooking.in" className="text-blue-600 underline">
            legal@docbooking.in
          </a>
          . We will attempt to resolve all disputes amicably within 15 business days. If unresolved, disputes
          will be governed as per our Terms of Use.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modifications to This Policy</h2>
        <p className="text-gray-700 leading-relaxed">
          DocBooking reserves the right to modify this Refund Policy at any time. Changes will be effective
          upon posting to the Platform with an updated "Last Updated" date.
        </p>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contact</h2>
        <p className="text-gray-700 leading-relaxed">
          For refund-related queries:{" "}
          <a href="mailto:refunds@docbooking.in" className="text-blue-600 underline">
            refunds@docbooking.in
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
