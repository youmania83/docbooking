"use client";

import { CheckCircle2 } from "lucide-react";

interface StickyAppointmentCTAProps {
  doctorName: string;
  opdFees: number;
  selectedDate: Date | null;
  selectedTime: string | null;
  isLoading?: boolean;
  onProceed: () => void;
}

export default function StickyAppointmentCTA({
  doctorName,
  opdFees,
  selectedDate,
  selectedTime,
  isLoading = false,
  onProceed,
}: StickyAppointmentCTAProps) {
  const isComplete = selectedDate && selectedTime;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Info Section */}
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{opdFees}
                </p>
              </div>
              {isComplete && (
                <>
                  <div className="hidden sm:block w-px h-12 bg-gray-200" />
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={20} />
                    <span className="font-semibold">Instant Confirmation</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Button Section */}
          <button
            onClick={onProceed}
            disabled={!isComplete || isLoading}
            className={`flex-shrink-0 px-6 py-3 rounded-lg font-semibold text-base transition-all duration-200 whitespace-nowrap ${
              isComplete && !isLoading
                ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg active:bg-blue-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Processing..." : "Proceed →"}
          </button>
        </div>
      </div>
    </div>
  );
}
