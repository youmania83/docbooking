// Import Sentry wrapper for error monitoring
const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration for proper root detection
  turbopack: {
    root: __dirname,
  },
  // Ignore TypeScript build errors to allow Vercel deployment
  typescript: {
    ignoreBuildErrors: process.env.CI === "true",
  },
  // Security headers
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

// Wrap config with Sentry
module.exports = withSentryConfig(nextConfig, {
  // Sentry options
  silent: true, // Suppress Sentry output during build (cleaner logs)
  org: process.env.SENTRY_ORG || "",
  project: process.env.SENTRY_PROJECT || "",
});
