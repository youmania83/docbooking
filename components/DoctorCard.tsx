"use client";

import { Doctor } from "@/lib/data";
import Link from "next/link";

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {doctor.name}
        </h3>
        <p className="text-sm text-blue-600 font-medium mb-4">
          {doctor.specialty}
        </p>
        <p className="text-lg font-bold text-gray-900 mb-6">
          ₹{doctor.fee}
          <span className="text-xs font-normal text-gray-500 ml-1">
            per visit
          </span>
        </p>
        <Link href={`/doctor/${doctor.id}`}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200">
            View & Book
          </button>
        </Link>
      </div>
    </div>
  );
}
