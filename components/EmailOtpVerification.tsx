"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  Check,
  AlertCircle,
  Loader,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";

interface EmailOtpVerificationProps {
  onVerified: (email: string) => void;
  onEmailChange?: (email: string) => void;
  isLoading?: boolean;
}

type VerificationStep = "idle" | "sending" | "sent" | "verifying" | "verified";

export default function EmailOtpVerification({
  onVerified,
  onEmailChange,
  isLoading = false,
}: EmailOtpVerificationProps) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<VerificationStep>("idle");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [attempts, setAttempts] = useState(5);
  const [showDevOtp, setShowDevOtp] = useState(false);
  const [devOtp, setDevOtp] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const isDevelopment = process.env.NODE_ENV === "development";

  // Handle resend countdown
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const interval = setTimeout(() => {
      setResendCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(interval);
  }, [resendCountdown]);

  // Format countdown timer
  const formatCountdown = (seconds: number) => {
    return seconds > 0 ? `${seconds}s` : "Ready";
  };

  // Validate email format
  const isValidEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Handle send OTP
  const handleSendOtp = async () => {
    setError("");
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setStep("sending");

    try {
      const response = await fetch("/api/send-email-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.details?.email ||
            data.error ||
            "Failed to send OTP. Please try again."
        );
      }

      // Extract dev OTP if in development
      if (isDevelopment && data.data?.devOtp) {
        setDevOtp(data.data.devOtp);
      }

      setExpiresIn(data.data?.expiresIn || 300);
      setStep("sent");
      setResendCountdown(30);
      setSuccessMessage("OTP sent successfully! Check your email.");
      setAttempts(5); // Reset attempts for new OTP

      if (onEmailChange) {
        onEmailChange(email);
      }

      console.log(`[📧 OTP Sent] Email: ${email}`, data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send OTP";
      setError(message);
      setStep("idle");
      console.error("[❌ Send OTP Failed]:", err);
    }
  };

  // Handle verify OTP
  const handleVerifyOtp = async () => {
    setError("");
    setSuccessMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("OTP must be 6 digits");
      return;
    }

    setStep("verifying");

    try {
      const response = await fetch("/api/verify-email-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.toLowerCase(), otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        const attemptsRemaining = data.details?.attemptsRemaining;

        throw new Error(
          data.error ||
            `Verification failed${attemptsRemaining ? ` (${attemptsRemaining} attempts left)` : ""}`
        );
      }

      setStep("verified");
      setSuccessMessage("✅ Email verified successfully!");
      setOtp("");

      console.log(`[✅ OTP Verified] Email: ${email}`);

      // Call callback after short delay
      setTimeout(() => {
        onVerified(email);
      }, 500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to verify OTP";

      // Extract attempts remaining from error message
      const attemptsMatch = message.match(/(\d+) attempts/);
      if (attemptsMatch) {
        setAttempts(parseInt(attemptsMatch[1]));
      }

      setError(message);
      setStep("sent");
      console.error("[❌ Verify OTP Failed]:", err);
    }
  };

  // Handle resend OTP
  const handleResendOtp = async () => {
    await handleSendOtp();
  };

  // Copy dev OTP to clipboard
  const copyDevOtp = () => {
    navigator.clipboard.writeText(devOtp);
    setSuccessMessage("Dev OTP copied to clipboard!");
    setTimeout(() => setSuccessMessage(""), 2000);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Mail size={24} className="text-blue-600" />
        Email Verification
      </h2>
      <p className="text-gray-600 mb-8">
        Verify your email before booking an appointment
      </p>

      {/* Step 1: Email Input */}
      {(step === "idle" || step === "sending") && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="your.email@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              disabled={isLoading || step === "sending"}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleSendOtp}
            disabled={isLoading || !email.trim() || step === "sending"}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            {step === "sending" ? (
              <>
                <Loader size={18} className="animate-spin" />
                Sending OTP...
              </>
            ) : (
              <>
                <Mail size={18} />
                Send OTP to Email
              </>
            )}
          </button>
        </div>
      )}

      {/* Step 2: OTP Verification */}
      {(step === "sent" || step === "verifying" || step === "verified") && (
        <div className="space-y-4">
          {/* Email display */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Verification Email:</strong> {email}
            </p>
            <button
              onClick={() => {
                setStep("idle");
                setEmail("");
                setOtp("");
                setError("");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 mt-2 underline"
            >
              Change email
            </button>
          </div>

          {/* OTP Input */}
          {step !== "verified" && (
            <>
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter OTP <span className="text-red-500">*</span>
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setOtp(value);
                    setError("");
                  }}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-lg tracking-widest"
                  disabled={step === "verifying"}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {expiresIn > 0
                    ? `Expires in ${expiresIn} seconds`
                    : "OTP will be sent to your email"}
                </p>
              </div>

              {/* Dev OTP Display (Development only) */}
              {isDevelopment && devOtp && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-yellow-900">
                        🔧 Development Mode
                      </p>
                      <p className="text-sm text-yellow-800 mt-1">
                        Test OTP:{" "}
                        <span
                          className="font-mono font-bold cursor-pointer hover:bg-yellow-200 px-2 py-1 rounded"
                          onClick={copyDevOtp}
                        >
                          {showDevOtp ? devOtp : "••••••"}
                        </span>
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDevOtp(!showDevOtp)}
                      className="text-yellow-700 hover:text-yellow-900"
                    >
                      {showDevOtp ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <button
                    onClick={copyDevOtp}
                    className="text-xs text-yellow-700 hover:text-yellow-900 mt-2 flex items-center gap-1"
                  >
                    <Copy size={14} /> Copy OTP
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700">{error}</p>
                    {attempts < 5 && (
                      <p className="text-xs text-red-600 mt-1">
                        Remaining attempts: {attempts}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={handleVerifyOtp}
                disabled={step === "verifying" || otp.length !== 6}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {step === "verifying" ? (
                  <>
                    <Loader size={18} className="animate-spin" />
                    Verifying OTP...
                  </>
                ) : (
                  <>
                    <Lock size={18} />
                    Verify OTP
                  </>
                )}
              </button>

              {/* Resend Button */}
              <div className="text-center">
                <button
                  onClick={handleResendOtp}
                  disabled={resendCountdown > 0}
                  className={`text-sm font-medium transition ${
                    resendCountdown > 0
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-blue-600 hover:text-blue-800"
                  }`}
                >
                  Didn't receive OTP?{" "}
                  <span className="underline">
                    Resend {resendCountdown > 0 && `(${formatCountdown(resendCountdown)})`}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Success State */}
          {step === "verified" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="flex justify-center mb-3">
                  <div className="bg-green-500 rounded-full p-3">
                    <Check className="text-white" size={32} />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-green-900 mb-1">
                  Email Verified!
                </h3>
                <p className="text-sm text-green-700">
                  Your email has been successfully verified
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success/Error Messages */}
      {successMessage && step !== "verified" && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3 mt-4">
          <Check className="text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">{successMessage}</p>
        </div>
      )}
    </div>
  );
}
