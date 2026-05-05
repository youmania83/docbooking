import LegalLayout from "@/components/LegalLayout";

export const metadata = {
  title: "Terms of Use | DocBooking",
  description:
    "Read the terms and conditions for using DocBooking — India's healthcare appointment platform.",
};

export default function TermsOfUse() {
  return (
    <LegalLayout title="Terms of Use" lastUpdated="April 16, 2026">
      {/* 1 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
        <p className="text-gray-700 leading-relaxed">
          By accessing or using DocBooking.in (the "Platform"), you agree to be legally bound by these Terms of
          Use ("Terms"). If you do not agree to these Terms, you must not access or use the Platform. These Terms
          constitute a legally binding agreement between you ("User") and DocBooking ("we", "us", or "our").
        </p>
      </section>

      {/* 2 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          DocBooking is an online appointment scheduling platform that enables patients to discover, book, and
          manage appointments with registered healthcare providers in Panipat, Haryana, India. We do not provide
          any medical advice, diagnosis, or treatment. All medical decisions remain solely with the consulting
          doctor.
        </p>
        <p className="text-gray-700 leading-relaxed">
          We act solely as an intermediary technology platform facilitating connectivity between patients and
          doctors. DocBooking is not a healthcare provider and is not responsible for the quality, safety, or
          legality of the healthcare services rendered.
        </p>
      </section>

      {/* 3 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>You must be at least 18 years of age to use this Platform independently.</li>
          <li>Minors may use the Platform only with the supervision and consent of a parent or legal guardian.</li>
          <li>You represent that all information you provide during registration is accurate and complete.</li>
          <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
        </ul>
      </section>

      {/* 4 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Account Registration & OTP Verification</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Booking an appointment requires verification via a One-Time Password (OTP) sent to your registered
          WhatsApp or mobile number. By providing your phone number you:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Confirm the number belongs to you or you have explicit authorisation to use it.</li>
          <li>Consent to receiving transactional WhatsApp messages related to your booking.</li>
          <li>Agree not to share OTPs with third parties; you are solely liable for any misuse.</li>
        </ul>
      </section>

      {/* 5 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Appointment Booking</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Slots displayed on the Platform are subject to real-time availability maintained by the respective
          healthcare provider. DocBooking does not guarantee:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Availability of a specific doctor or time slot.</li>
          <li>That an appointment will not be cancelled or rescheduled by the doctor.</li>
          <li>The accuracy, completeness, or currency of doctor profiles.</li>
        </ul>
        <p className="text-gray-700 leading-relaxed mt-4">
          DocBooking will notify you via WhatsApp if an appointment is cancelled or rescheduled by the doctor.
          It is your responsibility to confirm the appointment directly with the clinic before attending.
        </p>
      </section>

      {/* 6 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payments</h2>
        <p className="text-gray-700 leading-relaxed mb-4">
          Currently, DocBooking facilitates appointment booking only. Payment of consultation fees, if
          applicable, is to be settled directly with the doctor or clinic at the time of the visit unless a
          prepaid gateway is explicitly enabled for the relevant doctor. All pricing displayed is indicative and
          may change without prior notice.
        </p>
      </section>

      {/* 7 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Prohibited Conduct</h2>
        <p className="text-gray-700 leading-relaxed mb-4">You agree not to:</p>
        <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Use the Platform for any unlawful purpose or in a manner that violates any applicable law.</li>
          <li>Submit false, misleading, or fraudulent information.</li>
          <li>Make fictitious or spam bookings.</li>
          <li>Reverse-engineer, decompile, or attempt to extract the source code.</li>
          <li>Circumvent or manipulate any security or verification mechanism.</li>
          <li>Use automated bots, scrapers, or crawlers without written consent.</li>
          <li>Transmit viruses, malware, or any other harmful code.</li>
          <li>Harass, threaten, or impersonate any person or entity.</li>
        </ul>
      </section>

      {/* 8 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
        <p className="text-gray-700 leading-relaxed">
          All content, trademarks, logos, and software on the Platform are the exclusive property of DocBooking
          or its licensors. You are granted a limited, non-exclusive, non-transferable licence to access the
          Platform for personal, non-commercial use. Nothing in these Terms transfers any ownership rights to you.
        </p>
      </section>

      {/* 9 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
        <p className="text-gray-700 leading-relaxed">
          The Platform is provided on an "as is" and "as available" basis without warranties of any kind, either
          express or implied. DocBooking does not warrant that the Platform will be uninterrupted, error-free, or
          free of viruses. Use of the Platform is at your sole risk.
        </p>
      </section>

      {/* 10 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Limitation of Liability</h2>
        <p className="text-gray-700 leading-relaxed">
          To the maximum extent permitted by applicable law, DocBooking shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages arising from your use of or inability to use
          the Platform or the services of any doctor listed therein. Our aggregate liability for any claim shall
          not exceed INR 1,000 (One Thousand Rupees).
        </p>
      </section>

      {/* 11 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Indemnification</h2>
        <p className="text-gray-700 leading-relaxed">
          You agree to indemnify, defend, and hold harmless DocBooking, its officers, directors, employees, and
          agents from any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal
          fees) arising from your breach of these Terms or your use of the Platform.
        </p>
      </section>

      {/* 12 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Termination</h2>
        <p className="text-gray-700 leading-relaxed">
          DocBooking reserves the right to suspend or terminate your access to the Platform at any time, without
          notice, for conduct that we determine violates these Terms or is harmful to other users, third parties,
          or the interests of DocBooking. You may stop using the Platform at any time.
        </p>
      </section>

      {/* 13 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Modifications to Terms</h2>
        <p className="text-gray-700 leading-relaxed">
          We reserve the right to update these Terms at any time. The revised Terms will be posted on this page
          with a new "Last Updated" date. Continued use of the Platform after such changes constitutes your
          acceptance of the new Terms.
        </p>
      </section>

      {/* 14 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Governing Law & Dispute Resolution</h2>
        <p className="text-gray-700 leading-relaxed">
          These Terms shall be governed by and construed in accordance with the laws of India. Any disputes
          arising hereunder shall be subject to the exclusive jurisdiction of the courts at Panipat, Haryana.
          Prior to litigation, parties agree to attempt resolution through good-faith negotiation for a period of
          30 days.
        </p>
      </section>

      {/* 15 */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Us</h2>
        <p className="text-gray-700 leading-relaxed">
          For any questions regarding these Terms, please contact us at:{" "}
          <a href="mailto:legal@docbooking.in" className="text-blue-600 underline">
            legal@docbooking.in
          </a>
          .
        </p>
      </section>
    </LegalLayout>
  );
}
