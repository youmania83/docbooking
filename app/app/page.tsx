"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Lock, AlertCircle } from "lucide-react";

// Import the actual main homepage
import MainHome from "../(main)/page";

const APP_ACCESS_PASSWORD = "docbooking2026"; // Simple protection

// Make this page dynamic to avoid static prerendering issues with useSearchParams
export const dynamic = "force-dynamic";

function AppAccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);

  // Check authorization on mount
  useEffect(() => {
    // Method 1: Check query parameter
    const previewParam = searchParams.get("preview");
    if (previewParam === "true") {
      setIsAuthorized(true);
      return;
    }

    // Method 2: Check password in session storage
    const sessionAuth = sessionStorage.getItem("docbooking_app_access");
    if (sessionAuth === "authorized") {
      setIsAuthorized(true);
      return;
    }

    // If not authorized, show password prompt
    setShowPasswordPrompt(true);
  }, [searchParams]);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === APP_ACCESS_PASSWORD) {
      setIsAuthorized(true);
      sessionStorage.setItem("docbooking_app_access", "authorized");
      setPassword("");
      setShowPasswordPrompt(false);
    } else {
      setError("Incorrect password. Try again.");
      setPassword("");
    }
  };

  // Authorized: Show the actual main app
  if (isAuthorized) {
    return <MainHome />;
  }

  // Not authorized: Show password prompt
  if (showPasswordPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
            {/* Header */}
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Lock className="text-blue-600" size={32} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                App Access
              </h1>
              <p className="text-gray-600">
                This is a restricted area. Enter password to continue.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={!password}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Access App
              </button>
            </form>

            {/* Info */}
            <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
              <p>Authorized personnel only</p>
              <p className="text-xs text-gray-400 mt-2">
                Access via: <code className="bg-gray-100 px-2 py-1 rounded">/app?preview=true</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Wrapper component with Suspense for useSearchParams
export default function AppAccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AppAccessContent />
    </Suspense>
  );
}
