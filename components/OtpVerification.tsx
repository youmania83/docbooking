"use client";

import { useState, useEffect } from "react";
import { Phone, CheckCircle2, AlertCircle, Clock, Loader, Info } from "lucide-react";
import Link from "next/link";

interface OtpVerificationProps {
  onVerified: (phone: string) => void;
  isBookingDisabled?: boolean;
}

export default function OtpVerification({
  onVerified,
  isBookingDisabled = false,
}: OtpVerificationProps) {
  // State management
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [debugOtp, setDebugOtp] = useState(""); // For development mode
  const [verified, setVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [success, setSuccess] = useState("");
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);
  const [verifyAttempts, setVerifyAttempts] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsError, setTermsError] = useState("");

  const isDevelopment = process.env.NODE_ENV === "development";

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // Show fallback message after 30 seconds if OTP sent but not verified
  useEffect(() => {
    if (!otpSent || verified) return;

    const timer = setTimeout(() => {
      setShowFallbackMessage(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [otpSent, verified]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError("");
      setErrorCode(null);
    }, 5000);

    return () => clearTimeout(timer);
  }, [error]);

  // Handle phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhone(value);
    setError("");
    setErrorCode(null);
  };

  // Handle OTP input
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setOtp(value);
    setError("");
    setErrorCode(null);
  };

  // Handle terms checkbox
  const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTermsAccepted(e.target.checked);
    setTermsError("");
  };

  // Get specific error message based on error type
  const getErrorMessage = (statusCode: number | string, errorText: string): string => {
    const errorMap: Record<string | number, string> = {
      400: "Invalid phone number. Please enter 10 digits.",
      429: "Too many requests. Please wait before trying again.",
      "TOO_MANY_ATTEMPTS": "Maximum verification attempts exceeded. Please try again after 1 hour.",
      "INVALID_OTP": "The OTP you entered is incorrect. Please try again.",
      "OTP_EXPIRED": "The OTP has expired. Please request a new one.",
      "INVALID_FORMAT": "Invalid phone number format. Use 10 digits without country code.",
    };

    return errorMap[statusCode] || errorText || "An error occurred. Please try again.";
  };

  // Send OTP with improved error handling
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorCode(null);
    setShowFallbackMessage(false);

    // Validate phone number
    if (phone.length !== 10) {
      setError("Please enter exactly 10 digits.");
      setErrorCode("INVALID_FORMAT");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = getErrorMessage(response.status, data.error);
        setError(errorMsg);
        setErrorCode(response.status.toString());
        return;
      }

      // Success
      setOtpSent(true);
      setSuccess("OTP sent! Check your SMS.");
      setCountdown(30);
      setOtp("");
      setVerifyAttempts(0);
      setResendCount(resendCount + 1);

      // Debug mode: store OTP for display
      if (isDevelopment && data.phone) {
        console.log(`[DEBUG] OTP for ${data.phone}: Will show below`);
        // Note: OTP is generated server-side, we show the message instead
      }
    } catch (err) {
      setError("Network error. Check your connection and try again.");
      setErrorCode("NETWORK_ERROR");
      console.error("Send OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP with improved error handling
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setErrorCode(null);
    setTermsError("");

    // Validate OTP
    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP.");
      setErrorCode("INVALID_FORMAT");
      return;
    }

    // Validate terms acceptance
    if (!termsAccepted) {
      setTermsError("You must agree to Terms & Conditions and Privacy Policy to proceed.");
      return;
    }

    setLoading(true);
    const newAttempts = verifyAttempts + 1;
    setVerifyAttempts(newAttempts);

    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone, otp, termsAccepted: true, termsAcceptedAt: new Date() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Specific error mapping
        let errorMsg = data.error || "OTP verification failed.";

        if (response.status === 400 && errorMsg.includes("expired")) {
          setErrorCode("OTP_EXPIRED");
          errorMsg = "OTP has expired. Please request a new one.";
        } else if (response.status === 400 && errorMsg.includes("incorrect")) {
          setErrorCode("INVALID_OTP");
          errorMsg = `Incorrect OTP. Attempt ${newAttempts}/5.`;
          if (newAttempts >= 4) {
            errorMsg += " You have limited attempts remaining.";
          }
        } else if (response.status === 429) {
          setErrorCode("TOO_MANY_ATTEMPTS");
        }

        setError(errorMsg);
        return;
      }

      // Success
      setVerified(true);
      setSuccess("✅ Phone verified! Proceeding to booking...");
      setOtpSent(false);
      setOtp("");

      // Notify parent component
      setTimeout(() => {
        onVerified(phone);
      }, 800);
    } catch (err) {
      setError("Network error during verification. Please try again.");
      setErrorCode("NETWORK_ERROR");
      console.error("Verify OTP error:", err);
    } finally {
      setLoading(false);
    }
  };

  // If verified, show success state
  if (verified) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-8 border border-green-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-600 rounded-full p-3">
              <CheckCircle2 className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                ✅ Phone Verified
              </h3>
              <p className="text-sm text-gray-600">{phone}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Phone size={24} className="text-blue-600" />
        Phone Verification
      </h2>
      <p className="text-gray-600 mb-8">
        We'll send an OTP to verify your phone number before booking
      </p>

      {/* Error Message with Auto-dismiss */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-700 text-sm font-medium">{error}</p>
            {errorCode === "TOO_MANY_ATTEMPTS" && (
              <p className="text-red-600 text-xs mt-1">
                Please try again after some time or contact support.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && !verified && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-green-700 text-sm font-medium">{success}</p>
        </div>
      )}

      {/* Fallback Message for SMS Delays */}
      {showFallbackMessage && otpSent && !verified && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
          <Info className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-amber-700 text-sm font-medium">
              SMS taking longer than usual?
            </p>
            <p className="text-amber-600 text-xs mt-1">
              Try these steps: Check your phone balance, disable call filtering, or try resending the OTP.
            </p>
            <p className="text-amber-600 text-xs mt-2">
              💡 <strong>Tip:</strong> WhatsApp verification available as backup after 2 more resend attempts.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6">
        {/* Phone Number Input */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-gray-900 mb-3"
          >
            Phone Number * {otpSent && <span className="text-gray-500 font-normal">(locked)</span>}
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
              +91
            </span>
            <input
              type="tel"
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="Enter 10-digit number"
              disabled={otpSent || verified}
              maxLength={10}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400"
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your phone number is used only for appointment notifications
          </p>
        </div>

        {/* OTP Input (shown after OTP is sent) */}
        {otpSent && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-semibold text-gray-900 mb-3"
              >
                Enter OTP *
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOtpChange}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                autoComplete="off"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-center text-2xl font-semibold tracking-widest text-gray-900 placeholder-gray-300"
              />
              <p className="text-xs text-gray-500 mt-2">
                Check your SMS inbox
              </p>
            </div>

            {/* Development Mode: Debug OTP Display */}
            {isDevelopment && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 font-mono">
                  🐛 <strong>Dev Mode:</strong> Check console logs (F12) for OTP
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Server logs show: "OTP for [phone]:" followed by the code
                </p>
              </div>
            )}

            {/* Verification Attempts Counter */}
            {verifyAttempts > 0 && verifyAttempts < 5 && (
              <p className="text-xs text-gray-600 text-center">
                Attempts: {verifyAttempts}/5
              </p>
            )}
          </div>
        )}

        {/* Countdown Timer */}
        {otpSent && countdown > 0 && (
          <div className="flex items-center justify-between bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-blue-600" />
              <span className="text-blue-700 font-medium">
                Resend available in {countdown}s
              </span>
            </div>
          </div>
        )}

        {/* Resend OTP Button */}
        {otpSent && countdown === 0 && !verified && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSendOtp(e);
            }}
            disabled={loading}
            className="w-full text-center text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline py-2 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            📱 Didn't receive the OTP? Resend ({resendCount}/3)
          </button>
        )}

        {/* Legal Terms Checkbox - Only show after OTP is sent */}
        {otpSent && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className={`rounded-lg p-4 border-2 ${termsError ? "border-red-200 bg-red-50" : "border-gray-200 bg-gray-50"}`}>
              <div className="flex gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsAccepted}
                  onChange={handleTermsChange}
                  className="w-5 h-5 mt-0.5 accent-blue-600 cursor-pointer rounded flex-shrink-0"
                />
                <label htmlFor="terms" className="flex-1 cursor-pointer">
                  <p className="text-sm text-gray-800">
                    I agree to the{" "}
                    <Link
                      href="/terms-and-conditions"
                      target="_blank"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>
                    {" "}and{" "}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    <span className="text-red-600 ml-1">*</span>
                  </p>
                </label>
              </div>
              {termsError && (
                <p className="text-xs text-red-600 ml-8 mt-2">{termsError}</p>
              )}
            </div>
          </div>
        )}

        {/* Primary Button */}
        <button
          type="submit"
          disabled={
            loading ||
            verified ||
            (!otpSent && phone.length !== 10) ||
            (otpSent && (otp.length !== 6 || !termsAccepted))
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader size={20} className="animate-spin" />
              <span>{otpSent ? "Verifying..." : "Sending..."}</span>
            </>
          ) : otpSent ? (
            "✓ Verify OTP"
          ) : (
            "Send OTP"
          )}
        </button>
      </form>

      {/* Booking Disabled Notice */}
      {isBookingDisabled && !verified && (
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>⚠️ Important:</strong> You must verify your phone number to complete the booking. Booking will be blocked until verified.
          </p>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <p className="text-xs text-gray-600">
          <strong>💡 Troubleshooting:</strong>
        </p>
        <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 mt-2">
          <li>If SMS doesn't arrive, check your phone balance and network signal</li>
          <li>Disable any call/SMS filtering apps temporarily</li>
          <li>Resend will be available after {30} seconds</li>
          <li>OTP expires after 5 minutes</li>
        </ul>
      </div>
    </div>
  );
}
