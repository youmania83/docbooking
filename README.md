# 🏥 DocBooking.in - Doctor OPD Booking Demo

A modern, fully functional demo website for booking doctor appointments in Panipat, India. Built with Next.js, TypeScript, and Tailwind CSS.

**Perfect for showcasing to hospitals and healthcare facilities!**

## ✨ Features

- 🏠 **Professional Homepage** - Eye-catching hero with clear call-to-action
- 👨‍⚕️ **Doctor Listing** - Grid layout with doctor cards (name, specialty, fee)
- 📅 **Booking Page** - Select doctor, choose time slot, and confirm booking
- 💾 **Hardcoded Data** - 4 sample doctors with appointment slots (no database needed)
- 📱 **Fully Responsive** - Mobile, tablet, and desktop optimized
- 🎨 **Premium UI** - Blue & white theme with smooth animations and hover effects
- ⚡ **Production Ready** - TypeScript, ESLint configured

## 🏥 Sample Doctors Included

1. **Dr. Tushar Kalra** - General Physician - ₹300/visit
2. **Dr. Ashootosh Kalra** - Surgeon - ₹500/visit
3. **Dr. Keerat Kalra** - Gynecologist - ₹400/visit
4. **Dr. Pankaj Bajaj** - Orthopedic - ₹600/visit

Each doctor has 3-5 available time slots throughout the day.

## 🛠️ Tech Stack

- **Framework**: Next.js 16.2.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Node**: npm

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm (comes with Node.js)

## 🚀 Quick Start

### 1. Installation

```bash
# Navigate to the project directory
cd /path/to/Docbooking

# Install dependencies
npm install
```

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
