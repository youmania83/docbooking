# Component & API Reference

## 🎯 Main Component: AppointmentDateTimeSelector

### Location
```
components/AppointmentDateTimeSelector.tsx
```

### Props
```typescript
interface AppointmentDateTimeSelectorProps {
  // Required
  onSelectionChange: (date: Date | null, time: string | null) => void;
  selectedDate: Date | null;
  selectedTime: string | null;
  
  // Optional
  availableSlots?: string[];      // Default: 10 time slots
  minDaysFromNow?: number;        // Default: 0
  maxDaysFromNow?: number;        // Default: 30
  isLoadingSlots?: boolean;       // Default: false
  error?: string | null;          // Default: null
  className?: string;             // Additional CSS classes
}
```

### Usage Example
```tsx
import AppointmentDateTimeSelector from "@/components/AppointmentDateTimeSelector";
import { useState } from "react";

export default function DoctorBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleAppointmentChange = (date: Date | null, time: string | null) => {
    setSelectedDate(date);
    setSelectedTime(time);
  };

  return (
    <div>
      <AppointmentDateTimeSelector
        onSelectionChange={handleAppointmentChange}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        availableSlots={["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]}
        minDaysFromNow={0}
        maxDaysFromNow={30}
      />
      
      {selectedDate && selectedTime && (
        <button onClick={handleConfirmBooking}>
          Book Appointment on {selectedDate.toDateString()} at {selectedTime}
        </button>
      )}
    </div>
  );
}
```

---

## 📍 Sub-Components

### Calendar (shadcn/ui)
**File**: `components/ui/calendar.tsx`
- Uses `react-day-picker`
- Customizable date ranges
- Disabled date management
- Responsive grid layout

### Button (shadcn/ui)
**File**: `components/ui/button.tsx`
- Variants: default, outline, ghost
- Sizes: sm, default, lg
- Consistent styling

---

## 🔗 API Integration

### Booking Creation Endpoint
```
POST /api/bookings
```

### Request Payload
```json
{
  "patientName": "John Doe",
  "age": 30,
  "gender": "Male",
  "phone": "9876543210",
  "doctorId": "507f1f77bcf86cd799439011",
  "appointmentDate": "2024-12-25",
  "appointmentTime": "10:00 AM",
  "email": "john@example.com"    // Optional
}
```

### Response
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "patientName": "John Doe",
    "appointmentDate": "2024-12-25T00:00:00.000Z",
    "appointmentTime": "10:00 AM",
    "phone": "9876543210",
    "doctorId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-12-20T10:30:00.000Z",
    "updatedAt": "2024-12-20T10:30:00.000Z"
  },
  "message": "Booking created successfully"
}
```

---

## 🗄️ Database Schema

### Booking Model
```typescript
interface IBooking extends Document {
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  doctorId: mongoose.Types.ObjectId;
  appointmentDate: Date;          // NEW
  appointmentTime: string;        // NEW
  slot?: string;                  // LEGACY
  email?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Validation Rules
- `appointmentDate`: Required, must be Date type
- `appointmentTime`: Required, must match `/^\d{2}:\d{2}\s(AM|PM)$/i`
- `phone`: Required, 10 digits
- `patientName`: Required, 2-100 characters
- `age`: Required, 1-150

---

## 🎨 Styling Classes

### Component CSS Classes
```css
/* Calendar */
.rdp { }                    /* Root element */
.rdp-day_selected { }       /* Selected day */
.rdp-day_today { }          /* Today's date */
.rdp-day_disabled { }       /* Disabled dates */

/* Animations */
.animate-fadeIn { }         /* Fade-in effect */
.animate-slideUp { }        /* Slide-up effect */

/* States */
.animate-pulse { }          /* Loading skeleton */
```

### Tailwind Classes Used
```
bg-white rounded-2xl shadow-lg border-gray-100
bg-blue-600 text-white hover:bg-blue-700
bg-blue-50 border-l-4 border-blue-600
bg-gray-50 border-gray-200
grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4
```

---

## 🔧 Service Layer

### BookingService
**File**: `services/bookingService.ts`

#### `createBooking(bookingData)`
```typescript
type BookingData = {
  patientName: string;
  age: number;
  gender: string;
  phone: string;
  doctorId: string;
  appointmentDate: string | Date;
  appointmentTime: string;
  slot?: string;
  email?: string;
};

function createBooking(bookingData: BookingData): Promise<any>
```

**Validations**:
- Patient name length (2-100 chars)
- Age range (1-150)
- Gender enum (Male, Female, Other)
- Phone format (10 digits)
- Doctor ID format (valid ObjectId)
- Appointment date format (valid Date)
- Appointment time format (HH:MM AM/PM)

**Returns**: Created booking document

---

## 📞 Error Handling

### Validation Errors
```
"Invalid or missing required fields."
"Patient name must be between 2 and 100 characters."
"Age must be a valid number between 1 and 150."
"Gender must be Male, Female, or Other."
"Phone number must be a valid 10-digit number."
"Invalid appointment date."
"Appointment time must be in HH:MM AM/PM format."
"Doctor not found."
```

### Component Errors
```
error={null}                        // No error
error="Failed to load slots"        // Custom error message
```

---

## 🎯 State Management

### Controller Component Pattern
```tsx
const [selectedDate, setSelectedDate] = useState<Date | null>(null);
const [selectedTime, setSelectedTime] = useState<string | null>(null);

const handleAppointmentChange = (date: Date | null, time: string | null) => {
  setSelectedDate(date);
  setSelectedTime(time);
};

// Pass to component
<AppointmentDateTimeSelector
  onSelectionChange={handleAppointmentChange}
  selectedDate={selectedDate}
  selectedTime={selectedTime}
/>

// On new booking
setSelectedDate(null);
setSelectedTime(null);
```

---

## 📱 Responsive Behavior

### Desktop (≥1024px)
```
Calendar and Time Slots: Side by side
Doctor Info: Sticky on left (height: 100vh)
Booking Section: Takes 3 columns
Time Slot Grid: 3 columns
```

### Tablet (768px - 1023px)
```
Doctor Info: Above booking section
Calendar: Full width
Time Slots: 2-3 columns
```

### Mobile (<768px)
```
Doctor Info: Above booking section (collapsed)
Calendar: Full width
Time Slots: 2 column grid
Buttons: Full width
```

---

## 🔄 Booking Flow Integration

### Step 1: Appointment Selection (NEW)
```tsx
bookingStep === "appointment-selection"
├─ Show AppointmentDateTimeSelector
├─ Show Booking Summary
└─ Enable "Proceed to Verification" when both selected
```

### Step 2: OTP Verification (EXISTING)
```tsx
bookingStep === "otp-verification"
├─ Show verified date/time from Step 1
├─ Send OTP
└─ Proceed to patient details
```

### Step 3: Patient Details (EXISTING)
```tsx
bookingStep === "patient-details"
├─ Show verified date/time/phone from previous steps
├─ Collect name, age, gender
└─ Submit to confirmation
```

### Step 4: Confirmation Modal (UPDATED)
```tsx
<BookingConfirmationModal
  appointmentDate={selectedDate}
  slot={selectedTime}
  // ... other props
/>
```

---

## 🚀 Performance Optimizations

### Bundle Size
- Date-fns: Tree-shaked (~9KB)
- react-day-picker: Optimized (~8KB)
- Total impact: ~18KB

### Rendering
- CSS animations (no JavaScript overhead)
- Component memoization where needed
- No unnecessary re-renders

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management

---

## 📊 Component Props Flow

```
DoctorDetailPage
  ├─ selectedDate (state)
  ├─ selectedTime (state)
  ├─ handleAppointmentChange (handler)
  │
  └─→ AppointmentDateTimeSelector
      ├─ onSelectionChange={handleAppointmentChange}
      ├─ selectedDate={selectedDate}
      ├─ selectedTime={selectedTime}
      ├─ availableSlots={doctor.slots}
      └─→ Calendar (via DayPicker)
          └─→ Time Slot Buttons
              └─ onClick → onSelectionChange
```

---

## 🔐 Security Checklist

- [x] Input validation (frontend)
- [x] Input validation (backend)
- [x] Date format validation
- [x] Time format validation
- [x] Doctor ID validation
- [x] Phone validation
- [x] No SQL injection (MongoDB)
- [x] XSS protection (React)
- [x] CSRF protection (Next.js)

---

## 🧪 Test Cases

### Calendar Selection
- [x] Past dates disabled
- [x] Today highlighted
- [x] Future dates (0-30 days) enabled
- [x] Clicking date triggers onSelectionChange
- [x] Time section appears after date select

### Time Slot Selection
- [x] All slots displayed
- [x] Clicking slot updates selectedTime
- [x] Selected slot highlighted
- [x] Only one slot can be selected
- [x] Deselecting date clears time

### State Management
- [x] Both date and time required
- [x] Button disabled until both selected
- [x] New booking resets states
- [x] Back button stops selection

### Mobile
- [x] Calendar responsive
- [x] Time slots 2-column on mobile
- [x] Touch-friendly button sizes
- [x] No horizontal scroll

---

## 📝 Type Definitions

### Date & Time
```typescript
type SelectedDate = Date | null;
type SelectedTime = string | null;  // Format: "HH:MM AM/PM"
type TimeSlot = string;             // Format: "09:00 AM"

interface DateSelection {
  date: SelectedDate;
  time: SelectedTime;
}
```

### Component Events
```typescript
type AppointmentChangeHandler = (
  date: Date | null,
  time: string | null
) => void;
```

---

## 🎓 Code Examples

### Example 1: Basic Usage
```tsx
<AppointmentDateTimeSelector
  onSelectionChange={(date, time) => setAppointment({ date, time })}
  selectedDate={appointment.date}
  selectedTime={appointment.time}
/>
```

### Example 2: With Doctor Data
```tsx
<AppointmentDateTimeSelector
  onSelectionChange={handleChange}
  selectedDate={selectedDate}
  selectedTime={selectedTime}
  availableSlots={doctor.slots}
/>
```

### Example 3: Custom Date Range
```tsx
<AppointmentDateTimeSelector
  onSelectionChange={handleChange}
  selectedDate={selectedDate}
  selectedTime={selectedTime}
  minDaysFromNow={1}      // No same-day bookings
  maxDaysFromNow={60}     // Allow up to 60 days
/>
```

### Example 4: With Error Handling
```tsx
<AppointmentDateTimeSelector
  onSelectionChange={handleChange}
  selectedDate={selectedDate}
  selectedTime={selectedTime}
  isLoadingSlots={loading}
  error={error}
/>
```

---

## 🌐 Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

**Version**: 1.0.0
**Last Updated**: December 2024
**Status**: Production Ready ✅
