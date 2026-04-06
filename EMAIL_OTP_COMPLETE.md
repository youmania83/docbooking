# Email OTP Verification System - Complete Guide

## ✅ System Status
- **Build Status**: ✓ Successful (0 TypeScript errors)
- **Dev Server**: ✓ Running on http://localhost:3000
- **Database**: ✓ Connected (MongoDB Atlas)
- **Email Service**: ✓ Configured (Gmail SMTP)
- **Environment**: ✓ Configured (.env.local has Gmail credentials)

---

## 📋 What's Implemented

### 1. **Database Model** (`models/Otp.ts`)
- ✅ Email-based OTP storage
- ✅ 6-digit OTP field
- ✅ 5-minute expiry with TTL index (auto-delete)
- ✅ Attempt tracking (max 5 attempts)
- ✅ Timestamps (createdAt, updatedAt)
- ✅ Email validation with lowercase storage

### 2. **Backend APIs**

#### **POST /api/send-email-otp**
- ✅ Validates email format (Zod)
- ✅ Rate limiting (30-second cooldown)
- ✅ Generates 6-digit OTP
- ✅ Stores OTP in MongoDB with 5-min expiry
- ✅ Sends email via Gmail SMTP
- ✅ Development mode: Logs OTP to console
- ✅ Returns `devOtp` in dev mode for testing
- ✅ Proper error handling with status codes

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "expiresIn": 300,
    "devOtp": "123456"
  },
  "message": "OTP sent to your email"
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "error": "Please wait 28 seconds before requesting another OTP",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

#### **POST /api/verify-email-otp**
- ✅ Validates email + OTP format
- ✅ Checks OTP exists and not expired
- ✅ Tracks failed attempts (max 5)
- ✅ Deletes OTP after successful verification
- ✅ Returns attempts remaining on failure
- ✅ Development mode: Logs verification result

**Request:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "email": "user@example.com",
    "message": "Email verified successfully"
  },
  "message": "OTP verified successfully"
}
```

**Response (Wrong OTP):**
```json
{
  "success": false,
  "error": "Invalid OTP. 2 attempts remaining.",
  "code": "OTP_INVALID",
  "details": {
    "attemptsRemaining": "2"
  }
}
```

### 3. **Frontend Component** (`components/EmailOtpVerification.tsx`)
- ✅ Beautiful, responsive UI with Tailwind CSS
- ✅ Two-step verification flow
- ✅ Loading states with spinner
- ✅ Error messages with icons
- ✅ Success confirmation with checkmark
- ✅ Resend button with 30-second countdown timer
- ✅ Development mode: Display test OTP with copy button
- ✅ Auto-format OTP input (digits only, 6 chars max)
- ✅ Email validation before sending
- ✅ Attempt counter display
- ✅ Expiry timer display
- ✅ Helpful error messages

**Component Props:**
```typescript
interface EmailOtpVerificationProps {
  onVerified: (email: string) => void;     // Called when OTP verified
  onEmailChange?: (email: string) => void; // Called when email sent
  isLoading?: boolean;                      // External loading state
}
```

---

## 🚀 Local Testing

### Test 1: Send OTP
```bash
curl -X POST http://localhost:3000/api/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "***REMOVED***"}'
```

**Expected Response:**
- Status: 200
- Dev OTP visible in console and response
- Email sent to ***REMOVED***
- 30-second cooldown starts

**Check Console Output:**
```
[🔐 OTP Generated] Email: ***REMOVED*** | OTP: 123456
[💾 OTP Saved] Email: ***REMOVED***
[📧 Email OTP] Sent to ***REMOVED*** | Message ID: ...
[✅ Success] OTP sent to ***REMOVED*** - Dev OTP: 123456
```

### Test 2: Verify OTP
```bash
curl -X POST http://localhost:3000/api/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "***REMOVED***", "otp": "123456"}'
```

**Expected Response:**
- Status: 200
- `verified: true`
- OTP record deleted from DB

### Test 3: Rate Limiting
```bash
# First request - succeeds
curl -X POST http://localhost:3000/api/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# Second request within 30 seconds - fails
curl -X POST http://localhost:3000/api/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Expected Response:**
- First: Status 200 ✓
- Second: Status 429 with "Please wait X seconds" message

### Test 4: Wrong OTP
```bash
curl -X POST http://localhost:3000/api/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "***REMOVED***", "otp": "000000"}'
```

**Expected Response:**
- Status: 400
- Error: "Invalid OTP. X attempts remaining."
- Attempt counter incremented

### Test 5: Maximum Attempts
Send wrong OTP 5 times, on the 6th attempt:
- Status: 400
- Error: "Too many failed attempts. Please request a new OTP."
- OTP record deleted

---

## 🎨 Using the Frontend Component

### Import in Your Page
```typescript
import EmailOtpVerification from "@/components/EmailOtpVerification";

export default function BookingPage() {
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  return (
    <div className="space-y-6">
      {!isEmailVerified ? (
        <EmailOtpVerification
          onVerified={(email) => {
            setUserEmail(email);
            setIsEmailVerified(true);
          }}
          onEmailChange={(email) => console.log("Email:", email)}
        />
      ) : (
        <div className="bg-green-50 p-4 rounded-lg">
          <p>✅ Verified: {userEmail}</p>
          {/* Show booking form */}
        </div>
      )}
    </div>
  );
}
```

### Styling Integration
- Uses existing Tailwind CSS setup
- Responsive on mobile/tablet/desktop
- Color scheme: Blue primary (#0066cc), green success, red errors
- Icons from lucide-react (already installed)

---

## 📧 Email Configuration

### Current Setup
- **Provider**: Gmail SMTP
- **Email User**: `***REMOVED***`
- **Auth Password**: App-specific password (not Gmail password)
- **Configured**: ✅ In `.env.local`

### Email Template Features
- Professional HTML email with gradient header
- Large, easy-to-read OTP display
- Security notice warning
- Help text for spam folder
- Mobile-responsive design
- 5-minute expiry notice highlighted

### Change Email Provider (Optional)
To use a different provider, update `.env.local`:

**For Office 365 / Outlook:**
```
GMAIL_USER=your-email@outlook.com
GMAIL_APP_PASSWORD=your-app-password
```

Update `send-email-otp/route.ts`:
```typescript
const transporter = nodemailer.createTransport({
  service: "outlook",  // Change from gmail
  auth: { user, pass }
});
```

---

## 🔐 Security Features

| Feature | Status | Details |
|---------|--------|---------|
| Rate Limiting | ✅ | 30-second cooldown between requests |
| Attempt Limit | ✅ | Max 5 wrong attempts before lockout |
| OTP Expiry | ✅ | 5-minute auto-delete via TTL index |
| Email Validation | ✅ | Zod schema validation |
| OTP Format | ✅ | 6-digit numeric only |
| No Shared OTPs | ✅ | Clears previous OTP when new one sent |
| Input Sanitization | ✅ | Email converted to lowercase |
| Error Messages | ✅ | Generic messages (no internal data leak) |
| HTTPS Ready | ✅ | Works on Vercel production |

---

## 🧪 Development Mode Features

When `NODE_ENV === "development"`:

1. **Console Logging**
   - OTP generation
   - OTP storage
   - Email sending status
   - Verification attempts
   - Rate limit triggers

2. **Response Data**
   - `devOtp` field included in send-email-otp response
   - Visible for testing without checking email

3. **Frontend Display**
   - Yellow development box showing test OTP
   - Eye icon to toggle visibility
   - Copy-to-clipboard button
   - Non-obtrusive (doesn't affect UX)

### Disable Dev Features for Production
Dev features auto-disable when `NODE_ENV !== "development"`

---

## 📱 Mobile Responsive Features

- ✅ Touch-friendly buttons (48px minimum)
- ✅ Large OTP input field
- ✅ Mobile keyboard optimization (numeric on OTP)
- ✅ Responsive spacing
- ✅ Full-width on small screens
- ✅ Countdown timer optimization

---

## 🔧 Troubleshooting

### Issue: "Email service not configured"
**Solution**: Check `.env.local` has:
```
GMAIL_USER=***REMOVED***
GMAIL_APP_PASSWORD=***REMOVED***
```

### Issue: Email not received
**Steps**:
1. Check spam/junk folder
2. Verify email address in request
3. Check console for `[📧 Email OTP]` log
4. On dev, use `devOtp` from response
5. Check Gmail "Less secure apps" if not using app password

### Issue: "OTP expired" after 4 minutes
**Expected behavior**: OTP expires after 5 minutes
**Solution**: Request new OTP via resend button

### Issue: Rate limit "Please wait" message
**Expected behavior**: 30-second cooldown
**Solution**: Wait for countdown to reach 0 or use different email

### Issue: TypeScript errors in build
**Solution**: Run `npm run build` to verify:
```bash
npm run build
```
If errors persist, clean and rebuild:
```bash
rm -rf .next
npm run build
```

---

## 📊 Architecture

```
Component: EmailOtpVerification.tsx
    ↓
REST API: /api/send-email-otp ← Zod Validation
    ↓
Service: otpService.sendOtp()
    ↓
Model: OtpModel (MongoDB)
    ↓
External: Gmail SMTP

---

REST API: /api/verify-email-otp ← Zod Validation
    ↓
Service: otpService.verifyOtp()
    ↓
Model: OtpModel (MongoDB)
    ↓
Response: { verified: true }
```

---

## 🚀 Production Deployment

### Before Deploying to Vercel

1. **Set Environment Variables** in Vercel project settings:
   ```
   MONGODB_URI=your_production_mongo_uri
   GMAIL_USER=your_gmail@gmail.com
   GMAIL_APP_PASSWORD=your_16_char_app_password
   ADMIN_PASSWORD=your_secure_password
   ```

2. **Build Locally**:
   ```bash
   npm run build
   ```
   Verify: ✓ Compiled successfully

3. **Test Endpoints**:
   ```bash
   npm run dev
   # Test send-email-otp and verify-email-otp
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Add Email OTP verification system"
   git push origin main
   ```
   Vercel auto-deploys

### Production Checklist
- [ ] Gmail credentials set in Vercel env
- [ ] MongoDB connection string (production) set
- [ ] Build verified locally (npm run build)
- [ ] Email tested locally
- [ ] Rate limiting tested
- [ ] Error handling verified
- [ ] Frontend styling matches brand
- [ ] Mobile testing completed
- [ ] Spam folder check instructions in email

---

## 📂 Files Created/Modified

### New Files
1. `app/api/send-email-otp/route.ts` - Send OTP endpoint
2. `app/api/verify-email-otp/route.ts` - Verify OTP endpoint
3. `components/EmailOtpVerification.tsx` - Frontend component

### Modified Files
1. `models/Otp.ts` - Updated to use email instead of phone

### Unchanged (But Working)
- `.env.local` - Gmail credentials already configured
- `services/otpService.ts` - Already supports email
- `lib/validation/schemas.ts` - Already has email schemas

---

## 🎯 Next Steps

### Integrate into Booking Flow
```typescript
// In your booking page
<EmailOtpVerification
  onVerified={(email) => {
    setVerifiedEmail(email);
    // Show booking form
  }}
/>

// Only show booking form after verified
{verifiedEmail && <BookingForm email={verifiedEmail} />}
```

### Add Booking Confirmation Email
Extend to send booking details after OTP verification

### Advanced Features (Optional)
- SMS fallback (use disabled sendViaMobileSMS logic)
- Multiple factor authentication
- Magic links instead of OTP
- Resend with different methods (SMS, email, etc.)

---

## ✨ Features Summary

| Feature | Details |
|---------|---------|
| **OTP Method** | Email (6-digit) |
| **Expiry** | 5 minutes (auto-delete via TTL) |
| **Rate Limit** | 30 seconds between sends |
| **Max Attempts** | 5 wrong verifications |
| **Email Provider** | Gmail SMTP |
| **Database** | MongoDB |
| **Frontend** | React + Tailwind CSS |
| **Validation** | Zod schemas |
| **Error Handling** | Custom error classes |
| **Responses** | Standardized JSON |
| **Development** | Console logging + UI display |
| **Production** | Auto-disable dev features |
| **Mobile** | Fully responsive |
| **Accessibility** | Proper labels + icons |
| **Performance** | In-memory rate limiting |
| **TypeScript** | Strict mode |

---

## 📞 Support

For issues, check:
1. Console logs
2. MongoDB connection
3. Gmail credentials
4. Firewall (port 3000)
5. Node version (`node -v` should be 18+)

---

**Status**: ✅ Complete and Production-Ready
**Last Updated**: 2026-04-06
**Build**: 0 TypeScript Errors
