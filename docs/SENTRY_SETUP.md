# Sentry Error Monitoring Setup Guide

## Overview

Sentry is configured for production error monitoring. It automatically captures:
- ✅ Frontend JavaScript errors
- ✅ API route errors  
- ✅ Server-side errors
- ✅ Unhandled promise rejections
- ✅ Network errors
- ✅ React component errors

## Getting Started with Sentry

### Step 1: Create Sentry Account

1. Go to https://sentry.io
2. Sign up for free (or enterprise plan)
3. Create a new project:
   - Framework: **Next.js**
   - Environment: **Node + Browser**

### Step 2: Get Your DSN

After creating the project:
1. Navigate to **Settings → Projects → Client Keys (DSN)**
2. Copy the DSN URL (looks like: `https://key@org.ingest.sentry.io/project-id`)

### Step 3: Configure Environment Variables

For **Production (Vercel)**:

1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Add these variables:

```
SENTRY_DSN=<your-dsn-from-sentry>
NEXT_PUBLIC_SENTRY_DSN=<your-dsn-from-sentry>
SENTRY_ORG=<your-sentry-org>
SENTRY_PROJECT=<your-sentry-project-name>
```

For **Development (local)**:
Leave these empty in `.env.local` - Sentry only runs in production.

### Step 4: Verify Setup

After deploying to Vercel:
1. Go to your Sentry dashboard
2. You should see deployment events appearing
3. Errors will be captured automatically

## Features

### Automatic Error Capture

All errors are automatically captured in production:

```typescript
// This will be captured automatically
throw new Error("Something went wrong");

// React errors are caught by error boundary
// Network errors are captured
// Unhandled rejections are captured
```

### Manual Error Capture

Use utility functions for intentional error tracking:

```typescript
import { captureError, captureWarning, addBreadcrumb } from "@/lib/sentry-utils";

// Capture an error with context
captureError(error, {
  userId: "user-123",
  action: "booking-creation",
});

// Capture a warning
captureWarning("Slow API response", {
  endpoint: "/api/doctors",
  duration: 5000,
});

// Add breadcrumb for debugging
addBreadcrumb("User clicked booking button", "info");
```

### Performance Monitoring

Basic performance tracing is enabled with 10% sample rate (low overhead):

```typescript
import { Sentry } from "@/lib/sentry-config";

// Transactions are captured automatically for API routes
// Database queries can be manually tracked
```

### Error Filtering

The following errors are filtered out (don't clutter your dashboard):

- ✅ 404 errors
- ✅ Browser extension errors
- ✅ Network timeouts
- ✅ ResizeObserver errors
- ✅ QuotaExceederrors

You can customize filters in `/lib/sentry-config.ts`.

## Configuration Files

### `/lib/sentry-config.ts`
Main Sentry configuration with:
- Production-only initialization
- Error filtering rules
- Performance tracing settings (10% sample rate)
- User context tracking

### `/components/ErrorBoundary.tsx`
React error boundary that catches component errors and sends to Sentry.

### `/instrumentation.ts`
Server-side initialization (runs once on startup).

### `/lib/sentry-utils.ts`
Utility functions for manual error tracking:
- `captureError()` - Log errors with context
- `captureWarning()` - Log warnings
- `captureInfo()` - Log info messages
- `setSentryUser()` - Set user context
- `addBreadcrumb()` - Add debugging breadcrumbs

## Usage Examples

### Email Sending Errors

In `/lib/email-service.ts`, all errors are automatically captured:

```typescript
captureError(new Error("Email config verification failed"), {
  error: errorMsg,
});
```

### API Error Tracking

Automatically captured in API routes - no extra code needed.

### Frontend Errors

Caught by ErrorBoundary component in `/app/layout.tsx`.

## Dashboard Navigation

Once errors start appearing:

1. **Issues Page**: Shows all errors grouped by similarity
2. **Error Details**: View full context, breadcrumbs, user info
3. **Performance**: Monitor API response times
4. **Releases**: Track errors by deployment
5. **Alerts**: Set up notifications for critical errors

## Production-Only Behavior

✅ **In production** (`NODE_ENV=production`):
- Errors sent to Sentry
- Performance tracing enabled
- User context logged

✅ **In development** (`NODE_ENV=development`):
- Errors logged locally only
- Sentry disabled
- No external API calls

This keeps development clean and prevents test errors from polluting your dashboard.

## Security & Privacy

- **No sensitive data**: User passwords, tokens, API keys are not sent
- **Data masking**: Email addresses and personal info can be masked
- **GDPR compliant**: You control data retention in Sentry settings
- **SSO support**: Enterprise Sentry accounts support single sign-on

## Monitoring Checklist

After deployment:

- [ ] Add Sentry env variables to Vercel
- [ ] Verify DSN is set correctly
- [ ] Check Sentry dashboard for events
- [ ] Test with a manual error (if needed)
- [ ] Set up email alerts for critical errors
- [ ] Review and customize error filters
- [ ] Set up error budget/quotas in Sentry

## Troubleshooting

### Errors not appearing?

1. Check `NODE_ENV=production` is set in Vercel
2. Verify DSN is correct in Sentry dashboard
3. Check Sentry organization/project names match config
4. Ensure `NEXT_PUBLIC_SENTRY_DSN` is set in Vercel

### Too many errors?

1. Review error filtering in `/lib/sentry-config.ts`
2. Increase `ignoreErrors` list
3. Adjust `beforeSend` function
4. Reduce `tracesSampleRate` if performance traces are noisy

### Performance impact?

With current settings:
- **Overhead**: < 5% on server
- **Sample rate**: 10% (1 in 10 requests sampled)
- **No blocking**: Errors sent asynchronously

## Next Steps

1. Get Sentry account set up
2. Add env variables to Vercel
3. Deploy to production
4. Monitor your errors in Sentry dashboard
5. Set up custom alerts for business-critical errors

## Resources

- [Sentry Documentation](https://docs.sentry.io)
- [Next.js Sentry Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Error Filtering Guide](https://docs.sentry.io/product/data-management-settings/filtering-data/)
- [Performance Monitoring](https://docs.sentry.io/product/performance/)

---

**Status**: ✅ Sentry integrated and ready for production use
