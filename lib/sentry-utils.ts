/**
 * Sentry Error Capture Hook and Utilities
 * For manual error tracking and event logging
 */

import * as Sentry from "@sentry/nextjs";

/**
 * Capture an error with context
 * @param error - The error to capture
 * @param context - Additional context about the error
 */
export function captureError(
  error: Error | string,
  context?: Record<string, any>
) {
  const isProduction = process.env.NODE_ENV === "production";

  // Log to console in all environments
  console.error(
    `[Error Capture] ${typeof error === "string" ? error : error.message}`,
    context
  );

  // Send to Sentry only in production
  if (isProduction) {
    Sentry.captureException(error, {
      contexts: {
        custom: context,
      },
      level: "error",
    });
  }
}

/**
 * Capture a warning (non-error) event
 * @param message - Warning message
 * @param context - Additional context
 */
export function captureWarning(
  message: string,
  context?: Record<string, any>
) {
  const isProduction = process.env.NODE_ENV === "production";

  console.warn(`[Warning] ${message}`, context);

  if (isProduction) {
    Sentry.captureMessage(message, {
      contexts: {
        custom: context,
      },
      level: "warning",
    });
  }
}

/**
 * Capture an info/debug event
 * @param message - Info message
 * @param context - Additional context
 */
export function captureInfo(message: string, context?: Record<string, any>) {
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    Sentry.captureMessage(message, {
      contexts: {
        custom: context,
      },
      level: "info",
    });
  }
}

/**
 * Set user context for error tracking
 * @param userId - User ID
 * @param email - User email (optional)
 */
export function setSentryUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

/**
 * Clear user context
 */
export function clearSentryUser() {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for debugging
 * @param message - Breadcrumb message
 * @param level - Severity level
 * @param data - Additional data
 */
export function addBreadcrumb(
  message: string,
  level: "error" | "warning" | "info" | "debug" = "info",
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

export { Sentry };
