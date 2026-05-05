import LegalLayout from "@/components/LegalLayout";

export const metadata = {
  title: "Doctor Agreement | DocBooking",
  description:
    "Terms and obligations for healthcare providers listed on the DocBooking platform.",
};

export default function DoctorAgreementPage() {
  return (
    <LegalLayout title="Doctor Agreement" lastUpdated="April 16, 2026">
      {/* Preamble */}
      <section>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
          <p className="text-blue-900 leading-relaxed text-sm">
            This Doctor Agreement ("Agreement") governs the relationship between DocBooking.in ("Platform") and
            registered healthcare providers ("Doctor" or "Provider") listed on the Platform. By completing the
            onboarding process, the Doctor acknowledges they have read, understood, and agree to be bound by
            this Agreement.
          </p>
        </div>
      </section>

      {/* 1 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Registration & Eligibility</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          To be listed on DocBooking, a healthcare provider must:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Hold a valid and current registration with the Medical Council of India (MCI) or State Medical Council.</li>
          <li>Practise from a registered clinic or hospital address within the platform's service area.</li>
          <li>Provide accurate professional information including qualifications, speciality, and consultation fees.</li>
          <li>Maintain valid professional indemnity insurance where applicable.</li>
          <li>Not be subject to any disciplinary action, suspension, or cancellation of medical registration.</li>
        </ul>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Listing & Profile</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Doctor agrees to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Provide truthful, accurate, and up-to-date profile information.</li>
          <li>Notify DocBooking within 48 hours of any material change to qualifications, clinic address, fees, or availability.</li>
          <li>Not misrepresent specialisations or qualifications.</li>
          <li>Grant DocBooking a non-exclusive, royalty-free licence to display profile information on the Platform.</li>
        </ul>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Appointment Management</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Doctor agrees to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Honour confirmed appointments within the agreed slot timings.</li>
          <li>Provide at least 4 hours' notice to DocBooking for any unavoidable cancellations, enabling patient notification.</li>
          <li>Maintain slot availability that accurately reflects actual capacity.</li>
          <li>Not double-book the same slot across multiple channels without managing synchronisation.</li>
          <li>Inform DocBooking of clinic holidays or extended closures at least 7 days in advance.</li>
        </ul>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Quality of Service</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Doctor understands and agrees that:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>All medical consultations must be conducted in accordance with applicable Indian medical standards and ethics.</li>
          <li>DocBooking has no control over, and bears no responsibility for, the quality of the consultation.</li>
          <li>Patient data shared by DocBooking must be used solely for the purpose of providing the booked consultation.</li>
          <li>Patient health information must be kept confidential per applicable law.</li>
        </ul>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Fees & Commission</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          During the early launch phase:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Listing on DocBooking is free of charge.</li>
          <li>No commission is charged on appointments booked through the Platform during this phase.</li>
          <li>DocBooking reserves the right to introduce a commission or subscription model in the future with a minimum of 30 days' written notice to listed doctors.</li>
          <li>Continued use of the platform after such notice constitutes acceptance of the revised fee structure.</li>
        </ul>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Usage</h2>
        <p className="text-gray-700 leading-relaxed">
          DocBooking shares the following patient information with the Doctor for confirmed appointments: patient
          name, phone number, appointment date and time, and any pre-visit notes provided by the patient. This
          data must be used solely for appointment-related purposes and must not be shared with any third party
          or used for unsolicited marketing.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
        <p className="text-gray-700 leading-relaxed">
          The Doctor grants DocBooking a limited licence to use the Doctor's name, professional photograph, and
          credentials for the purpose of displaying the profile on the Platform. This licence is limited to the
          duration of the Doctor's active listing. The Doctor retains ownership of all intellectual property
          rights in their submitted materials.
        </p>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Prohibited Conduct</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          The Doctor agrees not to:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Solicit patients to book appointments outside the Platform to avoid commission (once a commission model is introduced).</li>
          <li>Post false reviews or ratings.</li>
          <li>Use patient data obtained through DocBooking for any purpose other than providing the booked consultation.</li>
          <li>Engage in any conduct that damages the reputation of DocBooking.</li>
        </ul>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Termination</h2>
        <p className="text-gray-700 leading-relaxed">
          Either party may terminate this Agreement with 15 days' written notice. DocBooking may terminate
          immediately, without notice, if the Doctor: violates any term of this Agreement, loses medical
          registration, or engages in conduct detrimental to patients or the Platform. Upon termination, the
          Doctor's listing will be removed and all pending appointments will be cancelled with notification to
          affected patients.
        </p>
      </section>

      {/* 10 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Indemnification</h2>
        <p className="text-gray-700 leading-relaxed">
          The Doctor agrees to indemnify, defend, and hold harmless DocBooking from any claims, losses,
          liabilities, damages, and expenses (including legal fees) arising from: medical negligence or
          malpractice, breach of this Agreement, inaccuracies in the Doctor's profile, or any act or omission
          in the course of providing consultation services.
        </p>
      </section>

      {/* 11 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
        <p className="text-gray-700 leading-relaxed">
          This Agreement is governed by the laws of India. Disputes shall be resolved through arbitration in
          Panipat, Haryana, under the Arbitration and Conciliation Act, 1996 before escalation to courts.
        </p>
      </section>

      {/* 12 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Contact</h2>
        <p className="text-gray-700 leading-relaxed">
          For queries regarding this Agreement, contact:{" "}
          <a href="mailto:doctors@docbooking.in" className="text-blue-600 underline">
            doctors@docbooking.in
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
