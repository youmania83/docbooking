"use client";

/**
 * Global Error Boundary for Client-Side Errors
 * Catches React errors and sends to Sentry
 */

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * Root error boundary component
 * Wraps the entire app to catch all React errors
 */
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  useEffect(() => {
    // Initialize Sentry on client
    if (typeof window !== "undefined") {
      Sentry.captureException(new Error("[Sentry] Client error boundary mounted"));
    }
  }, []);

  return children;
}

/**
 * Error page shown when layout errors occur
 */
export function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to Sentry
    Sentry.captureException(error);
    console.error("[Sentry] Error boundary caught:", error);
  }, [error]);

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button
        onClick={() => reset()}
        style={{
          padding: "0.5rem 1rem",
          marginTop: "1rem",
          backgroundColor: "#2563EB",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
