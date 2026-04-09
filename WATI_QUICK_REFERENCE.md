# WATI Implementation Quick Reference

## Files Created/Modified

### Core Libraries

#### `/lib/wati.ts` - WATI API Integration
- `validateIndianPhoneNumber(phone)` - Validate Indian phone format
- `formatPhoneNumber(phone)` - Format to +91XXXXXXXXXX
- `sendTemplateMessage(phone, templateName, parameters)` - Send template via WATI
- `sendOTPMessage(phone, otp)` - Send OTP
- `sendBookingConfirmation(phone, doctorName, date, time, id)` - Send booking confirmation
- `sendDoctorNotification(phone, doctorName, patientName, date, time)` - Notify doctor
- `sendAppointmentReminder(phone, date, time)` - Send appointment reminder

#### `/lib/otp.ts` - OTP Management
- `generateOTP()` - Generate 6-digit OTP
- `storeOTP(phone, otp)` - Store OTP with 5-min expiry
- `validateOTP(phone, otp)` - Verify OTP
- `isRateLimited(phone)` - Check rate limit
- `setRateLimit(phone)` - Set rate limit window
- `clearOTP(phone)` - Delete OTP after verification
- `getOTPRemainingTime(phone)` - Get time until expiry
- `getRateLimitRemainingTime(phone)` - Get rate limit time

### API Routes

#### `/app/api/send-otp/route.ts`
- `POST /api/send-otp` - Send OTP via WhatsApp
- Input: `{ phone: string }`
- Output: `{ success, message, expiresIn }`

#### `/app/api/verify-otp/route.ts`
- `POST /api/verify-otp` - Verify OTP
- Input: `{ phone: string, otp: string }`
- Output: `{ success, message, verified }`

#### `/app/api/bookings/notify/route.ts`
- `POST /api/bookings/notify` - Send booking notifications
- Input: `{ patientPhone, patientName, doctorPhone, doctorName, appointmentDate, appointmentTime, bookingId }`
- Output: `{ success, patientNotified, doctorNotified, message }`

### Services

#### `/services/notificationService.ts` - Booking Notifications
- `sendBookingNotifications(payload)` - Send both patient + doctor notifications
- `notifyPatientBookingConfirmed(payload)` - Patient confirmation
- `notifyDoctorNewBooking(payload)` - Doctor alert
- `notifyPatientAppointmentReminder(phone, date, time)` - 24-hour reminder

### Frontend Components

#### `/components/OTPVerificationWhatsApp.tsx`
- Complete OTP verification UI component
- Phone input with validation
- OTP input with countdown timer
- Resend functionality
- Error and success states
- Ready to use in any page

## Quick Setup (5 Steps)

### 1. Get WATI Credentials
```bash
# Sign up at https://www.wati.io
# Go to Settings → API Integration
# Copy API Token and note Base URL
```

### 2. Update Environment
```bash
# Add to .env.local
WATI_API_TOKEN=your_token_here
WATI_BASE_URL=https://live-server.wati.io
```

### 3. Create Templates in WATI Dashboard
```
Template 1 - docbooking_otp:
"{{1}} is your verification code. For your security, do not share this code."

Template 2 - docbooking_booking_confirm:
"Dear {{2}},

Your appointment is confirmed!

Doctor: {{1}}
Date: {{2}}
Time: {{3}}

Booking ID: {{4}}

Thank you for booking with DocBooking."

Template 3 - docbooking_doctor_alert:
"New Appointment Alert!

Patient: {{1}}
Date: {{2}}
Time: {{3}}

Please review and confirm."

Template 4 - docbooking_appointment_reminder:
"Reminder: Your appointment is tomorrow!

Date: {{1}}
Time: {{2}}

Get to the clinic 10 minutes early."
```

### 4. Import and Use in Your Components
```typescript
// In your login/booking page
import OTPVerificationForm from "@/components/OTPVerificationWhatsApp";

export default function LoginPage() {
  return <OTPVerificationForm onVerified={(phone) => {
    // User is verified!
  }} />;
}
```

### 5. Call from Booking Creation
```typescript
// In your booking API route
import { sendBookingNotifications } from "@/services/notificationService";

// After creating booking
await sendBookingNotifications({
  patientPhone: "+919876543210",
  patientName: "John Doe",
  doctorPhone: "+919876543211",
  doctorName: "Dr. Sharma",
  appointmentDate: "2024-04-15",
  appointmentTime: "10:00 AM",
  bookingId: "BOOK_123456",
});
```

## API Usage Examples

### Client-Side

```typescript
// Send OTP
const response = await fetch("/api/send-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ phone: "9876543210" }),
});

// Verify OTP
const response = await fetch("/api/verify-otp", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
    phone: "9876543210",
    otp: "123456"
  }),
});
```

### Server-Side

```typescript
// In API route or server action
import { sendOTPMessage } from "@/lib/wati";
import { generateOTP, storeOTP } from "@/lib/otp";

const otp = generateOTP();
storeOTP("+919876543210", otp);
await sendOTPMessage("+919876543210", otp);
```

## Rate Limiting

**Default:** 3 requests per 60 seconds per phone

Modify in `/lib/otp.ts`:
```typescript
// Increase limit
if (existing && existing.resetAt > now) {
  existing.count++; // Change 3 to higher number
} else {
  rateLimitStore.set(phone, {
    count: 1,
    resetAt: now + RATE_LIMIT_WINDOW,
  });
}
```

## OTP Expiry

**Default:** 5 minutes

Modify in `/lib/otp.ts`:
```typescript
const OTP_VALIDITY = 10 * 60 * 1000; // Change 5 to 10 minutes
```

## Scaling to Production

### Option 1: Redis for OTP Storage
```bash
npm install redis
```

Replace Map storage in `/lib/otp.ts`:
```typescript
import { createClient } from 'redis';

const redis = createClient();

export async function storeOTP(phone: string, otp: string) {
  await redis.setex(`otp:${phone}`, 300, otp);
}

export async function getOTPRecord(phone: string) {
  return await redis.get(`otp:${phone}`);
}
```

### Option 2: Database Storage
```typescript
// In MongoDB
db.otps.updateOne(
  { phone },
  {
    code: otp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000)
  },
  { upsert: true }
);
```

## Supported Phone Formats

```
✅ Valid:
"9876543210"           // 10 digits
"+919876543210"        // With country code
"+91-9876543210"       // With formatting
"98 7654 3210"         // With spaces

❌ Invalid:
"1234567890"           // Wrong prefix
"987654321"            // Too short
"+44987654321"         // Different country
```

## Error Handling

```typescript
// API error codes
400 - INVALID_PHONE, INVALID_OTP_FORMAT
401 - INVALID_OTP
429 - RATE_LIMIT_EXCEEDED
500 - WATI_ERROR, Internal errors

// Check in frontend
if (!response.ok) {
  const data = await response.json();
  console.error(data.message); // User-friendly message
}
```

## Testing OTP System

```bash
# Test send OTP
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Expected response
{
  "success": true,
  "message": "OTP sent successfully to your WhatsApp",
  "expiresIn": 300
}

# Test verify OTP (replace with actual OTP received)
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'
```

## Troubleshooting Checklist

- [ ] `WATI_API_TOKEN` is set in `.env.local`
- [ ] `WATI_BASE_URL` is set correctly
- [ ] Templates exist in WATI dashboard
- [ ] Phone number is valid Indian format
- [ ] OTP is exactly 6 digits
- [ ] Not rate limited (max 3 in 60 sec)
- [ ] OTP hasn't expired (5 min validity)
- [ ] Network connectivity is working
- [ ] Check server logs for detailed errors

## Components at a Glance

| File | Purpose | Key Function |
|------|---------|--------------|
| `lib/wati.ts` | WATI API calls | `sendTemplateMessage()` |
| `lib/otp.ts` | OTP logic | `generateOTP()`, `validateOTP()` |
| `api/send-otp/route.ts` | Send endpoint | Rate limit + send |
| `api/verify-otp/route.ts` | Verify endpoint | Validate + clear |
| `api/bookings/notify/route.ts` | Booking alerts | Send to both parties |
| `services/notificationService.ts` | Notification logic | `sendBookingNotifications()` |
| `components/OTPVerificationWhatsApp.tsx` | UI Component | Full OTP form |

## Next: Integration Steps

1. ✅ Copy OTP component into your page
2. ✅ Handle `onVerified` callback to save phone
3. ✅ Call `sendBookingNotifications()` after booking
4. ✅ Test end-to-end flow
5. ✅ Deploy to Vercel
6. ✅ Monitor logs and WATI usage

---

**Status:** Ready to Deploy ✅  
**Version:** 2.0.0
