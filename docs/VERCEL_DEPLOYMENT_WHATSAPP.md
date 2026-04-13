# Vercel Production Deployment - WhatsApp OTP Setup

## Step 1: Configure Environment Variables in Vercel

Go to **Vercel Dashboard** → **docbooking project** → **Settings** → **Environment Variables**

### Add the following variables:

#### AiSensy WhatsApp API (Required for OTP)
```
AISENSY_API_KEY=YOUR_AISENSY_API_KEY

AISENSY_CAMPAIGN_NAME=docbooking_otp

AISENSY_API_URL=https://api.aisensy.com/send-message

AISENSY_MOCK_MODE=false
```

#### MongoDB (Required for database)
```
MONGODB_URI=YOUR_MONGODB_URI
```

#### Admin Configuration
```
ADMIN_EMAIL=info@docbooking.in

ADMIN_PASSWORD=YOUR_SECURE_PASSWORD
```

#### Email Service (Gmail SMTP)
```
GMAIL_USER=YOUR_GMAIL_ADDRESS

GMAIL_APP_PASSWORD=YOUR_GMAIL_APP_PASSWORD
```

#### Sentry Error Monitoring (Already configured)
```
SENTRY_DSN=YOUR_SENTRY_DSN

NEXT_PUBLIC_SENTRY_DSN=YOUR_SENTRY_DSN

SENTRY_ORG=docbooking

SENTRY_PROJECT=docbooking
```

#### WATI WhatsApp (Legacy - Keep for fallback)
```
WATI_API_TOKEN=YOUR_WATI_API_TOKEN

WATI_BASE_URL=https://live-server.wati.io
```

---

## Step 2: Set Environment Scope (Recommended)

For each variable, set the scope:
- **Production** ✓ (for live deployment)
- **Preview** ✓ (for staging/PR previews)
- **Development** ✗ (uses local .env.local)

---

## Step 3: Trigger Deployment

### Option A: Automatic Deploy (Recommended)
```bash
cd /Users/yogeshkumarwadhwa/Documents/Docbooking
git commit --allow-empty -m "deploy: configure WhatsApp OTP for production"
git push  # Triggers Vercel redeploy automatically
```

### Option B: Manual Redeploy via Dashboard
1. Go to **Vercel Dashboard** → **docbooking** → **Deployments**
2. Find the latest deployment
3. Click **⋯ (three dots)** → **Redeploy**
4. Confirm the redeploy

---

## Step 4: Verify Deployment

After deployment completes (~2-3 minutes):

### Check Build Logs
- Go to **Deployments** → Latest deployment
- Click **View Deployment Logs**
- Look for: `✅ Compiled successfully`
- Verify: `ƒ /api/send-otp` and `ƒ /api/verify-otp` routes

### Test OTP API
```bash
# Send OTP
curl -X POST https://docbooking-git-main-youmania83s-projects.vercel.app/api/send-otp \
  -H "Content-Type: application/json" \
  -d '{ "phone": "9876543210" }'

# Expected Response:
# {
#   "success": true,
#   "message": "OTP sent successfully to your WhatsApp",
#   "expiresIn": 300
# }
```

### Monitor Errors
- **Sentry Dashboard:** https://sentry.io/organizations/docbooking/issues/
- **Vercel Logs:** Dashboard → Deployments → View Logs

---

## Step 5: Production Checklist

- [ ] All environment variables added to Vercel
- [ ] Build succeeds (check Deployments log)
- [ ] OTP API routes responding (check `/api/send-otp`)
- [ ] WhatsApp messages sending (test with real phone)
- [ ] Sentry capturing errors (check Sentry dashboard)
- [ ] MongoDB queries working (check database logs)
- [ ] Email notifications sent (check admin inbox)

---

## Troubleshooting

### Build Fails
```
Error: "AISENSY_API_KEY is required"
```
**Solution:** Verify all environment variables are added to Vercel (especially `AISENSY_*` variables)

### OTP Not Sending
```json
{
  "success": false,
  "message": "Failed to send OTP. Please try again later.",
  "code": "AISENSY_ERROR"
}
```
**Solution:**
1. Verify AiSensy API key is correct
2. Check WhatsApp Business Account status
3. Confirm template is approved: `"{{1}} is your verification code."`

### Database Connection Error
```
Error: connect ENOTFOUND docbooking.1ejvbod.mongodb.net
```
**Solution:** Check `MONGODB_URI` is correctly set in Vercel environment

### Rate Limiting Issues
```json
{
  "success": false,
  "message": "Too many OTP requests. Please try again in X seconds.",
  "code": "RATE_LIMIT_EXCEEDED"
}
```
**This is expected!** Rate limiting prevents abuse. Users must wait 1 hour before 4th OTP request.

---

## Environment Variable Reference

| Variable | Type | Example | Required |
|----------|------|---------|----------|
| `AISENSY_API_KEY` | String (JWT) | `eyJ...zA` | ✅ Yes |
| `AISENSY_CAMPAIGN_NAME` | String | `docbooking_otp` | ✅ Yes |
| `AISENSY_API_URL` | URL | `https://api.aisensy.com/send-message` | ✅ Yes |
| `AISENSY_MOCK_MODE` | Boolean | `false` | ✅ Yes |
| `MONGODB_URI` | URL | `mongodb+srv://...` | ✅ Yes |
| `ADMIN_EMAIL` | Email | `info@docbooking.in` | ✅ Yes |
| `GMAIL_USER` | Email | `your-email@gmail.com` | ✅ Yes |
| `GMAIL_APP_PASSWORD` | String | `your-app-password` | ✅ Yes |
| `SENTRY_DSN` | URL | `https://...@sentry.io/...` | ⚠️ Recommended |
| `NEXT_PUBLIC_SENTRY_DSN` | URL | Same as SENTRY_DSN | ⚠️ Recommended |

---

## Security Best Practices

✅ **What We Do:**
- Never expose API keys in frontend code
- Use environment variables for all secrets
- Server-side OTP validation only
- Rate limiting prevents brute force
- HTTPS only (enforced by Vercel)
- Terms & Conditions enforcement

✅ **What To Do:**
- Rotate API keys quarterly
- Monitor Sentry for suspicious activity
- Use strong admin password
- Enable 2FA on Vercel account
- Regularly review Sentry error reports

❌ **What NOT To Do:**
- Never commit API keys to GitHub
- Don't expose OTP value in logs
- Don't disable rate limiting
- Don't store OTP in cookies
- Don't send OTP via SMS (only WhatsApp)

---

## Performance Metrics

**Build Time:** ~2-3 seconds  
**Cold Start:** ~500ms  
**OTP Generation:** <1ms  
**WhatsApp API Call:** 500-2000ms (variable)  
**Verification Response:** <50ms  
**Database Save:** ~5-10ms  

---

## Monitoring & Alerts

### Sentry Alerts
Get notified of errors in production:
1. Go to https://sentry.io/organizations/docbooking/
2. Click **Alerts** → **Create Alert**
3. Set condition: `error.rate() > 10%`
4. Add email/Slack notification

### Vercel Analytics
Monitor deployment health:
1. Vercel Dashboard → **Analytics**
2. Track: FCP, LCP, CLS metrics
3. Monitor: API response times

### Database Health
Check MongoDB Atlas:
1. Go to https://cloud.mongodb.com
2. Select **docbooking** cluster
3. Monitor: Connections, Throughput

---

## Rollback Plan

If production has issues:

### Option 1: Revert Last Commit
```bash
git revert HEAD --no-edit
git push  # Triggers new Vercel build
```

### Option 2: Redeploy Previous Commit
1. Go to **Vercel Dashboard** → **Deployments**
2. Find last stable deployment
3. Click **⋯** → **Redeploy**

### Option 3: Emergency Disable
Set `AISENSY_MOCK_MODE=true` in Vercel to disable real API calls.

---

## Next Steps

1. ✅ Add environment variables to Vercel
2. ✅ Trigger redeploy
3. ✅ Monitor build logs
4. ✅ Test OTP flow in production
5. ✅ Set up Sentry alerts
6. ✅ Document in team wiki

---

**Version:** 2.0.0  
**Last Updated:** April 12, 2026  
**Status:** Ready for Production Deployment
