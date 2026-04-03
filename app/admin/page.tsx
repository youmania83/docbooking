"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, Loader } from "lucide-react";

interface FormData {
  name: string;
  qualification: string;
  experience: string;
  address: string;
  googleLocation: string;
  phone: string;
  opdFees: string;
  specialty: string;
  slots: string;
}

export default function AdminPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    qualification: "",
    experience: "",
    address: "",
    googleLocation: "",
    phone: "",
    opdFees: "",
    specialty: "",
    slots: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Parse slots from comma-separated string
      const slotsArray = formData.slots
        .split(",")
        .map((slot) => slot.trim())
        .filter((slot) => slot.length > 0);

      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          opdFees: Number(formData.opdFees),
          slots: slotsArray,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({
          type: "success",
          text: "Doctor added successfully!",
        });
        setFormData({
          name: "",
          qualification: "",
          experience: "",
          address: "",
          googleLocation: "",
          phone: "",
          opdFees: "",
          specialty: "",
          slots: "",
        });
      } else {
        setMessage({
          type: "error",
          text: data.message || "Failed to add doctor",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Admin Panel
          </h1>
          <p className="text-lg text-gray-600">
            Add new doctors to the system
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8">
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-gap-3 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200"
                  : "bg-red-50 border border-red-200"
              }`}
            >
              {message.type === "success" ? (
                <CheckCircle2 className="text-green-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="text-red-600 flex-shrink-0" />
              )}
              <p
                className={`ml-3 ${
                  message.type === "success"
                    ? "text-green-800"
                    : "text-red-800"
                }`}
              >
                {message.text}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="Dr. John Doe"
              />
            </div>

            {/* Qualification */}
            <div>
              <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-2">
                Qualification *
              </label>
              <input
                type="text"
                id="qualification"
                name="qualification"
                value={formData.qualification}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="MD, MBBS"
              />
            </div>

            {/* Experience */}
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                Experience *
              </label>
              <input
                type="text"
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="10 years"
              />
            </div>

            {/* Specialty */}
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-2">
                Specialty *
              </label>
              <input
                type="text"
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="General Physician"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Address *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="Clinic address"
              />
            </div>

            {/* Google Location */}
            <div>
              <label htmlFor="googleLocation" className="block text-sm font-medium text-gray-700 mb-2">
                Google Location Link *
              </label>
              <input
                type="url"
                id="googleLocation"
                name="googleLocation"
                value={formData.googleLocation}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="https://maps.google.com/..."
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="+91 9876543210"
              />
            </div>

            {/* OPD Fees */}
            <div>
              <label htmlFor="opdFees" className="block text-sm font-medium text-gray-700 mb-2">
                OPD Fees *
              </label>
              <input
                type="number"
                id="opdFees"
                name="opdFees"
                value={formData.opdFees}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="300"
              />
            </div>

            {/* Slots */}
            <div>
              <label htmlFor="slots" className="block text-sm font-medium text-gray-700 mb-2">
                Available Slots (comma separated)
              </label>
              <input
                type="text"
                id="slots"
                name="slots"
                value={formData.slots}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-900"
                placeholder="10:00 AM, 11:30 AM, 1:00 PM"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={20} className="animate-spin" />}
              {loading ? "Adding Doctor..." : "Add Doctor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
