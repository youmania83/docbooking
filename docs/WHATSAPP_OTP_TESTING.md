# WhatsApp OTP - Testing & Integration Guide

## Local Testing

### 1. Enable Mock Mode
**File:** `.env.local`
```env
AISENSY_MOCK_MODE=true  # Use mock API (development)
NODE_ENV=development
```

### 2. Start Dev Server
```bash
npm run dev
```

### 3. Test OTP Form
- Navigate to page with `OTPVerificationForm` component
- Enter phone: `9876543210`
- Click "Send OTP"
- **Console Output:**
```
[AiSensy] 🎭 MOCK MODE: Would send OTP "123456" to +919876543210
[AiSensy] ℹ️  For testing: Use OTP "123456" to verify
```
- Enter displayed OTP
- Check "I agree to Terms & Conditions"
- Click "Verify & Continue"
- ✅ Should show: "OTP verified successfully!"

### 4. Test Rate Limiting
- Click "Resend OTP" 4 times within 1 hour
- **4th attempt should fail:**
```json
{
  "success": false,
  "message": "Too many OTP requests. Please try again in 1800 seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

### 5. Test Cooldown
- Click "Send OTP"
- Immediately click "Resend OTP" (before 30s)
- Should see: `"Please wait X seconds before requesting another OTP"`

---

## Production Testing (With Real WhatsApp)

### 1. Disable Mock Mode
**File:** `.env.local`
```env
AISENSY_MOCK_MODE=false  # Use real API
NODE_ENV=production  # Recommended for testing
```

### 2. Get Test Phone Number
- Use your own WhatsApp number: `+91XXXXXXXXXX`
- Make sure WhatsApp is active on the number

### 3. Test Full Flow
```bash
npm run build
npm run start  # Start production server
```

Navigate to OTP form and test:
1. ✓ Enter phone number
2. ✓ Click "Send OTP"
3. ✓ Check WhatsApp for message (template: "{{OTP}} is your verification code.")
4. ✓ Enter OTP from WhatsApp
5. ✓ Accept Terms & Conditions
6. ✓ Click "Verify"
7. ✓ See success message

---

## API Testing (Curl Commands)

### Send OTP
```bash
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP sent successfully to your WhatsApp",
  "expiresIn": 300
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "message": "Too many OTP requests. Please try again in 3600 seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

### Verify OTP
```bash
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "otp": "123456",
    "terms_accepted": true
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "verified": true
}
```

**Response (Terms Not Accepted):**
```json
{
  "success": false,
  "message": "You must accept the Terms & Conditions to proceed",
  "code": "TERMS_NOT_ACCEPTED"
}
```

---

## Integration with Booking Flow

### Step 1: Import Component
**File:** `/app/(main)/page.tsx` or `/components/BookingFlow.tsx`
```tsx
import OTPVerificationForm from "@/components/OTPVerificationWhatsApp";
```

### Step 2: Add to Flow
```tsx
export default function BookingPage() {
  const [verifiedPhone, setVerifiedPhone] = useState<string | null>(null);

  if (!verifiedPhone) {
    return (
      <OTPVerificationForm 
        onVerified={(phone) => {
          setVerifiedPhone(phone);
          // Continue with booking
        }}
      />
    );
  }

  return (
    <div>
      <h2>Complete Your Booking</h2>
      <p>Phone verified: {verifiedPhone}</p>
      {/* Rest of booking form */}
    </div>
  );
}
```

### Step 3: Store Verified Phone
```tsx
const handleVerified = (phone: string) => {
  // Store in state
  setVerifiedPhone(phone);

  // Or store in session/localStorage
  sessionStorage.setItem("verified_phone", phone);

  // Continue to next step
};
```

### Step 4: Use in Booking Submission
```tsx
const handleSubmitBooking = async (bookingData) => {
  const verifiedPhone = sessionStorage.getItem("verified_phone");

  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...bookingData,
      phone: verifiedPhone,  // Already verified
      verified: true
    })
  });

  const result = await response.json();
  if (result.success) {
    alert("Booking confirmed!");
  }
};
```

---

## Error Handling Examples

### Handle Expired OTP
```tsx
if (data.code === "INVALID_OTP") {
  console.log("OTP expired or wrong");
  // Show: "OTP expired. Please request a new one."
}
```

### Handle Rate Limit
```tsx
if (data.code === "RATE_LIMIT_EXCEEDED") {
  console.log("Too many attempts");
  // Show: "Too many OTP requests. Please try again later."
}
```

### Handle API Down
```tsx
if (data.code === "AISENSY_ERROR") {
  console.log("WhatsApp API error");
  // Show: "Failed to send OTP. Please try again."
  // Fallback: Show SMS option or retry
}
```

---

## Debugging Tips

### Check OTP in Development
Console logs show generated OTP in mock mode:
```
[AiSensy] 🎭 MOCK MODE: Would send OTP "123456" to +919876543210
```
Copy this OTP for testing without waiting for WhatsApp.

### Monitor in Production
1. **Check Sentry:** https://sentry.io/organizations/docbooking/
2. **Look for:** API errors, rate limit hits
3. **Verify:** OTP sends are logged with timestamps

### Database Inspection
```bash
# MongoDB - Find OTP record
db.otps.find({ phone: "+919876543210" })

# Result:
{
  _id: ObjectId(...),
  phone: "+919876543210",
  otp: "123456",
  expiresAt: ISODate("2026-04-12T14:35:00Z"),
  attempts: 0,
  createdAt: ISODate(...),
  updatedAt: ISODate(...)
}
```

---

## Performance Optimization

### Caching OTP
```tsx
// Don't regenerate OTP if user hasn't waited cooldown
const [lastOtpTime, setLastOtpTime] = useState(0);

const canRequestOtp = () => {
  return Date.now() - lastOtpTime > 30000; // 30 seconds
};
```

### Reduce API Calls
```tsx
// Debounce phone input validation
const [phone, setPhone] = useDebounce(phoneInput, 500);
```

### Optimize Countdown
```tsx
// Use CSS animation instead of state updates
<div style={{
  animation: 'countDown 5s linear'
}} />
```

---

## Testing Checklist

### Functional Tests
- [ ] OTP sends successfully (mock mode)
- [ ] OTP received on WhatsApp (production)
- [ ] OTP expires after 5 minutes
- [ ] Rate limiting blocks after 3 requests
- [ ] Cooldown prevents re-sending < 30s
- [ ] Terms checkbox blocks verification if unchecked
- [ ] Resend button works and shows countdown
- [ ] Back button returns to phone entry
- [ ] Error messages display correctly
- [ ] Success callback fires after verification

### Security Tests
- [ ] API key not exposed in frontend
- [ ] OTP not stored in localStorage
- [ ] Terms must be accepted to verify
- [ ] Invalid phone numbers rejected
- [ ] Invalid OTP format rejected (not 6 digits)
- [ ] HTTPS enforced (production)
- [ ] CSRF protection active

### Performance Tests
- [ ] OTP generation < 1ms
- [ ] Verification < 50ms
- [ ] API response < 2 seconds (with WhatsApp)
- [ ] Homepage loads < 3 seconds

### User Experience Tests
- [ ] Mobile-friendly (test on phone)
- [ ] Loading states visible
- [ ] Error messages clear
- [ ] Success messages show
- [ ] Countdown timer accurate
- [ ] Resend button state correct

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| OTP not sending | Check `AISENSY_API_KEY` in .env.local |
| "Please wait X seconds" | Cooldown active - wait 30 seconds |
| "Rate limit exceeded" | Max 3 per hour - wait 1 hour |
| OTP expired | Resend new OTP (valid 5 minutes) |
| Terms checkbox won't check | Verify checkbox element renders |
| Verify button disabled | Check all inputs filled + terms accepted |
| Phone not formatting | Ensure 10 digits entered |
| Build fails | Run `npm ci` to reinstall deps |

---

## Version History

### v2.0.0 (Current)
- ✅ Terms & Conditions checkbox
- ✅ Improved UX with resend countdown
- ✅ Production-ready AiSensy integration
- ✅ Rate limiting & cooldown
- ✅ Sentry error monitoring

### v1.0.0 (Previous)
- ✅ Basic OTP flow
- ✅ WhatsApp delivery
- ✅ Rate limiting

---

## Support

For issues:
1. Check console logs (development)
2. Check Sentry dashboard (production)
3. Review this guide's troubleshooting section
4. Contact WhatsApp/AiSensy support if API error

---

**Last Updated:** April 12, 2026  
**Status:** Production Ready ✅
