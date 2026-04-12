"use client";

import Link from "next/link";
import { Mail, Heart, Stethoscope } from "lucide-react";
import { useState } from "react";

export default function ComingSoonPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [doctorEmail, setDoctorEmail] = useState("");
  const [doctorSubmitted, setDoctorSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [error, setError] = useState("");
  const [doctorError, setDoctorError] = useState("");

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      // Call API to register patient
      const response = await fetch("/api/patients/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setEmail("");
        setTimeout(() => setSubmitted(false), 3000);
      } else {
        setError(data.message || "Failed to submit. Please try again.");
        console.error("Notification error:", data.message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Network error. Please try again.";
      setError(errorMsg);
      console.error("Error sending notification:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorLoading(true);
    setDoctorError("");
    
    try {
      // Call API to register doctor
      const response = await fetch("/api/doctors/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: doctorEmail }),
      });

      const data = await response.json();

      if (data.success) {
        setDoctorSubmitted(true);
        setDoctorEmail("");
        setTimeout(() => setDoctorSubmitted(false), 3000);
      } else {
        setDoctorError(data.message || "Failed to submit. Please try again.");
        console.error("Registration error:", data.message);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Network error. Please try again.";
      setDoctorError(errorMsg);
      console.error("Error submitting doctor registration:", error);
    } finally {
      setDoctorLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - BLUE */}
      <section className="bg-blue-600 text-white py-32">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full">
              <p className="text-sm font-semibold">Coming Soon</p>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            Panipat's Smart Doctor Booking Platform — Launching Soon
          </h1>

          {/* Subtext */}
          <p className="text-lg text-blue-100 leading-relaxed">
            Skip long queues. Book trusted doctors instantly. Be among the first to experience smarter healthcare in Panipat.
          </p>

          {/* CTA Form */}
          <form onSubmit={handlePatientSubmit} className="flex gap-2 max-w-md mx-auto bg-white bg-opacity-10 p-1 rounded-lg">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="flex-1 px-4 py-3 bg-white text-gray-900 placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-white font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "..." : "Notify Me"}
            </button>
          </form>

          {error && (
            <p className="text-center text-red-200 text-sm font-medium max-w-md mx-auto">
              ✗ {error}
            </p>
          )}

          {submitted && (
            <p className="text-blue-100 text-sm font-medium">✓ Thank you! We'll notify you soon.</p>
          )}

          {/* Helper Text */}
          <p className="text-sm text-blue-100 tracking-wide">
            Early access for patients & free listing for doctors
          </p>
        </div>
      </section>

      {/* MAIN CONTENT - WHITE */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* PATIENT SECTION */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Heart className="text-blue-600" size={28} />
                <h2 className="text-3xl font-bold text-gray-900">Get Early Access</h2>
              </div>
              
              <p className="text-lg text-gray-700 leading-relaxed">
                Be the first to book appointments without waiting.
              </p>

              <div className="space-y-4 pt-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Skip the Queues</p>
                    <p className="text-gray-600 text-sm">Book your appointment instantly</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Trusted Doctors</p>
                    <p className="text-gray-600 text-sm">Verified medical professionals</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 font-bold">✓</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Instant Confirmation</p>
                    <p className="text-gray-600 text-sm">No confusion, no long waits</p>
                  </div>
                </div>
              </div>
            </div>

            {/* DOCTOR SECTION - HIGHLIGHTED */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Stethoscope className="text-blue-600" size={28} />
                <h2 className="text-3xl font-bold text-gray-900">For Doctors & Clinics</h2>
              </div>

              <p className="text-lg text-gray-700">
                List your clinic or hospital on DocBooking and get early visibility.
              </p>

              {/* Highlight */}
              <div className="bg-white rounded-lg p-4 border-l-4 border-blue-600">
                <p className="font-semibold text-blue-600">
                  Free early listing for a limited time
                </p>
              </div>

              {/* Doctor Benefits */}
              <div className="space-y-3 pt-4">
                <p className="text-sm text-gray-700">
                  • Get early visibility to Panipat patients
                </p>
                <p className="text-sm text-gray-700">
                  • Manage appointments seamlessly
                </p>
                <p className="text-sm text-gray-700">
                  • No commission during early launch
                </p>
              </div>

              {/* Doctor CTA Form */}
              <form onSubmit={handleDoctorSubmit} className="pt-6 border-t border-blue-200 space-y-3">
                <input
                  type="email"
                  placeholder="clinic@email.com"
                  value={doctorEmail}
                  onChange={(e) => setDoctorEmail(e.target.value)}
                  required
                  disabled={doctorLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-medium disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={doctorLoading}
                  className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {doctorLoading ? "Submitting..." : "Apply for Early Listing"}
                </button>
                {doctorError && (
                  <p className="text-center text-red-600 text-sm font-medium">
                    ✗ {doctorError}
                  </p>
                )}
                {doctorSubmitted && (
                  <p className="text-center text-green-600 text-sm font-medium">✓ Thanks! Our team will contact you.</p>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER MESSAGE */}
      <section className="py-16 border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">
            A message from the founder
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              DocBooking is being built to simplify how patients connect with trusted doctors.
            </p>
            <p>
              No confusion. No long waits. Just reliable healthcare access.
            </p>
            <p>
              We are starting with Panipat and inviting both patients and doctors to join early.
            </p>
          </div>

          <p className="text-gray-900 font-semibold">
            — Team DocBooking
          </p>
        </div>
      </section>

      {/* CONTACT EMAIL */}
      <section className="py-16 border-t border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <p className="text-gray-600">Have questions?</p>
          <a
            href="mailto:info@docbooking.in"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors"
          >
            <Mail size={20} />
            info@docbooking.in
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-200 bg-gray-50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <Link
                href="/terms-and-conditions"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Terms & Conditions
              </Link>
              <Link
                href="/privacy-policy"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/refund-policy"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Refund Policy
              </Link>
              <Link
                href="/cancellation-policy"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancellation Policy
              </Link>
            </div>

            {/* Copyright */}
            <div className="text-center border-t border-gray-300 pt-8">
              <p className="text-sm text-gray-600">
                &copy; 2026 DocBooking.in. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
