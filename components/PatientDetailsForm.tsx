"use client";

import { useState } from "react";
import { User, Phone, AlertCircle } from "lucide-react";

export interface PatientDetails {
  name: string;
  age: string;
  gender: string;
  mobileNumber: string;
}

interface PatientDetailsFormProps {
  onSubmit: (details: PatientDetails) => void;
  isLoading?: boolean;
}

export default function PatientDetailsForm({
  onSubmit,
  isLoading = false,
}: PatientDetailsFormProps) {
  const [formData, setFormData] = useState<PatientDetails>({
    name: "",
    age: "",
    gender: "",
    mobileNumber: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Age validation
    if (!formData.age.trim()) {
      newErrors.age = "Age is required";
    } else {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 1 || age > 150) {
        newErrors.age = "Please enter a valid age (1-150)";
      }
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }

    // Mobile number validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(formData.mobileNumber.replace(/\D/g, ""))) {
      newErrors.mobileNumber = "Please enter a valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <User size={24} className="text-blue-600" />
        Patient Details
      </h2>
      <p className="text-gray-600 mb-8">
        Please provide your information to complete the booking
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
            Full Name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
            disabled={isLoading}
          />
          {errors.name && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {errors.name}
            </div>
          )}
        </div>

        {/* Age Field */}
        <div>
          <label htmlFor="age" className="block text-sm font-semibold text-gray-900 mb-2">
            Age <span className="text-red-600">*</span>
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            placeholder="Enter your age"
            min="1"
            max="150"
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.age
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
            disabled={isLoading}
          />
          {errors.age && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {errors.age}
            </div>
          )}
        </div>

        {/* Gender Field */}
        <div>
          <label htmlFor="gender" className="block text-sm font-semibold text-gray-900 mb-2">
            Gender <span className="text-red-600">*</span>
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.gender
                ? "border-red-500 focus:border-red-500"
                : "border-gray-200 hover:border-gray-300"
            }`}
            disabled={isLoading}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          {errors.gender && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {errors.gender}
            </div>
          )}
        </div>

        {/* Mobile Number Field */}
        <div>
          <label htmlFor="mobileNumber" className="block text-sm font-semibold text-gray-900 mb-2">
            Mobile Number <span className="text-red-600">*</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-600 font-semibold">+91</span>
            <input
              type="tel"
              id="mobileNumber"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="Enter 10-digit number"
              maxLength={10}
              className={`flex-1 px-4 py-3 rounded-lg border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.mobileNumber
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 hover:border-gray-300"
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.mobileNumber && (
            <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
              <AlertCircle size={16} />
              {errors.mobileNumber}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 ${
            isLoading
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl cursor-pointer"
          }`}
        >
          {isLoading ? "Processing..." : "Proceed to Confirmation"}
        </button>
      </form>
    </div>
  );
}
