# 🔧 Code Reference & Quick Tips

## 📁 File Structure at a Glance

```
lib/data.ts           ← All doctor data lives here
components/           ← Reusable React components
  └── DoctorCard.tsx  ← Single doctor card
app/                  ← Next.js pages
  ├── page.tsx        ← Homepage (/)
  ├── layout.tsx      ← Header & layout wrapper
  ├── doctors/
  │   └── page.tsx    ← Doctor listing (/doctors)
  └── doctor/
      └── [id]/
          └── page.tsx ← Booking page (/doctor/[id])
```

---

## 💡 Quick Code Snippets

### Adding a New Doctor

**File**: `lib/data.ts`

```typescript
{
  id: "5",
  name: "Dr. New Doctor",
  specialty: "Specialty Name",
  fee: 500,
  slots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
}
```

### Modifying Doctor Card Styling

**File**: `components/DoctorCard.tsx`

```tsx
// Change button color
className="bg-blue-600 hover:bg-blue-700"  // Default
className="bg-green-600 hover:bg-green-700" // New color

// Change card shadow
shadow-md    // Light shadow
shadow-lg    // Medium shadow
shadow-xl    // Heavy shadow
```

### Changing Homepage Headline

**File**: `app/page.tsx`

```tsx
// Current
<h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
  Skip OPD Queues in Panipat
</h1>

// Change to:
<h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-4">
  Your Custom Headline Here
</h1>
```

### Update Website Branding

**File**: `app/layout.tsx`

```tsx
// Change this:
<h1 className="text-xl font-bold text-gray-900">DocBooking.in</h1>

// To:
<h1 className="text-xl font-bold text-gray-900">Your Brand Name</h1>
```

### Modify Time Slot Display

**File**: `app/doctor/[id]/page.tsx`

Search for:
```tsx
{doctor.slots.map((slot) => (
  <button...>
    {slot}
  </button>
))}
```

The slots come from `lib/data.ts` - just modify the slots array there.

---

## 🎨 Tailwind Color Reference

Common colors used in the project:

```
Blue Theme:
  bg-blue-50      ← Light background
  bg-blue-600     ← Main blue button
  bg-blue-700     ← Hover state
  text-blue-600   ← Text links

Gray Theme:
  bg-white        ← Cards
  bg-gray-50      ← Background
  bg-gray-200     ← Dividers
  text-gray-900   ← Headings
  text-gray-600   ← Body text

Status:
  bg-green-600    ← Success
  bg-red-600      ← Error
```

To change theme, search & replace in all files:
- `bg-blue-600` → Your color
- `text-blue-600` → Your color

---

## 📱 Responsive Design Breakpoints

```
sm   640px    ← Small devices (phones)
md   768px    ← Tablets
lg  1024px    ← Large screens
xl  1280px    ← Extra large
```

Used like:
```tsx
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
```

---

## 🔄 Component Props

### DoctorCard Props

```typescript
interface DoctorCardProps {
  doctor: Doctor;
}

// Usage:
<DoctorCard doctor={doctorObject} />
```

### Doctor Data Structure

```typescript
interface Doctor {
  id: string;
  name: string;
  specialty: string;
  fee: number;
  slots: string[];
}

// Example:
{
  id: "1",
  name: "Dr. Tushar Kalra",
  specialty: "General Physician",
  fee: 300,
  slots: ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM"]
}
```

---

## 🚀 Useful Terminal Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for errors
npm run lint

# Install a package
npm install package-name

# Remove a package
npm uninstall package-name

# Check Next.js version
npm list next

# Clear cache
rm -rf .next
```

---

## 🔍 Debugging Tips

### Check if server is running
```bash
curl http://localhost:3000
```

### View server logs
Check terminal where `npm run dev` is running

### TypeScript errors
```bash
npx tsc --noEmit
```

### Check installed packages
```bash
npm list
```

---

## 📝 File-by-File Overview

### lib/data.ts
```typescript
// Get doctor by ID
const doctor = getDoctorById("1");

// Access all doctors
const allDoctors = doctors; // Array of 4 doctors
```

### components/DoctorCard.tsx
```tsx
// Displays:
// - Doctor name
// - Specialty (blue badge)
// - Consultation fee
// - "View & Book" button
// - Hover shadow effect
```

### app/page.tsx
```tsx
// Homepage with:
// - Hero headline
// - CTA button → /doctors
// - 3 feature cards
// - Stats section
// - Footer
```

### app/doctors/page.tsx
```tsx
// Maps through all doctors
// Renders DoctorCard for each
// Responsive grid (1-4 columns)
```

### app/doctor/[id]/page.tsx
```tsx
// Dynamic page for each doctor
// Shows all details
// Time slot selection
// Booking confirmation (demo alert)
```

---

## 🎯 Common Customizations

### Change Button Text
Find button text in `.tsx` files and edit:
```tsx
<button>
  Change This Text
</button>
```

### Add New Feature Card (Homepage)

In `app/page.tsx`, copy this and modify:
```tsx
<div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
  <Icon className="text-blue-600 mb-4" size={40} />
  <h3 className="text-xl font-semibold text-gray-900 mb-2">
    Feature Title
  </h3>
  <p className="text-gray-600">
    Feature description
  </p>
</div>
```

### Modify Doctor Grid Layout

In `app/doctors/page.tsx`, find:
```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
```

Change to:
- `lg:grid-cols-3` → 3 columns on large screens
- `lg:grid-cols-5` → 5 columns on large screens
- `lg:grid-cols-2` → 2 columns on large screens

---

## 🔐 TypeScript Types

Key types in the project:

```typescript
// Doctor type
type Doctor = {
  id: string;
  name: string;
  specialty: string;
  fee: number;
  slots: string[];
}

// Function return type
function getDoctorById(id: string): Doctor | undefined {
  // Returns doctor or undefined
}

// React component prop types
interface DoctorCardProps {
  doctor: Doctor;
}
```

---

## 📊 Page Load Metrics

From development server logs:

- Homepage (`/`) - ~1.4s (first load uses Next.js compilation)
- Doctors page (`/doctors`) - ~157ms
- Doctor detail (`/doctor/[id]`) - ~450ms

Subsequent loads are much faster due to caching.

---

## 🌐 URL Routes Reference

```
/                    → Homepage (hero + features)
/doctors             → All doctors listing
/doctor/1            → Dr. Tushar Kalra booking
/doctor/2            → Dr. Ashootosh Kalra booking
/doctor/3            → Dr. Keerat Kalra booking
/doctor/4            → Dr. Pankaj Bajaj booking
/doctor/999          → Not found page
```

---

## 💾 Data Flow

```
User visits /
    ↓
Loads app/page.tsx (Homepage)
    ↓
User clicks "Book Appointment"
    ↓
Navigates to /doctors
    ↓
Loads app/doctors/page.tsx
    ↓
Maps through doctors from lib/data.ts
    ↓
Renders DoctorCard for each
    ↓
User clicks "View & Book" on a card
    ↓
Navigates to /doctor/[id]
    ↓
Loads app/doctor/[id]/page.tsx
    ↓
Gets doctor by ID using getDoctorById()
    ↓
Displays doctor details and slots
    ↓
User selects slot and confirms
    ↓
Shows demo alert (no backend)
```

---

## 📚 Resources for Learning

- **Next.js**: https://nextjs.org/docs
- **Tailwind**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **React**: https://react.dev
- **Lucide Icons**: https://lucide.dev

---

## ✅ Testing Checklist

- [ ] Homepage loads and displays hero
- [ ] "Book Appointment" button works
- [ ] Doctor listing page shows 4 cards
- [ ] Each card has correct info
- [ ] "View & Book" navigates to detail page
- [ ] Time slots display correctly
- [ ] Clicking slots highlights them
- [ ] "Confirm Booking" shows alert
- [ ] Back button works
- [ ] Mobile responsive on phone
- [ ] Hover effects work
- [ ] No console errors

---

**Happy Coding! 🚀**
