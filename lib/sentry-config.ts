/**
 * Sentry Configuration
 * Shared config for client and server error monitoring
 */

import * as Sentry from "@sentry/nextjs";

// Only initialize in production
const ENABLE_SENTRY = process.env.NODE_ENV === "production";

// Initialize only once
let initialized = false;

export function initSentry() {
  if (!ENABLE_SENTRY || initialized) {
    return;
  }

  initialized = true;

  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  if (!dsn) {
    console.warn(
      "[Sentry] ⚠️ NEXT_PUBLIC_SENTRY_DSN not set. Error monitoring disabled."
    );
    return;
  }

  console.log("[Sentry] ✅ Initializing error monitoring");

  Sentry.init({
    dsn,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1, // 10% sample rate for performance tracing (low overhead)
    
    // Before sending to Sentry, filter out noise
    beforeSend: (event, hint) => {
      // Filter 404 errors (page not found)
      if (event.fingerprint?.[0] === "{{ default }}") {
        const message = event.contexts?.trace?.op || event.exception?.values?.[0]?.value || "";
        if (
          message.includes("404") ||
          message.includes("Not Found") ||
          message.includes("ENOTFOUND")
        ) {
          return null; // Don't send
        }
      }

      // Filter browser extensions errors (common noise)
      const url = event.request?.url || "";
      if (url.includes("chrome-extension://") || url.includes("moz-extension://")) {
        return null; // Don't send
      }

      // Filter common harmless errors
      const exceptionMessage = event.exception?.values?.[0]?.value || "";
      if (
        exceptionMessage.includes("NetworkError") ||
        exceptionMessage.includes("ResizeObserver") ||
        exceptionMessage.includes("QuotaExceededError")
      ) {
        return null; // Don't send
      }

      return event;
    },

    // Ignore certain errors entirely
    ignoreErrors: [
      // Browser extensions
      "chrome-extension://",
      "moz-extension://",
      // Common third-party errors
      "top.GLOBALS",
      // Random plugins errors
      "Can't find variable: ZiteReader",
      "jigsaw is not defined",
      "ComboSearch is not defined",
      // Random extensions
      "atomicFindClosingToken",
      "elf is not defined",
    ],

    // Capture replays for errors only (important for debugging)
    replaysOnErrorSampleRate: 1.0, // Always capture replays on error
  });

  // Set user context (if available)
  if (typeof window !== "undefined") {
    // Client-side only
    const userId = localStorage.getItem("docbooking_user_id");
    if (userId) {
      Sentry.setUser({ id: userId });
    }
  }
}

export { Sentry };
