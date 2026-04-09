# AiSensy WhatsApp OTP System - Setup & Integration Guide

## 📋 Table of Contents
1. [AiSensy Setup](#aisensy-setup)
2. [Environment Configuration](#environment-configuration)
3. [API Routes Reference](#api-routes-reference)
4. [Frontend Component Usage](#frontend-component-usage)
5. [Integration Examples](#integration-examples)
6. [Deployment Guide](#deployment-guide)
7. [Testing Guide](#testing-guide)

---

## 🚀 AiSensy Setup

### Step 1: Create AiSensy Account

1. Go to **https://www.aisensy.com**
2. Click **Sign Up** and create an account
3. Complete email verification
4. Fill in business details

### Step 2: Get API Credentials

1. Login to AiSensy Dashboard
2. Go to **Settings → API**
3. You'll see:
   - **API Key** - Copy this
   - **API URL** - Usually `https://api.aisensy.com/send-message`
4. Note your **Campaign Name** (e.g., `docbooking_otp`)

### Step 3: Create WhatsApp Template

1. Go to **Templates** in AiSensy dashboard
2. Click **Create Template**
3. Fill in:
   - **Template Name**: `docbooking_otp`
   - **Category**: Authentication/OTP
   - **Message Body**:
     ```
     {{1}} is your verification code. For your security, do not share this code.
     ```
4. Click **Submit for Approval**
5. Wait for approval (usually 2-4 hours)

---

## 🔧 Environment Configuration

### Add to `.env.local`

```bash
# AiSensy Configuration
AISENSY_API_KEY=your_api_key_from_aisensy_dashboard
AISENSY_CAMPAIGN_NAME=docbooking_otp
AISENSY_API_URL=https://api.aisensy.com/send-message
```

### For Production (Vercel)

1. Go to **Vercel Dashboard** → Your Project
2. Settings → **Environment Variables**
3. Add each variable:
   - `AISENSY_API_KEY` → Your API key
   - `AISENSY_CAMPAIGN_NAME` → `docbooking_otp`
   - `AISENSY_API_URL` → `https://api.aisensy.com/send-message`
4. Select Environment: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

---

## 📡 API Routes Reference

### 1. Send OTP

**Endpoint**: `POST /api/send-otp`

**Request**:
```json
{
  "phone": "9876543210"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "OTP sent successfully to your WhatsApp",
  "expiresIn": 300,
  "data": {
    "phone": "+919876543210",
    "expiresIn": 300
  }
}
```

**Response (Error - 400)**:
```json
{
  "success": false,
  "message": "Invalid phone number. Please provide a valid Indian phone number"
}
```

**Response (Rate Limited - 429)**:
```json
{
  "success": false,
  "message": "Too many OTP requests. Please try again in 3520 seconds."
}
```

**Response (Cooldown - 429)**:
```json
{
  "success": false,
  "message": "Please wait 18 seconds before requesting another OTP."
}
```

### 2. Verify OTP

**Endpoint**: `POST /api/verify-otp`

**Request**:
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "phone": "+919876543210",
    "verified": true
  }
}
```

**Response (Error - 401)**:
```json
{
  "success": false,
  "message": "Invalid OTP. 2 attempts remaining."
}
```

---

## 🎨 Frontend Component Usage

### Basic Usage

```tsx
import PhoneVerification from "@/components/PhoneVerificationAiSensy";

export default function LoginPage() {
  const handlePhoneVerified = (phone: string) => {
    console.log("Phone verified:", phone);
    // Redirect to next step or save to database
  };

  const handleSessionToken = (token: string) => {
    console.log("Session token:", token);
    // Save token to localStorage or cookie
    localStorage.setItem("docbooking_session", token);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <PhoneVerification 
        onVerified={handlePhoneVerified}
        onSessionToken={handleSessionToken}
      />
    </div>
  );
}
```

### With Callback Handling

```tsx
"use client";

import { useState } from "react";
import PhoneVerification from "@/components/PhoneVerificationAiSensy";
import { useRouter } from "next/navigation";

export default function BookingPage() {
  const router = useRouter();
  const [userPhone, setUserPhone] = useState("");

  const handleVerified = (phone: string) => {
    setUserPhone(phone);
    // Proceed to next step
    router.push(`/booking?phone=${encodeURIComponent(phone)}`);
  };

  const handleSessionToken = (token: string) => {
    // Save session
    localStorage.setItem("auth_token", token);
  };

  return (
    <PhoneVerification
      onVerified={handleVerified}
      onSessionToken={handleSessionToken}
    />
  );
}
```

---

## 💡 Integration Examples

### Example 1: Complete Booking Flow

```tsx
// app/book-appointment/page.tsx

"use client";

import { useState } from "react";
import PhoneVerification from "@/components/PhoneVerificationAiSensy";
import BookingForm from "@/components/BookingForm";

export default function BookAppointment() {
  const [step, setStep] = useState<"verify" | "book">("verify");
  const [verifiedPhone, setVerifiedPhone] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {step === "verify" ? (
          <div>
            <h1 className="text-3xl font-bold text-center mb-8">
              Book Your Appointment
            </h1>
            <PhoneVerification
              onVerified={(phone) => {
                setVerifiedPhone(phone);
                setStep("book");
              }}
            />
          </div>
        ) : (
          <BookingForm phone={verifiedPhone} />
        )}
      </div>
    </div>
  );
}
```

### Example 2: Using Session Token

```tsx
// app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { validateSessionToken } from "@/lib/session-token";

export default function Dashboard() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("docbooking_session");

    if (!token) {
      router.push("/login");
      return;
    }

    const payload = validateSessionToken(token);
    if (!payload || !payload.verified) {
      router.push("/login");
      return;
    }

    setPhone(payload.phone);
    setLoading(false);
  }, [router]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Welcome, {phone}</h1>
      {/* Dashboard content */}
    </div>
  );
}
```

### Example 3: With Error Handling

```tsx
// pages/verify.tsx

"use client";

import { useState } from "react";
import PhoneVerification from "@/components/PhoneVerificationAiSensy";

export default function VerifyPhonePage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleVerified = async (phone: string) => {
    try {
      // Save phone to database
      const response = await fetch("/api/save-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) throw new Error("Failed to save phone");

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error occurred");
    }
  };

  return (
    <div className="container mx-auto py-8">
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 rounded">
          ✓ Phone verified! Redirecting...
        </div>
      )}
      <PhoneVerification onVerified={handleVerified} />
    </div>
  );
}
```

---

## 🚀 Deployment Guide

### Step 1: Build Verification

```bash
npm run build
```

Should output:
```
✓ Compiled successfully
✓ Generating static pages (15/15)
✓ No errors
```

### Step 2: Set Environment Variables in Vercel

```bash
# Login to Vercel
vercel env pull

# Or manually in Vercel Dashboard:
# Settings → Environment Variables
AISENSY_API_KEY = your_key
AISENSY_CAMPAIGN_NAME = docbooking_otp
AISENSY_API_URL = https://api.aisensy.com/send-message
```

### Step 3: Deploy

```bash
# Push to GitHub
git add .
git commit -m "Add AiSensy WhatsApp OTP system"
git push origin main

# Vercel auto-deploys
# Or manually:
vercel deploy --prod
```

### Step 4: Verify Deployment

```bash
# Test OTP endpoint
curl -X POST https://yourdomain.com/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Should return success response
```

---

## 🧪 Testing Guide

### Local Testing

#### 1. Test Send OTP

```bash
# Start dev server
npm run dev

# In another terminal, send OTP
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Expected response:
# {
#   "success": true,
#   "message": "OTP sent successfully to your WhatsApp",
#   "expiresIn": 300
# }

# Check WhatsApp - should receive:
# "123456 is your verification code. For your security, do not share this code."
```

#### 2. Test Verify OTP

```bash
curl -X POST http://localhost:3000/api/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210", "otp": "123456"}'

# Expected response:
# {
#   "success": true,
#   "message": "OTP verified successfully",
#   "verified": true,
#   "phone": "+919876543210"
# }
```

#### 3. Test Rate Limiting

```bash
# Send 3 OTPs quickly
for i in {1..3}; do
  curl -X POST http://localhost:3000/api/send-otp \
    -H "Content-Type: application/json" \
    -d '{"phone": "9876543210"}'
done

# 4th request should fail with rate limit error
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Response:
# {
#   "success": false,
#   "message": "Too many OTP requests. Please try again in 3600 seconds."
# }
```

#### 4. Test Cooldown

```bash
# Send OTP
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Immediately try again
curl -X POST http://localhost:3000/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{"phone": "9876543210"}'

# Response:
# {
#   "success": false,
#   "message": "Please wait 28 seconds before requesting another OTP."
# }
```

### Browser Testing

1. Open `http://localhost:3000`
2. Enter phone number (e.g., 9876543210)
3. Click "Send OTP"
4. Check WhatsApp for message
5. Enter 6-digit OTP
6. Click "Verify OTP"
7. Verify success message

---

## 🔐 Security Features

✅ **Rate Limiting**: Max 3 requests per hour per phone  
✅ **Cooldown**: 30 seconds between requests  
✅ **OTP Expiry**: 5 minute validity  
✅ **Failed Attempts**: Max 3 before lockout  
✅ **Phone Validation**: Indian format only  
✅ **Backend-Only**: API key never exposed to frontend  
✅ **Session Tokens**: Secure phone verification tracking  

---

## 📊 Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request / Invalid input |
| 401 | Invalid OTP |
| 429 | Rate limited / Cooldown active |
| 500 | Server error |

---

## 🆘 Troubleshooting

### OTP Not Sending

1. ✅ Check `AISENSY_API_KEY` is correct
2. ✅ Verify template is approved in AiSensy
3. ✅ Check phone number format
4. ✅ Verify AiSensy account balance
5. ✅ Check server logs

### Rate Limit Error

Max 3 requests per hour. Wait or modify in `/lib/otp-manager.ts`:

```typescript
return limit.count >= 3; // Change 3 to higher number
```

### API Key Invalid

1. Copy API key from AiSensy dashboard again
2. Remove any whitespace
3. Update `.env.local`
4. Restart dev server

### WhatsApp Message Not Received

1. Confirm phone number is WhatsApp-registered
2. Check AiSensy template is approved
3. Verify API key has permissions
4. Check AiSensy account status

---

## 📞 Support

**AiSensy Documentation**: https://docs.aisensy.com  
**AiSensy Support**: support@aisensy.com  
**GitHub Issues**: Your repo

---

**Version**: 1.0.0  
**Last Updated**: April 9, 2026  
**Status**: Production Ready ✅
