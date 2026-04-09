/**
 * Phone Verification Component (AiSensy WhatsApp OTP)
 * Production-ready component for OTP verification
 * 
 * Features:
 * - Phone input with validation
 * - Auto-focus on OTP fields
 * - Countdown timer for resend
 * - Loading states
 * - Error/success messages
 * - Cooldown period enforcement
 */

"use client";

import React, { useState, useRef, useEffect } from "react";

type Step = "phone" | "otp";

interface OTPResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
}

interface VerifyResponse {
  success: boolean;
  message: string;
  verified?: boolean;
}

interface PhoneVerificationProps {
  onVerified?: (phone: string) => void;
  onSessionToken?: (token: string) => void;
}

export default function PhoneVerification({
  onVerified,
  onSessionToken,
}: PhoneVerificationProps) {
  // State
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Refs
  const otpInputRef = useRef<HTMLInputElement>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const cooldownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
    };
  }, []);

  /**
   * Handle phone input - format as user types
   */
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    setPhone(value);
    setError("");
  };

  /**
   * Handle OTP input - only digits, max 6
   */
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 6) value = value.slice(0, 6);
    setOtp(value);
    setError("");

    // Auto-submit if 6 digits entered
    if (value.length === 6) {
      handleVerifyOTP(new Event("submit") as any, value);
    }
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data: OTPResponse = await response.json();

      if (!response.ok) {
        // Handle cooldown error specifically
        if (response.status === 429) {
          setError("Please wait before requesting another OTP");
          setResendCooldown(30); // 30 second cooldown
          startCooldownTimer();
        } else {
          setError(data.message || "Failed to send OTP");
        }
        setLoading(false);
        return;
      }

      // Success - move to OTP step
      setSuccess("✓ OTP sent to your WhatsApp");
      setStep("otp");
      setCountdown(data.expiresIn || 300);
      startCountdownTimer();

      // Focus OTP input
      setTimeout(() => {
        otpInputRef.current?.focus();
      }, 100);
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Send OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify OTP
   */
  const handleVerifyOTP = async (e: React.FormEvent, otpToUse?: string) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const finalOtp = otpToUse || otp;

    if (!finalOtp || finalOtp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          otp: finalOtp,
        }),
      });

      const data: VerifyResponse = await response.json();

      if (!response.ok) {
        setError(data.message || "OTP verification failed");
        setLoading(false);
        return;
      }

      // Success
      setSuccess("✓ Phone verified successfully!");

      // Generate basic session token
      const sessionToken = btoa(JSON.stringify({ phone, verified: true, timestamp: Date.now() }));

      // Call callbacks
      if (onVerified) onVerified(phone);
      if (onSessionToken) onSessionToken(sessionToken);

      // Reset after delay
      setTimeout(() => {
        setStep("phone");
        setPhone("");
        setOtp("");
        setSuccess("");
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
    setOtp("");
    await handleSendOTP(new Event("submit") as any);
  };

  /**
   * Start countdown timer
   */
  const startCountdownTimer = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  /**
   * Start cooldown timer for resend
   */
  const startCooldownTimer = () => {
    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);

    cooldownIntervalRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {step === "phone" ? "Verify Your Phone" : "Enter OTP"}
      </h2>

      {/* Error Alert */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm font-medium">{success}</p>
        </div>
      )}

      {step === "phone" ? (
        // ========== PHONE STEP ==========
        <form onSubmit={handleSendOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
              <span className="px-3 py-2 bg-gray-100 text-gray-600 text-sm font-semibold whitespace-nowrap">
                +91
              </span>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                maxLength={10}
                className="flex-1 px-4 py-2.5 outline-none text-gray-900 placeholder-gray-400"
                disabled={loading}
                autoFocus
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Enter your 10-digit Indian mobile number
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

          <p className="text-xs text-gray-600 text-center">
            We&apos;ll send a one-time password to your WhatsApp
          </p>
        </form>
      ) : (
        // ========== OTP STEP ==========
        <form onSubmit={handleVerifyOTP} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP Code
            </label>
            <input
              ref={otpInputRef}
              type="text"
              value={otp}
              onChange={handleOtpChange}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 text-3xl text-center font-semibold tracking-widest border-2 border-gray-300 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-300"
              disabled={loading}
              inputMode="numeric"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              Enter the 6-digit code from WhatsApp
            </p>
          </div>

          {/* Timer */}
          <div>
            {countdown > 0 ? (
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">OTP expires in:</span>
                <span className="text-lg font-bold text-blue-600">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
              </div>
            ) : (
              <div className="p-2 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600 font-semibold">OTP expired</p>
              </div>
            )}
          </div>

          {/* Verify Button */}
          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setCountdown(0);
                if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
              }}
              className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={loading || resendCooldown > 0}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              {resendCooldown > 0 ? `Wait ${resendCooldown}s` : "Resend OTP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
