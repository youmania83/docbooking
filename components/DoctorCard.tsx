import Link from "next/link";

interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  opdFees: number;
  slots: string[];
  qualification: string;
  experience: string;
  address: string;
  phone: string;
  googleLocation: string;
}

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
        <p className="text-sm text-blue-600 font-medium mb-1">
          {doctor.specialty}
        </p>
        <p className="text-xs text-gray-500 mb-4">
          {doctor.experience}
        </p>
        <p className="text-lg font-bold text-gray-900 mb-6">
          ₹{doctor.opdFees}
          <span className="text-xs font-normal text-gray-500 ml-1">
            per visit
          </span>
        </p>
        <Link href={`/doctor/${doctor._id}`}>
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors duration-200">
            View & Book
          </button>
        </Link>
      </div>
    </div>
  );
}
