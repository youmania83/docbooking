"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-4 mb-6">
              <img
                src="/logos/docbooking-logo-primary.svg"
                alt="DocBooking"
                className="h-16 w-auto"
              />
            </div>
            
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Skip OPD Queues in Panipat
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Book doctor appointments instantly & avoid long waiting times.
                Get access to top medical professionals at your convenience.
              </p>
            </div>

            <Link href="/doctors">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-3 text-lg">
                Book Appointment
                <ArrowRight size={24} />
              </button>
            </Link>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold text-blue-600">4+</p>
                <p className="text-sm text-gray-600 mt-2">Specialists</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">100%</p>
                <p className="text-sm text-gray-600 mt-2">Verified</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">24/7</p>
                <p className="text-sm text-gray-600 mt-2">Support</p>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <Clock className="text-blue-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Instant Booking
              </h3>
              <p className="text-gray-600">
                Book your appointment in seconds without standing in queues
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <Shield className="text-blue-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Safe & Verified
              </h3>
              <p className="text-gray-600">
                All doctors are certified and verified medical professionals
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
              <MapPin className="text-blue-600 mb-4" size={40} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Panipat Based
              </h3>
              <p className="text-gray-600">
                Find the best doctors in your locality with ease
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="mb-4">
                <img
                  src="/logos/docbooking-logo-dark-bg.svg"
                  alt="DocBooking"
                  className="h-12 w-auto"
                />
              </div>
              <p className="text-gray-400">
                Making healthcare accessible for everyone in Panipat
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/doctors" className="hover:text-white">
                    Browse Doctors
                  </Link>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-4">Contact</h4>
              <p className="text-gray-400">Panipat, India</p>
              <p className="text-gray-400">demo@docbooking.in</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 DocBooking.in. All rights reserved. Demo Version</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
