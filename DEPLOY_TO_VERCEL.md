# 🚀 Deploy to Vercel - Production Checklist

## ✅ Pre-Deployment Status
- Build: ✅ Compiled successfully
- TypeScript: ✅ 0 errors
- Email OTP: ✅ Working on localhost
- Database: ✅ MongoDB connected
- Environment: ✅ .env.local configured

---

## 📋 Deployment Steps

### **Step 1: Commit & Push to GitHub**

```bash
cd /Users/yogeshkumarwadhwa/Documents/Docbooking

# Add all changes
git add .

# Commit with message
git commit -m "Add Email OTP verification system - production ready"

# Push to main branch
git push origin main
```

---

### **Step 2: Set Environment Variables in Vercel**

Go to your Vercel project dashboard:
1. **Project Settings** → **Environment Variables**
2. Add these variables:

| Variable | Value | Notes |
|----------|-------|-------|
| `MONGODB_URI` | `mongodb+srv://admin:...@docbooking.1ejvbod.mongodb.net/docbooking?appName=Docbooking` | Already set from previous deployment |
| `ADMIN_PASSWORD` | `***REMOVED***` | Already set |
| `GMAIL_USER` | `***REMOVED***` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | `***REMOVED***` | Gmail app-specific password |
| `NODE_ENV` | `production` | Set to production |

#### **⚠️ Important: Add GMAIL_USER and GMAIL_APP_PASSWORD**

These are **NEW** for the Email OTP feature:
- `GMAIL_USER`: `***REMOVED***`
- `GMAIL_APP_PASSWORD`: `***REMOVED***`

**Why separate password?**
- Never use your actual Gmail password in production
- Use an app-specific password from Google Account → Security → App Passwords
- Already set up for ***REMOVED***

---

### **Step 3: Deploy via Git Push**

Once you push to main:
1. Vercel automatically detects the push
2. Builds and deploys automatically
3. Deployment takes 2-5 minutes

**Check deployment status:**
```bash
# View Vercel deployments (if using Vercel CLI)
vercel list

# Or go to: https://vercel.com/dashboard → your-project
```

---

### **Step 4: Verify Deployment**

Once deployed, test your live site:

**Test Email OTP:**
```bash
curl -X POST https://your-docbooking.vercel.app/api/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "***REMOVED***"}'
```

**Expected Response (production):**
```json
{
  "success": true,
  "data": {
    "email": "***REMOVED***",
    "expiresIn": 300,
    "message": "OTP sent successfully. Check your email."
  },
  "message": "OTP sent to your email"
}
```

**Note:** In production, `devOtp` is NOT included in response (unlike development)

---

## 🔗 Production URLs

After deployment, your live URLs will be:

| Endpoint | URL |
|----------|-----|
| **Homepage** | `https://your-docbooking.vercel.app` |
| **Doctors List** | `https://your-docbooking.vercel.app/doctors` |
| **Doctor Detail** | `https://your-docbooking.vercel.app/doctor/[id]` |
| **Send OTP API** | `https://your-docbooking.vercel.app/api/send-email-otp` |
| **Verify OTP API** | `https://your-docbooking.vercel.app/api/verify-email-otp` |
| **Bookings API** | `https://your-docbooking.vercel.app/api/bookings` |

---

## 📧 Email Testing in Production

Once deployed:

1. Go to: `https://your-docbooking.vercel.app/doctors`
2. Select a doctor
3. Select a time slot
4. Click "Confirm Booking"
5. **Enter your email** (or ***REMOVED***)
6. **Click "Send OTP to Email"**
7. Wait for email (check inbox + spam folder)
8. Enter the 6-digit code
9. Click "Verify OTP"
10. ✅ Success! Email verified

---

## 🆘 Troubleshooting

### **Issue: Email not sending in production**

**Check:**
1. Environment variables set in Vercel Settings
2. GMAIL_USER and GMAIL_APP_PASSWORD correct
3. Gmail account allows less secure apps (or use app password)
4. Check Vercel deployment logs for errors

**View Logs:**
- Go to Vercel Dashboard
- Select your project
- Go to Deployments tab
- Click latest deployment
- View Function Logs

### **Issue: "Email service not configured"**

**Solution:**
- Go to Vercel Project Settings
- Verify `GMAIL_USER` is set
- Verify `GMAIL_APP_PASSWORD` is set
- Redeploy: `git push origin main`

### **Issue: OTP verification fails**

**Check:**
- OTP is correct (check email)
- OTP hasn't expired (5 minute expiry)
- User didn't exceed 5 failed attempts
- Test with `curl` commands above

---

## 📊 What's Being Deployed

### **New Files (Live)**
- ✅ `/api/send-email-otp` - Send OTP endpoint
- ✅ `/api/verify-email-otp` - Verify OTP endpoint
- ✅ `components/EmailOtpVerification.tsx` - Email verification component
- ✅ `models/Otp.ts` - Email-based OTP model

### **Updated Files (Live)**
- ✅ `app/doctor/[id]/page.tsx` - Now uses EmailOtpVerification
- ✅ `.env` - Production environment variables

### **Infrastructure (Already Live)**
- ✅ MongoDB Atlas (production database)
- ✅ Nodemailer (email service)
- ✅ Gmail SMTP (email sending)

---

## 🔐 Security Best Practices

✅ **Implemented:**
- Rate limiting (30 seconds between sends)
- Attempt limiting (5 failed attempts max)
- OTP expiry (5 minutes auto-delete)
- Email validation (Zod schemas)
- No sensitive data in logs
- Environment variables for secrets
- HTTPS only in production

---

## 📈 Monitoring

### **Check if live:**
1. Visit: `https://your-docbooking.vercel.app`
2. Go to: `https://your-docbooking.vercel.app/doctors`
3. Try booking flow with email OTP
4. Should receive email in inbox

### **Monitor Email Sending:**
- Check Vercel logs for any errors
- Monitor MongoDB for OTP collection growth
- Check Gmail sent folder for emails sent

---

## ✨ Next Steps After Going Live

1. **Test thoroughly** on production
2. **Share with users** - start marketing
3. **Monitor email delivery** - check spam rates
4. **Collect feedback** - iterate on UX
5. **Scale** - optimize if needed

---

## 📞 Quick Reference

**When deploying:**
```bash
# 1. Commit changes
git add .
git commit -m "message"
git push origin main

# 2. Set Vercel env vars:
# MONGODB_URI
# ADMIN_PASSWORD  
# GMAIL_USER
# GMAIL_APP_PASSWORD
# NODE_ENV=production

# 3. Vercel auto-deploys
# Check: vercel.com/dashboard

# 4. Test email OTP on production
```

---

**Status: Ready for Production Deployment** ✅

Your Email OTP system is battle-tested on localhost and ready for live production on Vercel!
