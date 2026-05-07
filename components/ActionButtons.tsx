"use client";

import { Phone, MessageCircle } from "lucide-react";

interface ActionButtonsProps {
  phone: string;
  doctorName: string;
  /** "full" = inline row of buttons, "sticky" = mobile fixed bottom bar */
  variant?: "full" | "sticky";
}

export default function ActionButtons({
  phone,
  doctorName,
  variant = "full",
}: ActionButtonsProps) {
  const encodedName = encodeURIComponent(doctorName);
  const whatsappUrl = `https://wa.me/919310837724?text=Hi%20I%20want%20to%20book%20an%20appointment%20with%20${encodedName}`;
  const callUrl = `tel:${phone}`;

  if (variant === "sticky") {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl md:hidden">
        <div className="flex gap-3 max-w-sm mx-auto">
          <a
            href={callUrl}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-blue-600 text-blue-600 font-semibold rounded-xl transition-all duration-200 active:scale-95 text-sm"
          >
            <Phone size={17} />
            Call Clinic
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 active:scale-95 text-sm shadow-md"
          >
            <MessageCircle size={17} />
            Book Appointment
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95"
      >
        <MessageCircle size={18} />
        Book Appointment
      </a>
      <a
        href={callUrl}
        className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-gray-50 text-gray-800 font-semibold rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
      >
        <Phone size={18} />
        Call Clinic
      </a>
    </div>
  );
}
