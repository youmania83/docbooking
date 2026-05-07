"use client";

import { FormEvent, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader, LogOut, Eye, Users, CalendarDays, IndianRupee, Phone, ChevronDown, ChevronRight, RefreshCw } from "lucide-react";

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
    opdFees?: number;
  };
  slot: string;
  appointmentDate: string;
  appointmentTime: string;
  createdAt: string;
}

type ViewMode = "summary" | "by-doctor" | "by-day" | "all";

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"add-doctor" | "bookings">("add-doctor");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("summary");
  const [expandedDoctor, setExpandedDoctor] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [filterDoctor, setFilterDoctor] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
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

  // ── Analytics computations ──────────────────────────────────────────────
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  }, []);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const apptDay = b.appointmentDate ? b.appointmentDate.slice(0, 10) : b.createdAt.slice(0, 10);
      if (filterDoctor && b.doctorId._id !== filterDoctor) return false;
      if (filterDate && apptDay !== filterDate) return false;
      return true;
    });
  }, [bookings, filterDoctor, filterDate]);

  const todayBookings = useMemo(
    () => bookings.filter((b) => {
      const apptDay = b.appointmentDate ? b.appointmentDate.slice(0, 10) : b.createdAt.slice(0, 10);
      return apptDay === todayStr;
    }),
    [bookings, todayStr]
  );

  const totalRevenue = useMemo(
    () => bookings.reduce((sum, b) => sum + (b.doctorId.opdFees || 0), 0),
    [bookings]
  );

  const byDoctor = useMemo(() => {
    const map: Record<string, { doctorId: string; doctorName: string; specialty: string; bookings: Booking[] }> = {};
    filteredBookings.forEach((b) => {
      const id = b.doctorId._id;
      if (!map[id]) map[id] = { doctorId: id, doctorName: b.doctorId.name, specialty: b.doctorId.specialty, bookings: [] };
      map[id].bookings.push(b);
    });
    return Object.values(map).sort((a, b) => b.bookings.length - a.bookings.length);
  }, [filteredBookings]);

  const byDay = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    filteredBookings.forEach((b) => {
      const day = b.appointmentDate ? b.appointmentDate.slice(0, 10) : b.createdAt.slice(0, 10);
      if (!map[day]) map[day] = [];
      map[day].push(b);
    });
    return Object.entries(map)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([day, bks]) => ({ day, bookings: bks }));
  }, [filteredBookings]);

  const uniqueDoctors = useMemo(() => {
    const seen = new Map<string, { id: string; name: string }>();
    bookings.forEach((b) => seen.set(b.doctorId._id, { id: b.doctorId._id, name: b.doctorId.name }));
    return Array.from(seen.values());
  }, [bookings]);

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
              📋 Bookings & Analytics
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
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-blue-100 rounded-lg p-2"><CalendarDays size={20} className="text-blue-600" /></div>
                  <p className="text-sm text-gray-500">Today&apos;s Bookings</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{todayBookings.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-green-100 rounded-lg p-2"><Users size={20} className="text-green-600" /></div>
                  <p className="text-sm text-gray-500">Total Bookings</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{bookings.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-purple-100 rounded-lg p-2"><IndianRupee size={20} className="text-purple-600" /></div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">₹{totalRevenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-orange-100 rounded-lg p-2"><Eye size={20} className="text-orange-600" /></div>
                  <p className="text-sm text-gray-500">Doctors Active</p>
                </div>
                <p className="text-3xl font-bold text-gray-900">{uniqueDoctors.length}</p>
              </div>
            </div>

            {/* Filters + View Toggle */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                  <select
                    value={filterDoctor}
                    onChange={(e) => setFilterDoctor(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Doctors</option>
                    {uniqueDoctors.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {(filterDoctor || filterDate) && (
                    <button
                      onClick={() => { setFilterDoctor(""); setFilterDate(""); }}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
                {/* Refresh */}
                <button
                  onClick={fetchBookings}
                  disabled={bookingsLoading}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold"
                >
                  <RefreshCw size={16} className={bookingsLoading ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {/* View Mode Tabs */}
              <div className="flex gap-2 mt-4 flex-wrap">
                {(["summary", "by-doctor", "by-day", "all"] as ViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                      viewMode === mode
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {mode === "summary" ? "📊 Summary" : mode === "by-doctor" ? "👨‍⚕️ By Doctor" : mode === "by-day" ? "📅 By Day" : "📋 All Patients"}
                  </button>
                ))}
              </div>
            </div>

            {bookingsLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center p-12">
                <Loader className="animate-spin text-blue-600 mr-2" size={24} />
                <p className="text-gray-600">Loading bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 text-center p-12">
                <Eye size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-600 text-lg">No bookings yet</p>
              </div>
            ) : (
              <>
                {/* ── SUMMARY VIEW ── */}
                {viewMode === "summary" && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-800">Today&apos;s Appointments ({todayStr})</h2>
                    {todayBookings.length === 0 ? (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">No appointments today</div>
                    ) : (
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Doctor</th>
                              <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {todayBookings.map((b, i) => (
                              <tr key={b._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                <td className="px-4 py-3 font-medium text-gray-900">{b.patientName} <span className="text-gray-400 font-normal">({b.age}/{b.gender.charAt(0)})</span></td>
                                <td className="px-4 py-3">
                                  <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                                    <Phone size={14} /> {b.phone}
                                  </a>
                                </td>
                                <td className="px-4 py-3 text-gray-700">{b.doctorId.name}</td>
                                <td className="px-4 py-3 font-semibold text-blue-600">{b.appointmentTime || b.slot}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    <h2 className="text-lg font-bold text-gray-800 pt-2">Doctor-wise Total</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {byDoctor.map((d) => (
                        <div key={d.doctorId} className="bg-white rounded-xl border border-gray-200 p-5 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{d.doctorName}</p>
                            <p className="text-sm text-gray-500">{d.specialty}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-600">{d.bookings.length}</p>
                            <p className="text-xs text-gray-400">bookings</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── BY DOCTOR VIEW ── */}
                {viewMode === "by-doctor" && (
                  <div className="space-y-4">
                    {byDoctor.length === 0 ? (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">No bookings match filters</div>
                    ) : byDoctor.map((d) => (
                      <div key={d.doctorId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => setExpandedDoctor(expandedDoctor === d.doctorId ? null : d.doctorId)}
                          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                              {d.doctorName.charAt(0)}
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-gray-900">{d.doctorName}</p>
                              <p className="text-sm text-gray-500">{d.specialty}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="bg-blue-100 text-blue-700 font-bold text-lg px-4 py-1 rounded-full">{d.bookings.length} bookings</span>
                            {expandedDoctor === d.doctorId ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </div>
                        </button>
                        {expandedDoctor === d.doctorId && (
                          <div className="border-t border-gray-200 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">#</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Patient</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Phone</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Age/Gender</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Appt. Date</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {d.bookings.map((b, i) => (
                                  <tr key={b._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{b.patientName}</td>
                                    <td className="px-4 py-3">
                                      <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                                        <Phone size={13} /> {b.phone}
                                      </a>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{b.age} / {b.gender}</td>
                                    <td className="px-4 py-3 text-gray-700">
                                      {b.appointmentDate
                                        ? new Date(b.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                        : "—"}
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-blue-600">{b.appointmentTime || b.slot}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── BY DAY VIEW ── */}
                {viewMode === "by-day" && (
                  <div className="space-y-4">
                    {byDay.length === 0 ? (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-500">No bookings match filters</div>
                    ) : byDay.map(({ day, bookings: dayBookings }) => (
                      <div key={day} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => setExpandedDay(expandedDay === day ? null : day)}
                          className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-green-100 rounded-lg p-2"><CalendarDays size={20} className="text-green-600" /></div>
                            <div className="text-left">
                              <p className="font-bold text-gray-900">
                                {new Date(day + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                              </p>
                              {day === todayStr && <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Today</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="bg-green-100 text-green-700 font-bold text-lg px-4 py-1 rounded-full">{dayBookings.length} patients</span>
                            {expandedDay === day ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          </div>
                        </button>
                        {expandedDay === day && (
                          <div className="border-t border-gray-200 overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">#</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Patient</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Phone</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Age/Gender</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Doctor</th>
                                  <th className="px-4 py-2 text-left font-semibold text-gray-600">Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {dayBookings
                                  .sort((a, b) => (a.appointmentTime || a.slot || "").localeCompare(b.appointmentTime || b.slot || ""))
                                  .map((b, i) => (
                                  <tr key={b._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                    <td className="px-4 py-3 text-gray-400">{i + 1}</td>
                                    <td className="px-4 py-3 font-medium text-gray-900">{b.patientName}</td>
                                    <td className="px-4 py-3">
                                      <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                                        <Phone size={13} /> {b.phone}
                                      </a>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{b.age} / {b.gender}</td>
                                    <td className="px-4 py-3 text-gray-700">{b.doctorId.name}</td>
                                    <td className="px-4 py-3 font-semibold text-blue-600">{b.appointmentTime || b.slot}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* ── ALL PATIENTS VIEW ── */}
                {viewMode === "all" && (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                      <p className="font-semibold text-gray-700">Showing {filteredBookings.length} of {bookings.length} bookings</p>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Patient</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Phone</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Age/Gender</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Doctor</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Appt. Date</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Time</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Booked On</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map((b, i) => (
                            <tr key={b._id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                              <td className="px-4 py-3 font-medium text-gray-900">{b.patientName}</td>
                              <td className="px-4 py-3">
                                <a href={`tel:${b.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline font-medium">
                                  <Phone size={13} /> {b.phone}
                                </a>
                              </td>
                              <td className="px-4 py-3 text-gray-600">{b.age} / {b.gender}</td>
                              <td className="px-4 py-3 text-gray-700">{b.doctorId.name}</td>
                              <td className="px-4 py-3 text-gray-700">
                                {b.appointmentDate
                                  ? new Date(b.appointmentDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                                  : "—"}
                              </td>
                              <td className="px-4 py-3 font-semibold text-blue-600">{b.appointmentTime || b.slot}</td>
                              <td className="px-4 py-3 text-gray-500">
                                {new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
