# 🏥 DocBooking - Doctor Appointment Booking Platform

A production-grade, full-stack doctor booking platform built with Next.js 16, TypeScript, MongoDB, and Tailwind CSS.

**Status**: ✅ Production Ready | Live on Vercel

## ✨ Key Features

### User Features
- 🏠 **Modern Homepage** - Professional doctor booking platform
- 👨‍⚕️ **Doctor Listing & Search** - Browse verified doctors with specialties
- 📅 **Appointment Booking** - Select slots and confirm bookings
- 📧 **Email OTP Verification** - Secure user verification before booking
- 💾 **Persistent Data** - MongoDB backend for all data

### Admin Features
- 🔐 **Admin Dashboard** - Manage doctors and bookings
- 👤 **Admin Authentication** - Secure login with tokens
- 🏥 **Doctor Management** - Add/edit doctor details
- 📊 **Booking Management** - View all patient appointments
- 🧹 **Data Cleanup** - Remove duplicate doctor entries

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 16.2.2 (App Router) |
| **Language** | TypeScript (strict mode) |
| **Database** | MongoDB Atlas |
| **Authentication** | JWT tokens + cookies |
| **Email Service** | Gmail SMTP (Nodemailer) |
| **Styling** | Tailwind CSS v4 |
| **Validation** | Zod schemas |
| **Deployment** | Vercel |

## 📋 Prerequisites

- Node.js 18.0+
- npm or yarn
- MongoDB Atlas account (for database)
- Gmail account with app password (for OTP emails)

## 🚀 Quick Start (Local Development)

### 1. Clone & Install

```bash
cd /path/to/Docbooking
npm install
```

### 2. Configure Environment

Create `.env.local` file:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/docbooking?appName=Docbooking

# Admin
ADMIN_PASSWORD=your_secure_password

# Gmail OTP
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password

# Environment
NODE_ENV=development
```

### 3. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## 🌐 Production Deployment (Vercel)

### 1. Setup Vercel

```bash
# Link project to Vercel
npx vercel link

# Push to GitHub
git add .
git commit -m "Production deployment"
git push origin main
```

### 2. Set Environment Variables in Vercel

Go to **Project Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas URI |
| `ADMIN_PASSWORD` | Your admin password |
| `GMAIL_USER` | Your Gmail address |
| `GMAIL_APP_PASSWORD` | Your 16-char app password |
| `NODE_ENV` | `production` |

### 3. Deploy

Vercel auto-deploys when you push to `main` branch.

Monitor at: https://vercel.com/dashboard

---

## 📚 Project Structure

```
docbooking/
├── app/                          # Next.js App Router
│   ├── api/                     # API routes (14 endpoints)
│   ├── admin/                   # Admin dashboard
│   ├── doctor/[id]/             # Doctor detail page
│   ├── doctors/                 # Doctor listing
│   └── layout.tsx               # Root layout
├── components/                   # React components
│   ├── EmailOtpVerification.tsx # OTP component
│   ├── PatientDetailsForm.tsx   # Booking form
│   └── ...
├── lib/                          # Utilities
│   ├── mongodb.ts               # Database connection
│   ├── validation/              # Zod schemas
│   └── utils/                   # Error handling, responses
├── models/                       # Mongoose schemas
│   ├── Doctor.ts
│   ├── Booking.ts
│   └── Otp.ts
├── services/                     # Business logic
│   ├── bookingService.ts
│   ├── doctorService.ts
│   └── otpService.ts
├── styles/                       # CSS
└── public/                       # Static assets
```

---

## 🔐 Security Features

✅ **Input Validation** - Zod schemas on all inputs  
✅ **Rate Limiting** - 30-second cooldown on OTP  
✅ **Attempt Limiting** - 5 failed attempts lockout  
✅ **OTP Expiry** - 5-minute auto-delete  
✅ **Admin Auth** - Secure token-based authentication  
✅ **Password Security** - Never stored in code  
✅ **Email Validation** - Regex-based email checks  
✅ **Error Handling** - Standardized error responses  

---

## 📈 API Endpoints

### User APIs
- `POST /api/send-email-otp` - Send OTP to email
- `POST /api/verify-email-otp` - Verify OTP code
- `GET /api/doctors` - Get doctors list
- `GET /api/doctors?id=xxx` - Get doctor by ID
- `POST /api/bookings` - Create appointment
- `GET /api/bookings` - Get bookings (with filters)

### Admin APIs
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `POST /api/admin/remove-duplicate-doctors` - Remove duplicates
- `POST /api/doctors` - Add new doctor

---

## 🧪 Testing

### Local Testing

```bash
# Test email OTP API
curl -X POST http://localhost:3000/api/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Production Testing

```bash
# Test on deployed site
curl -X POST https://your-docbooking.vercel.app/api/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## 📊 Build & Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Build Status
- ✅ TypeScript: 0 errors
- ✅ Build Time: ~1 second
- ✅ Dependencies: Clean & minimal
- ✅ Production Ready: Yes

---

## 🆘 Troubleshooting

### Email not sending?
- Check `GMAIL_USER` and `GMAIL_APP_PASSWORD` in Vercel
- Verify Gmail app password (not regular password)
- Check spam folder

### Database connection error?
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access
- Ensure connection string includes password with special characters escaped

### Admin login fails?
- Verify `ADMIN_PASSWORD` in Vercel environment
- Clear browser cookies and try again

---

## 📝 Documentation

See full audit report: [PRODUCTION_AUDIT.md](./PRODUCTION_AUDIT.md)

---

## 📄 License

Private project. All rights reserved.

---

**Last Updated**: April 6, 2026  
**Status**: ✅ Production Ready

### 2. Run Development Server

```bash
npm run dev
```

The application will start at **http://localhost:3000**

### 3. Build for Production

```bash
npm run build

# Start production server
npm start
```

## 📂 Project Structure

```
Docbooking/
├── app/
│   ├── page.tsx              # Homepage
│   ├── layout.tsx            # Root layout with header
│   ├── globals.css           # Global styles
│   ├── doctors/
│   │   └── page.tsx          # Doctors listing page
│   └── doctor/
│       └── [id]/
│           └── page.tsx      # Doctor detail & booking page
├── components/
│   └── DoctorCard.tsx        # Reusable doctor card component
├── lib/
│   └── data.ts               # Hardcoded doctor data
├── public/                   # Static assets
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript config
├── tailwind.config.ts        # Tailwind CSS config
└── next.config.ts            # Next.js config
```

## 📄 Pages Overview

### Home Page (`/`)
- Hero section with headline: "Skip OPD Queues in Panipat"
- Subtext: "Book doctor appointments instantly & avoid long waiting"
- Call-to-action button linking to doctors page
- Feature cards highlighting benefits
- Professional footer

### Doctors Listing (`/doctors`)
- Grid layout of doctor cards
- Each card shows:
  - Doctor name
  - Specialty
  - Consultation fee
  - "View & Book" button
- Responsive grid (1 column on mobile, 2 on tablet, 4 on desktop)

### Doctor Detail (`/doctor/[id]`)
- Doctor profile with avatar, name, specialty
- Experience badge and location
- Time slot selector (buttons)
- Selected slot highlighting
- Booking summary with fee
- "Confirm Booking" button
- Demo alert showing booking confirmation

## 🎨 UI Features

- Clean, modern design with blue (#0066CC) and white color scheme
- Rounded cards with subtle shadows
- Smooth hover transitions and animations
- Professional typography
- Proper spacing and padding
- Accessibility-friendly components
- Mobile-first responsive design

## 📝 How It Works

1. **User lands on homepage** → Clicks "Book Appointment"
2. **Redirected to doctors page** → Sees list of 4 doctors
3. **Clicks "View & Book"** → Goes to doctor detail page
4. **Selects time slot** → Button gets highlighted in blue
5. **Clicks "Confirm Booking"** → Demo alert shows confirmation
6. **Can go back** → Use back button to explore other doctors

## 🔧 Customization

### Add More Doctors

Edit `lib/data.ts`:

```typescript
export const doctors: Doctor[] = [
  {
    id: "5",
    name: "Dr. Your Name",
    specialty: "Your Specialty",
    fee: 500,
    slots: ["10:00 AM", "2:00 PM", "4:00 PM"],
  },
  // ... more doctors
];
```

### Change Colors

Edit `tailwind.config.ts` or modify color classes in components:

```tsx
// Replace "bg-blue-600" with any Tailwind color
className="bg-blue-600 hover:bg-blue-700"
```

### Modify Time Slots

Edit slots array in `lib/data.ts`:

```typescript
slots: ["9:00 AM", "10:30 AM", "2:00 PM", "3:30 PM"]
```

## ✅ Features Ready to Show Hospitals

✓ Professional branding (DocBooking.in)  
✓ Easy-to-understand flow  
✓ Instant booking confirmation  
✓ Mobile-responsive design  
✓ Clean, healthcare-themed UI  
✓ Real doctor specialties  
✓ Realistic pricing  
✓ Available time slots  

## 🎯 Next Steps for Production

1. **Backend Integration** - Connect to database for real doctors and bookings
2. **User Authentication** - Add login/signup system
3. **Payment Gateway** - Integrate Razorpay/Stripe for payments
4. **SMS/Email Notifications** - Send confirmations to users
5. **Admin Dashboard** - Manage doctors, slots, and bookings
6. **Hospital Onboarding** - Allow hospitals to add their own doctors
7. **Real Database** - Replace hardcoded data with MongoDB/PostgreSQL

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## 🐛 Troubleshooting

**Port 3000 already in use?**
```bash
npm run dev -- -p 3001
```

**Build failing?**
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

**TypeScript errors?**
```bash
# Check types
npx tsc --noEmit
```

## 📞 Contact & Support

**Email**: demo@docbooking.in  
**City**: Panipat, India

---

**Made with ❤️ for healthcare in Panipat**

⭐ If you find this useful, please leave a star! 🌟
