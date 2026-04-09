# WATI WhatsApp OTP & Notification System - Setup Guide

## Overview

This is a production-ready WhatsApp OTP and notification system for DocBooking using the WATI API. It includes:

- ✅ OTP generation and SMS via WhatsApp
- ✅ OTP verification with rate limiting
- ✅ Booking confirmation notifications
- ✅ Doctor alerts
- ✅ Appointment reminders
- ✅ Security best practices
- ✅ TypeScript throughout
- ✅ Error handling and logging

## Architecture

```
┌─────────────────────┐
│   Frontend (React)  │
│  OTPVerification    │
│    Component        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────┐
│   Next.js API Routes (App Router)   │
├─────────────────────────────────────┤
│ POST /api/send-otp                  │
│ POST /api/verify-otp                │
│ POST /api/bookings/notify           │
└──────────┬──────────────────────────┘
           │
           ▼
┌─────────────────────────────────────┐
│   Backend Utilities                 │
├─────────────────────────────────────┤
│ /lib/wati.ts                        │
│ /lib/otp.ts                         │
│ /services/notificationService.ts    │
└──────────┬──────────────────────────┘
           │
           ▼
┌──────────────────────────┐
│   WATI WhatsApp API      │
│  https://wati.io        │
└──────────────────────────┘
```

## Environment Setup

### 1. Get WATI API Credentials

1. Sign up at [WATI](https://www.wati.io)
2. Go to your dashboard
3. Navigate to Settings → API Integration
4. Copy your **API Token**
5. Note the Base URL: `https://live-server.wati.io`

### 2. Update `.env.local`

Add these variables to your `.env.local` file:

```bash
# WATI WhatsApp API Configuration
WATI_API_TOKEN=your_api_token_here
WATI_BASE_URL=https://live-server.wati.io
```

**Example:**
```bash
WATI_API_TOKEN=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...
WATI_BASE_URL=https://live-server.wati.io
```

⚠️ **Security Notes:**
- Never commit `.env.local` to version control
- Use `.env.local.example` for documentation
- Verify token is not exposed in logs
- Use development token for testing first

## WATI Template Configuration

You need to set up templates in your WATI dashboard for each message type:

### 1. OTP Template

**Template Name:** `docbooking_otp`

**Message Content:**
```
{{1}} is your verification code. For your security, do not share this code.
```

**Parameters:**
- `{{1}}` = 6-digit OTP

**Example Send:**
```javascript
await sendOTPMessage("+919876543210", "123456");
```

**Result:**
```
Your DocBooking OTP is 123456. Do not share this code.
```

### 2. Booking Confirmation Template

**Template Name:** `docbooking_booking_confirm`

**Message Content:**
```
Dear {{1}},

Your appointment is confirmed!

Doctor: {{1}}
Date: {{2}}
Time: {{3}}

Booking ID: {{4}}

Thank you for booking with DocBooking.
```

**Parameters:**
- `{{1}}` = Doctor Name
- `{{2}}` = Appointment Date (e.g., "15 April 2024")
- `{{3}}` = Appointment Time (e.g., "10:00 AM")
- `{{4}}` = Booking ID

**Example Send:**
```javascript
await sendBookingConfirmation(
  "+919876543210",
  "Dr. Sharma",
  "15 April 2024",
  "10:00 AM",
  "BOOK_123456"
);
```

### 3. Doctor Alert Template

**Template Name:** `docbooking_doctor_alert`

**Message Content:**
```
New Appointment Alert!

Patient: {{1}}
Date: {{2}}
Time: {{3}}

Please review and confirm.
```

**Parameters:**
- `{{1}}` = Patient Name
- `{{2}}` = Appointment Date
- `{{3}}` = Appointment Time

### 4. Appointment Reminder Template

**Template Name:** `docbooking_appointment_reminder`

**Message Content:**
```
Reminder: Your appointment is tomorrow!

Date: {{1}}
Time: {{2}}

Get to the clinic 10 minutes early.
```

**Parameters:**
- `{{1}}` = Appointment Date
- `{{2}}` = Appointment Time

## API Routes Reference

### Send OTP

**Endpoint:** `POST /api/send-otp`

**Request:**
```json
{
  "phone": "+919876543210" // or "9876543210"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your WhatsApp",
  "expiresIn": 300
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid phone number. Please provide a valid Indian phone number"
}
```

**Status Codes:**
- `200` - OTP sent successfully
- `400` - Invalid input
- `429` - Rate limited (max 3 attempts per 60 seconds)
- `500` - Server error

### Verify OTP

**Endpoint:** `POST /api/verify-otp`

**Request:**
```json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "verified": true,
  "phone": "+919876543210"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempts remaining."
}
```

**Status Codes:**
- `200` - OTP verified
- `400` - Invalid input
- `401` - Invalid/expired OTP
- `500` - Server error

### Send Booking Notifications

**Endpoint:** `POST /api/bookings/notify`

**Request:**
```json
{
  "patientPhone": "+919876543210",
  "patientName": "John Doe",
  "doctorPhone": "+919876543211",
  "doctorName": "Dr. Sharma",
  "appointmentDate": "2024-04-15",
  "appointmentTime": "10:00 AM",
  "bookingId": "BOOK_123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "All notifications sent successfully",
  "patientNotified": true,
  "doctorNotified": true
}
```

## Usage Examples

### Backend Usage

```typescript
import {
  sendOTPMessage,
  sendBookingConfirmation,
  sendDoctorNotification,
} from "@/lib/wati";

import {
  generateOTP,
  storeOTP,
  validateOTP,
} from "@/lib/otp";

// Generate and send OTP
const otp = generateOTP();
storeOTP("+919876543210", otp);
await sendOTPMessage("+919876543210", otp);

// Verify OTP
const result = validateOTP("+919876543210", "123456");
if (result.valid) {
  // Clear OTP after verification
  clearOTP("+919876543210");
}

// Send booking notifications
await sendBookingConfirmation(
  "+919876543210",
  "Dr. Sharma",
  "15 April 2024",
  "10:00 AM",
  "BOOK_123456"
);
```

### Frontend Usage

```tsx
import OTPVerificationForm from "@/components/OTPVerificationWhatsApp";

export default function LoginPage() {
  const handleVerified = (phone: string) => {
    console.log("User verified:", phone);
    // Redirect to booking or save to session
  };

  return (
    <div>
      <OTPVerificationForm onVerified={handleVerified} />
    </div>
  );
}
```

### Integration with Booking Creation

```typescript
// In your booking creation API route
import { sendBookingNotifications } from "@/services/notificationService";

// After creating booking in database
const booking = await Booking.create({
  patientPhone,
  doctorId,
  appointmentDate,
  appointmentTime,
  // ... other fields
});

// Send notifications
await sendBookingNotifications({
  patientPhone,
  patientName: booking.patientName,
  doctorPhone: doctor.phone,
  doctorName: doctor.name,
  appointmentDate: booking.appointmentDate.toISOString(),
  appointmentTime: booking.appointmentTime,
  bookingId: booking._id.toString(),
});

return { success: true, booking };
```

## Security Considerations

### 1. Rate Limiting

OTP requests are rate-limited to **3 attempts per 60 seconds** per phone number:

```typescript
if (isRateLimited(formattedPhone)) {
  const remainingTime = getRateLimitRemainingTime(formattedPhone);
  return error(`Try again in ${remainingTime} seconds`);
}
```

### 2. OTP Expiry

OTPs expire after **5 minutes**:

```typescript
storeOTP(phone, otp); // Expires in 5 minutes

// After 5 minutes
const record = getOTPRecord(phone);
// Returns null (expired)
```

### 3. Failed Attempts Tracking

Maximum **3 failed verification attempts** before OTP is cleared:

```typescript
const validation = validateOTP(phone, userOtp);
// After 3 failures: OTP is deleted, user must request new one
```

### 4. Phone Number Validation

Only accept valid Indian phone numbers:

```typescript
validateIndianPhoneNumber("+919876543210"); // true
validateIndianPhoneNumber("9876543210");    // true
validateIndianPhoneNumber("1234567890");    // false (invalid)
```

### 5. No Logging of Sensitive Data

OTPs are **never logged** in production:

```typescript
// ✅ Safe (development only)
if (process.env.NODE_ENV === "development") {
  console.log(`OTP sent: ${otp}`);
}

// ❌ Unsafe (never log OTP)
console.log(`User OTP: ${otp}`); // NEVER!
```

## Deployment Checklist

- [ ] Add `WATI_API_TOKEN` to Vercel environment variables
- [ ] Add `WATI_BASE_URL` to Vercel environment variables
- [ ] Create all required templates in WATI dashboard
- [ ] Test OTP sending in production
- [ ] Test booking notifications
- [ ] Set up error monitoring (Sentry, Rollbar)
- [ ] Enable HTTPS enforcement
- [ ] Set up rate limiting at server level
- [ ] Monitor WATI API usage and costs
- [ ] Document backup SMS option if WATI fails

## Testing

### Manual Testing

```bash
# Test send OTP
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Test verify OTP
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

### Automated Testing

```typescript
// Example test
import { generateOTP, storeOTP, validateOTP } from "@/lib/otp";

describe("OTP System", () => {
  it("should generate valid OTP", () => {
    const otp = generateOTP();
    expect(otp).toMatch(/^\d{6}$/);
  });

  it("should validate OTP correctly", () => {
    const phone = "+919876543210";
    const otp = generateOTP();
    storeOTP(phone, otp);

    const result = validateOTP(phone, otp);
    expect(result.valid).toBe(true);
  });

  it("should reject wrong OTP", () => {
    const phone = "+919876543210";
    const otp = generateOTP();
    storeOTP(phone, otp);

    const result = validateOTP(phone, "000000");
    expect(result.valid).toBe(false);
  });
});
```

## Troubleshooting

### OTP not being sent

1. Check WATI credentials in `.env.local`
2. Verify template exists in WATI dashboard
3. Check API logs for errors
4. Verify phone number format
5. Check WATI account balance/quota

### Phone number validation fails

```typescript
// Valid formats
"9876543210"           // ✅
"+919876543210"        // ✅
"9876543210"           // ✅
"+91-9876543210"       // ✅
"(98) 7654-3210"       // ✅

// Invalid formats
"1234567890"           // ❌ (doesn't start with 6-9)
"987654321"            // ❌ (too short)
"+44987654321"         // ❌ (not Indian)
```

### Rate limiting too strict

Modify `RATE_LIMIT_WINDOW` in `/lib/otp.ts`:

```typescript
const RATE_LIMIT_WINDOW = 60 * 1000; // Change to your preferred duration
```

### OTP expires too quickly

Modify `OTP_VALIDITY` in `/lib/otp.ts`:

```typescript
const OTP_VALIDITY = 5 * 60 * 1000; // Default: 5 minutes
```

## Production Recommendations

1. **Use Redis for OTP storage** (replace in-memory Map)
2. **Set up appointment reminders** (use cron jobs)
3. **Monitor WATI API costs**
4. **Implement SMS fallback** option
5. **Set up error alerting** (Sentry, etc.)
6. **Regular security audits**
7. **Log all notification events** (for compliance)
8. **Implement request authentication** for internal APIs

## Next Steps

```bash
# 1. Install dependencies (already done)
npm install

# 2. Add environment variables
echo "WATI_API_TOKEN=your_token" >> .env.local

# 3. Create WATI templates
# (Manual in dashboard)

# 4. Test OTP system
npm run dev
# Visit http://localhost:3000 and test

# 5. Deploy
vercel deploy --prod
```

## Support

For WATI API support: [WATI Docs](https://docs.wati.io)

For issues with this implementation, check logs and environment variables.

---

**Version:** 2.0.0  
**Last Updated:** April 2024  
**Status:** Production Ready ✅
