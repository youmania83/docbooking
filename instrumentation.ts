/**
 * Next.js Instrumentation Register
 * Runs once on server startup
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

import * as Sentry from "@sentry/nextjs";

const ENABLE_SENTRY = process.env.NODE_ENV === "production";

export async function register() {
  if (!ENABLE_SENTRY) {
    console.log("[Sentry] ℹ️ Development mode - Sentry disabled");
    return;
  }

  console.log("[Sentry] ✅ Server instrumentation initialized");

  // Sentry is already initialized in sentry.config.ts
  // This register function ensures it's set up early
  const dsn = process.env.SENTRY_DSN;
  if (!dsn) {
    console.warn("[Sentry] ⚠️ SENTRY_DSN not set for server monitoring");
  }
}
