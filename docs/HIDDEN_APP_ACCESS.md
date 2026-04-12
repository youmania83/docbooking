# Hidden App Access - Quick Guide

## 🔒 Access the Main Application

The main DocBooking application is now available via a **hidden, password-protected route**.

---

## **🚀 Access Methods**

### **Method 1: Query Parameter (Quickest)**
```
http://localhost:3000/app?preview=true
```
✅ Direct access with query parameter - No password needed!

---

### **Method 2: Password Prompt (Secure)**
```
http://localhost:3000/app
```
**Default Password:** `docbooking2026`

1. Navigate to `/app`
2. You'll see a lock icon & password prompt
3. Enter: `docbooking2026`
4. Click "Access App" ✓

---

## **📍 Route Mapping**

| Route | Purpose | Public |
|-------|---------|--------|
| `/` | Coming Soon Landing | ✅ Yes |
| `/app` | Main Application | ❌ Protected |
| `/app?preview=true` | Direct Access | ❌ Protected |
| `/doctors` | Browse Doctors | ✅ Yes |
| `/doctor/[id]` | Book Doctor | ✅ Yes |

---

## **💡 What's Inside the /app Route**

Once accessed (via password or query param), you get:
- ✅ Full doctor booking platform
- ✅ All features: search, filter, appointments
- ✅ OTP verification with WhatsApp
- ✅ Patient details collection
- ✅ Booking confirmation

---

## **🔑 Credentials**

| Field | Value |
|-------|-------|
| **Password** | `docbooking2026` |
| **Preview Param** | `?preview=true` |
| **Session Memory** | 24 hours (stored in sessionStorage) |

---

## **🧪 Testing Locally**

### **Start Dev Server**
```bash
npm run dev
```

### **Access via Query Param (No Password)**
```
http://localhost:3000/app?preview=true
```

### **Access via Password**
```
http://localhost:3000/app
# Enter password: docbooking2026
```

### **Coming Soon Page Remains**
```
http://localhost:3000/
# Still shows marketing/coming soon landing
```

---

## **🌐 Production URLs**

### **Coming Soon (Public)**
```
https://docbooking.vercel.app/
```

### **Hidden App Access**
```
https://docbooking.vercel.app/app?preview=true
```

Or with password:
```
https://docbooking.vercel.app/app
# Password: docbooking2026
```

---

## **🔒 Security Features**

✅ **Query Parameter Check:** Fast access for authorized traffic  
✅ **Password Protection:** Fallback security layer  
✅ **Session Storage:** Remembers auth for 24 hours (per browser)  
✅ **Client-Side Auth:** Enough for internal/early-access use  
✅ **No Database Queries:** Fast & lightweight  

---

## **⚙️ Technical Details**

**File:** `/app/app/page.tsx`

**Flow:**
```
/app route accessed
    ↓
Check query param (?preview=true)
    ↓ If YES → Authorize & show app
    ↓ If NO → Check session storage
    ↓ If HIT → Authorize & show app
    ↓ If MISS → Show password prompt
    ↓
User enters password
    ↓
Match against: "docbooking2026"
    ↓ Correct → Store in sessionStorage & show app
    ↓ Wrong → Show error, try again
```

---

## **🎯 Use Cases**

### **Beta Testing**
Share: `https://docbooking.vercel.app/app?preview=true`
→ Direct access, no password needed

### **Team Access**
Share: `https://docbooking.vercel.app/app`
→ Users enter password: `docbooking2026`

### **Internal Testing**
Local: `http://localhost:3000/app?preview=true`
→ Quick access during development

---

## **🔄 Switching Between Pages**

| Scenario | URL |
|----------|-----|
| View landing/coming soon | `/` |
| Access app (no auth) | `/app?preview=true` |
| Access app (with auth) | `/app` + password |
| Browse doctors (public) | `/doctors` |
| Book appointment | Click doctor card |

---

## **📋 Checklist**

- [x] Coming Soon page at `/` ✓
- [x] Main app at `/app` with password ✓
- [x] Query param bypass `?preview=true` ✓
- [x] Session storage for 24-hour memory ✓
- [x] Clean UI with lock icon ✓
- [x] Error handling & retry logic ✓
- [x] Build successful (22 routes) ✓
- [x] Deployed to production ✓

---

## **🚀 Quick Start (2 Steps)**

### **Step 1: Start Server**
```bash
npm run dev
```

### **Step 2: Access App**
```
http://localhost:3000/app?preview=true
```
✅ You're in! Full app ready to test.

---

## **🆘 Troubleshooting**

| Issue | Solution |
|-------|----------|
| "Password incorrect" | Try: `docbooking2026` |
| Query param not working | Check URL: `/app?preview=true` (exact) |
| Session expired | Reload page, auth again (or use query param) |
| Landing page shown | Try `/app` instead of `/` |
| Build fails | Run `npm ci` then `npm run build` |

---

## **🔐 Changing Password**

To change from `docbooking2026` to something else:

**File:** `app/app/page.tsx` (Line ~10)
```typescript
const APP_ACCESS_PASSWORD = "NEW_PASSWORD_HERE";
```

Then rebuild:
```bash
npm run build
```

---

**Status:** ✅ Live & Ready  
**Commits:** `31e96c4`  
**Routes:** 22 total (1 new hidden app route)

