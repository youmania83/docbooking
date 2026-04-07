"use client";

/**
 * LoadingDoctors
 * Lightweight micro-animation component for doctor listing
 * - Pure CSS animation (GPU-optimized)
 * - Premium micro-interactions
 * - <1KB overhead
 */

import { Stethoscope } from "lucide-react";

export default function LoadingDoctors() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
      <div className="text-center space-y-6 max-w-md px-4">
        {/* Animated Medical Icon */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            {/* Outer rotating ring */}
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-600 border-r-blue-300"
              style={{
                animation: "spin 3s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite",
              }}
            ></div>

            {/* Inner pulsing icon */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                animation: "pulse-scale 2s ease-in-out infinite",
              }}
            >
              <Stethoscope size={40} className="text-blue-600" />
            </div>

            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-1 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Loading Text with subtle animation */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-gray-900">
            Finding best doctors for you...
          </h3>
          <p className="text-sm text-gray-500">
            We're searching our network of verified healthcare professionals
          </p>
        </div>

        {/* Animated Dots */}
        <div className="flex justify-center gap-1.5">
          <div
            className="w-2 h-2 bg-blue-600 rounded-full"
            style={{
              animation: "bounce 1.4s infinite",
              animationDelay: "0s",
            }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full"
            style={{
              animation: "bounce 1.4s infinite",
              animationDelay: "0.2s",
            }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-200 rounded-full"
            style={{
              animation: "bounce 1.4s infinite",
              animationDelay: "0.4s",
            }}
          ></div>
        </div>

        {/* CSS Animations */}
        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes pulse-scale {
            0%,
            100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.1);
              opacity: 0.8;
            }
          }

          @keyframes bounce {
            0%,
            100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-8px);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
