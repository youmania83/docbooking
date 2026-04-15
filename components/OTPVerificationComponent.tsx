/**
 * OTP Verification Component - Production Ready
 * Integrated with new OTP v3 service + failover + security
 * 
 * Usage:
 * <OTPVerificationComponent 
 *   phoneNumber="9876543210"
 *   onVerificationSuccess={(phone) => handleSuccess(phone)}
 *   onVerificationError={(error) => handleError(error)}
 * />
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface OTPVerificationProps {
  phoneNumber: string;
  onVerificationSuccess?: (phone: string) => void;
  onVerificationError?: (error: string) => void;
  onClose?: () => void;
}

interface SendOTPResponse {
  success: boolean;
  data?: {
    phone: string;
    channel: "whatsapp" | "sms";
    message: string;
    expiresIn: number;
    otp?: string; // Development only
  };
  error?: string;
}

interface VerifyOTPResponse {
  success: boolean;
  data?: {
    phone: string;
    verified: boolean;
    message: string;
  };
  error?: string;
}

const OTPVerificationComponent = ({
  phoneNumber,
  onVerificationSuccess,
  onVerificationError,
  onClose,
}: OTPVerificationProps) => {
  // State
  const [step, setStep] = useState<"sending" | "verifying" | "success">(
    "sending"
  );
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [otpDeliveryChannel, setOtpDeliveryChannel] = useState<
    "whatsapp" | "sms" | null
  >(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(300);

  // Send OTP
  const handleSendOTP = useCallback(async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          userName: "DocBooking User",
        }),
      });

      const data: SendOTPResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Failed to send OTP");
        onVerificationError?.(data.error || "OTP send failed");
        return;
      }

      // Success
      setOtpDeliveryChannel(data.data?.channel || "whatsapp");
      setOtpExpiresIn(data.data?.expiresIn || 300);
      setSuccess(
        `OTP sent via ${data.data?.channel === "sms" ? "SMS" : "WhatsApp"}`
      );
      setStep("verifying");
      setResendCountdown(30);

      // Dev mode: Show OTP
      if (data.data?.otp && process.env.NODE_ENV === "development") {
        console.log(`🐛 DEV: OTP is ${data.data.otp}`);
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Network error occurred";
      setError(errorMsg);
      onVerificationError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, onVerificationError]);

  // Verify OTP
  const handleVerifyOTP = useCallback(async () => {
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }

    if (!termsAccepted) {
      setError("You must accept the Terms & Conditions");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phoneNumber,
          otp: otp,
          terms_accepted: termsAccepted,
        }),
      });

      const data: VerifyOTPResponse = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Invalid OTP");
        return;
      }

      // Success
      setSuccess("OTP verified successfully!");
      setStep("success");
      setOtp("");
      onVerificationSuccess?.(phoneNumber);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Verification failed";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [phoneNumber, otp, termsAccepted, onVerificationSuccess]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(
        () => setResendCountdown(resendCountdown - 1),
        1000
      );
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Auto-trigger OTP send on mount
  useEffect(() => {
    handleSendOTP();
  }, [handleSendOTP]);

  // Handle OTP input change
  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");

    // Auto-submit when 6 digits entered
    if (value.length === 6) {
      setTimeout(() => handleVerifyOTP(), 100);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Verify Your Phone</h2>
        <p className="text-sm text-gray-600 mt-1">
          +91{phoneNumber.replace(/\D/g, "").slice(-10)}
        </p>
      </div>

      {/* Success State */}
      {step === "success" && (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-200 rounded-lg text-center">
            <p className="text-green-700 font-semibold">✅ Verified!</p>
            <p className="text-sm text-green-600 mt-1">
              Your phone number has been verified successfully.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Continue Booking
          </button>
        </div>
      )}

      {/* Verification Step */}
      {step === "verifying" && (
        <div className="space-y-4">
          {/* OTP Delivery Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="text-blue-700 font-medium">
              {otpDeliveryChannel === "sms"
                ? "📱 OTP sent via SMS"
                : "💬 OTP sent via WhatsApp"}
            </p>
            <p className="text-blue-600 text-xs mt-1">Expires in {otpExpiresIn}s</p>
          </div>

          {/* OTP Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter OTP
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={otp}
              onChange={handleOTPChange}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              {otp.length}/6 digits entered
            </p>
          </div>

          {/* Terms & Conditions */}
          <div className="flex items-start space-x-2 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="terms"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="terms" className="text-xs text-gray-600 cursor-pointer">
              I accept DocBooking's{" "}
              <a href="/terms-and-conditions" className="text-blue-600 hover:underline">
                Terms & Conditions
              </a>
              {" "}and{" "}
              <a href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleVerifyOTP}
              disabled={loading || otp.length < 6 || !termsAccepted}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              onClick={handleSendOTP}
              disabled={resendCountdown > 0 || loading}
              className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 disabled:cursor-not-allowed transition"
            >
              {resendCountdown > 0 ? `Resend in ${resendCountdown}s` : "Resend"}
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {(step === "sending" || loading) && (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 text-sm">
            {step === "sending" ? "Sending OTP..." : "Processing..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default OTPVerificationComponent;

/**
 * USAGE EXAMPLE:
 * 
 * import OTPVerificationComponent from "@/components/OTPVerificationComponent";
 * 
 * export default function BookingPage() {
 *   return (
 *     <OTPVerificationComponent
 *       phoneNumber="9876543210"
 *       onVerificationSuccess={(phone) => {
 *         console.log(`User ${phone} verified!`);
 *         // Proceed with booking
 *       }}
 *       onVerificationError={(error) => {
 *         console.error("Verification failed:", error);
 *       }}
 *     />
 *   );
 * }
 */
