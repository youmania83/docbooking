/**
 * OTP Authentication Component
 * Production-ready WhatsApp OTP verification using WATI API
 * 
 * Features:
 * - Phone number validation (Indian numbers)
 * - OTP generation and sending
 * - OTP verification with countdown timer
 * - Resend functionality with rate limiting
 * - Error handling and user feedback
 * - Loading states
 */

"use client";

import React, { useState } from "react";

type Step = "phone" | "otp";

interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

interface VerifyResponse {
  success: boolean;
  message: string;
}

const OTPVerificationForm: React.FC<{
  onVerified?: (phone: string) => void;
}> = ({ onVerified }) => {
  // State management
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  /**
   * Handle phone number input
   * Formats and validates in real-time
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits

    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Format as: XXXXXXXXXX
    setPhone(value);
    setError("");
  };

  /**
   * Handle OTP input
   * Accepts only digits, max 6
   */
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits

    if (value.length > 6) {
      value = value.slice(0, 6);
    }

    setOtp(value);
    setError("");
  };

  /**
   * Send OTP to phone number
   */
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!phone || phone.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone, // Can be +91XXXXXXXXXX or XXXXXXXXXX
        }),
      });

      const data: OTPResponse = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to send OTP. Please try again.");
        setLoading(false);
        return;
      }

      // Success - start countdown timer
      setSuccess("✓ OTP sent to your WhatsApp");
      setStep("otp");
      setCountdown(data.expiresIn || 300); // 5 minutes
      setResendCountdown(30); // 30 seconds before resend

      // Start OTP expiry countdown
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start resend button cooldown
      const resendTimer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(resendTimer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
      console.error("Send OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP
   */
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    if (!termsAccepted) {
      setError("Please accept Terms & Conditions to proceed");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone,
          otp: otp,
          terms_accepted: termsAccepted,
        }),
      });

      const data: VerifyResponse = await response.json();

      if (!response.ok) {
        setError(data.message || "OTP verification failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success
      setSuccess("✓ Phone number verified successfully!");
      
      // Call callback if provided
      if (onVerified) {
        onVerified(phone);
      }

      // Reset for next use
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setSuccess("");
        setTermsAccepted(false);
      }, 2000);
    } catch (err) {
      setError("Verification failed. Please try again.");
      console.error("Verify OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Resend OTP
   */
  const handleResendOTP = async () => {
    setError("");
    setSuccess("");
    setOtp("");
    setTermsAccepted(false);
    await handleSendOTP(new Event("submit") as any);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {step === "phone" ? "Enter Your Phone" : "Enter OTP"}
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{success}</p>
        </div>
      )}

      {step === "phone" ? (
        // PHONE INPUT STEP
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
              <span className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-semibold">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 px-4 py-2 outline-none text-gray-900"
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter your 10-digit Indian phone number
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-xs text-gray-600 text-center">
            We'll send a one-time password to your WhatsApp
          </p>
        </form>
      ) : (
        // OTP INPUT STEP
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-2 text-2xl tracking-widest text-center border border-gray-300 rounded-lg outline-none focus:border-blue-500"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit code sent to your WhatsApp
            </p>
          </div>

          {/* Countdown Timer */}
          {countdown > 0 ? (
            <p className="text-sm text-gray-700">
              OTP expires in:{" "}
              <span className="font-bold text-blue-600">
                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
              </span>
            </p>
          ) : (
            <p className="text-sm text-red-600 font-semibold">OTP expired</p>
          )}

          {/* Terms & Conditions Checkbox */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                disabled={loading}
                className="mt-1 w-4 h-4 accent-blue-600"
              />
              <div className="text-sm text-gray-700">
                <p>
                  I agree to the{" "}
                  <a
                    href="/terms-and-conditions"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Terms & Conditions
                  </a>
                  {" "}and{" "}
                  <a
                    href="/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    Privacy Policy
                  </a>
                </p>
              </div>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || !termsAccepted}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setCountdown(0);
                setResendCountdown(0);
              }}
              className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || resendCountdown > 0}
              className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default OTPVerificationForm;
