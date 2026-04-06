"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader, LogOut, Eye } from "lucide-react";

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

interface FormErrors {
  [key: string]: string;
}

interface Booking {
  _id: string;
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  doctorId: {
    _id: string;
    name: string;
    specialty: string;
  };
  slot: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"add-doctor" | "bookings">("add-doctor");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch bookings when tab is opened
  useEffect(() => {
    if (activeTab === "bookings") {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await fetch("/api/bookings");
      const data = await response.json();
      if (data.success) {
        setBookings(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!formData.qualification.trim() || formData.qualification.trim().length < 2) {
      newErrors.qualification = "Qualification must be at least 2 characters";
    }

    if (!formData.experience.trim() || formData.experience.trim().length < 2) {
      newErrors.experience = "Experience must be at least 2 characters";
    }

    if (!formData.specialty.trim() || formData.specialty.trim().length < 2) {
      newErrors.specialty = "Specialty must be at least 2 characters";
    }

    if (!formData.address.trim() || formData.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters";
    }

    if (!formData.googleLocation.trim() || !formData.googleLocation.startsWith("http")) {
      newErrors.googleLocation = "Please provide a valid Google Location URL";
    }

    if (!formData.phone.trim() || !/^[+]?[0-9\s\-]{10,}$/.test(formData.phone)) {
      newErrors.phone = "Please provide a valid phone number";
    }

    if (!formData.opdFees.trim() || isNaN(Number(formData.opdFees)) || Number(formData.opdFees) < 0) {
      newErrors.opdFees = "Please provide a valid OPD fee";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Parse and validate slots
      const slotsArray = formData.slots
        .split(",")
        .map((slot) => slot.trim())
        .filter((slot) => slot.length > 0);

      if (slotsArray.length === 0) {
        setMessage({
          type: "error",
          text: "Please provide at least one slot",
        });
        setLoading(false);
        return;
      }

      const response = await fetch("/api/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          qualification: formData.qualification.trim(),
          experience: formData.experience.trim(),
          specialty: formData.specialty.trim(),
          address: formData.address.trim(),
          googleLocation: formData.googleLocation.trim(),
          phone: formData.phone.trim(),
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
        text: "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLogoutLoading(true);
    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (response.ok) {
        router.push("/admin/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setLogoutLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Logout */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-lg text-gray-600">
              Manage doctors and view bookings
            </p>
          </div>
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
          >
            {logoutLoading && <Loader size={18} className="animate-spin" />}
            <LogOut size={18} />
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("add-doctor")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === "add-doctor"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              ➕ Add Doctor
            </button>
            <button
              onClick={() => setActiveTab("bookings")}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors ${
                activeTab === "bookings"
                  ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              📋 View Bookings
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "add-doctor" && (
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-900 ${
                    errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Dr. John Doe"
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-900 ${
                    errors.qualification ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="MD, MBBS"
                />
                {errors.qualification && <p className="text-red-600 text-sm mt-1">{errors.qualification}</p>}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-900 ${
                    errors.experience ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="10 years"
                />
                {errors.experience && <p className="text-red-600 text-sm mt-1">{errors.experience}</p>}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-900 ${
                    errors.specialty ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="General Physician"
                />
                {errors.specialty && <p className="text-red-600 text-sm mt-1">{errors.specialty}</p>}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-900 ${
                    errors.address ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Clinic address"
                />
                {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-900 ${
                    errors.googleLocation ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="https://maps.google.com/..."
                />
                {errors.googleLocation && <p className="text-red-600 text-sm mt-1">{errors.googleLocation}</p>}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-900 ${
                    errors.phone ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="+91 9876543210"
                />
                {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition text-gray-900 ${
                    errors.opdFees ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="300"
                />
                {errors.opdFees && <p className="text-red-600 text-sm mt-1">{errors.opdFees}</p>}
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
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {bookingsLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader className="animate-spin text-blue-600 mr-2" size={24} />
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center p-12">
                <Eye size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg">No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Patient Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Doctor</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Specialty</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Time Slot</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Age/Gender</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phone</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Booking Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, index) => (
                      <tr key={booking._id} className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{booking.patientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{booking.doctorId.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{booking.doctorId.specialty}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{booking.slot}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{booking.age} / {booking.gender}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">+91 {booking.phone}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(booking.createdAt).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
