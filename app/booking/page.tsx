'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

/** Parse "9:00 AM" / "5:00 PM" → minutes from midnight. Null on bad input. */
function slotToMinutes(slot: string): number | null {
  const m = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) return null;
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3].toUpperCase();
  if (mer === 'PM' && h !== 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return h * 60 + min;
}

/** Today's date string (YYYY-MM-DD) in IST, regardless of browser/server TZ. */
function istTodayStr(): string {
  const istMs = Date.now() + 5.5 * 60 * 60 * 1000;
  const d = new Date(istMs);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

/** Minimum minutes in the future a slot must be to remain selectable. */
const SLOT_LEAD_TIME_MINUTES = 15;

// ── Single test doctor (seeded in DB) ──────────────────────────────────────
const DOCTOR = {
  id: '69dfb9df45c4632eca5bcb8a',
  name: 'Dr. Amit Sharma',
  specialty: 'General Physician',
  clinicName: 'DocBooking Clinic',
  address: 'Model Town, Panipat, Haryana 132103',
  phone: '9876543210',
  opdFees: 500,
  googleLocation: 'https://maps.google.com/?q=Model+Town+Panipat+Haryana',
  slots: [
    '9:00 AM', '9:30 AM',
    '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM',
    '12:00 PM',
    '2:00 PM', '2:30 PM',
    '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM',
    '5:00 PM',
  ],
};

type Step = 'phone' | 'otp' | 'booking' | 'success';

interface BookingResult {
  uid: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
}

export default function BookingPage() {
  const [step, setStep] = useState<Step>('phone');

  // Step 1 & 2 state
  const [userName, setUserName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  // Step 3 state
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmed, setConfirmed] = useState<BookingResult | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Today's date in IST (YYYY-MM-DD) — prevents booking yesterday after midnight IST
  const today = istTodayStr();
  // 30 days from now for max date (IST)
  const maxDate = (() => {
    const istMs = Date.now() + 5.5 * 60 * 60 * 1000 + 30 * 24 * 60 * 60 * 1000;
    const d = new Date(istMs);
    const y = d.getUTCFullYear();
    const mo = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${mo}-${day}`;
  })();

  // Re-render every minute so past slots update as the clock advances.
  const [nowTick, setNowTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Minimum slot minutes for today (now+lead). 0 for future dates.
  const earliestSlotMinutes = useMemo(() => {
    if (appointmentDate !== today) return 0;
    const istMs = nowTick + 5.5 * 60 * 60 * 1000;
    const ist = new Date(istMs);
    return ist.getUTCHours() * 60 + ist.getUTCMinutes() + SLOT_LEAD_TIME_MINUTES;
  }, [appointmentDate, today, nowTick]);

  // Auto-deselect slot if it's now in the past.
  useEffect(() => {
    if (!appointmentTime) return;
    const mins = slotToMinutes(appointmentTime);
    if (mins !== null && mins < earliestSlotMinutes) {
      setAppointmentTime('');
    }
  }, [appointmentTime, earliestSlotMinutes]);

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/send-otp-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, userName: userName || 'DocBooking User' }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('otp');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ────────────────────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/verify-otp-v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setSessionToken(data.sessionToken);
        setStep('booking');
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3: Confirm Booking ───────────────────────────────────────────────
  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken,
        },
        body: JSON.stringify({
          patientName: userName,
          phone,
          doctorId: DOCTOR.id,
          appointmentDate,
          appointmentTime,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmed(data.appointment);
        setStep('success');
      } else {
        setError(data.message || 'Booking failed. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('phone');
    setUserName('');
    setPhone('');
    setOtp('');
    setSessionToken('');
    setAppointmentDate('');
    setAppointmentTime('');
    setConfirmed(null);
    setError('');
  };

  // ── Step indicators ───────────────────────────────────────────────────────
  const steps = ['phone', 'otp', 'booking', 'success'];
  const stepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Book Appointment</h1>
          <p className="text-gray-500 text-sm mt-1">{DOCTOR.name} · {DOCTOR.specialty}</p>

          {/* Step dots */}
          <div className="flex justify-center items-center gap-2 mt-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white transition-colors ${
                  stepIndex >= n - 1 ? 'bg-indigo-600' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {n}
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-5">
            {error}
          </div>
        )}

        {/* ── STEP 1: Phone ── */}
        {step === 'phone' && (
          <form onSubmit={handleSendOTP} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                placeholder="e.g. Rahul Sharma"
                value={userName}
                onChange={(e) => {
                  // Allow only letters, spaces, hyphens, apostrophes, dots
                  const cleaned = e.target.value.replace(/[^A-Za-z\s.'-]/g, '');
                  // Collapse multiple spaces and trim leading whitespace
                  setUserName(cleaned.replace(/\s{2,}/g, ' ').trimStart());
                }}
                pattern="[A-Za-z\s.'\-]{2,}"
                title="Name can only contain letters, spaces, hyphens, apostrophes and dots"
                minLength={2}
                maxLength={60}
                autoComplete="name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp Number</label>
              <input
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={10}
                required
              />
              <p className="text-xs text-gray-400 mt-1">OTP will be sent to this WhatsApp number</p>
            </div>
            <button
              type="submit"
              disabled={loading || phone.length !== 10 || !userName.trim() || !termsAccepted}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Sending OTP…' : 'Send OTP via WhatsApp →'}
            </button>
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                required
              />
              <span className="text-xs text-gray-500 leading-snug">
                I agree to the{' '}
                <Link href="/terms" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">
                  Terms of Use
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </Link>
                , and consent to receiving WhatsApp notifications.
              </span>
            </label>
          </form>
        )}

        {/* ── STEP 2: OTP ── */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <p className="text-gray-500 text-sm text-center">
              Enter the 6-digit OTP sent to <span className="font-semibold text-gray-700">+91 {phone}</span>
            </p>
            <div>
              <input
                type="text"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-3xl tracking-[0.5em] font-mono text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                maxLength={6}
                autoFocus
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Verifying…' : 'Verify OTP →'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
              className="w-full text-indigo-500 hover:text-indigo-700 text-sm font-medium py-1"
            >
              ← Change phone number
            </button>
          </form>
        )}

        {/* ── STEP 3: Booking ── */}
        {step === 'booking' && (
          <form onSubmit={handleConfirmBooking} className="space-y-5">
            {/* Verified badge */}
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-2 rounded-lg">
              <span>✅</span>
              <span>Phone verified: <strong>+91 {phone}</strong></span>
            </div>

            {/* Doctor card */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-xs text-indigo-500 uppercase font-semibold mb-1">Booking with</p>
              <p className="font-bold text-gray-900">{DOCTOR.name}</p>
              <p className="text-sm text-gray-600">{DOCTOR.specialty} · {DOCTOR.clinicName}</p>
              <p className="text-sm text-gray-500 mt-1">{DOCTOR.address}</p>
              <p className="text-indigo-600 font-bold mt-2">₹{DOCTOR.opdFees} consultation fee</p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Appointment Date</label>
              <input
                type="date"
                value={appointmentDate}
                min={today}
                max={maxDate}
                aria-label="Appointment Date"
                onChange={(e) => { setAppointmentDate(e.target.value); setAppointmentTime(''); }}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Time slot */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Time Slot</label>
              <div className="grid grid-cols-3 gap-2">
                {DOCTOR.slots.map((slot) => {
                  const mins = slotToMinutes(slot);
                  const disabled = mins !== null && mins < earliestSlotMinutes;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setAppointmentTime(slot)}
                      title={disabled ? 'This slot is in the past' : undefined}
                      className={`py-2 px-1 text-sm rounded-lg border font-medium transition ${
                        disabled
                          ? 'bg-gray-100 text-gray-400 border-gray-200 line-through cursor-not-allowed opacity-60'
                          : appointmentTime === slot
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              {appointmentDate === today && (
                <p className="text-xs text-gray-500 mt-2">
                  Past time slots for today are disabled.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !appointmentDate || !appointmentTime}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition"
            >
              {loading ? 'Booking…' : '✔ Confirm Appointment'}
            </button>
          </form>
        )}

        {/* ── STEP 4: Success ── */}
        {step === 'success' && confirmed && (
          <div className="text-center space-y-5">
            <div className="text-5xl mb-2">🎉</div>
            <h2 className="text-xl font-bold text-gray-800">Appointment Confirmed!</h2>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Patient</span>
                <span className="font-semibold text-gray-800">{userName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Doctor</span>
                <span className="font-semibold text-gray-800">{DOCTOR.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Clinic</span>
                <span className="font-semibold text-gray-800">{DOCTOR.clinicName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-800">{confirmed.appointmentDate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Time</span>
                <span className="font-semibold text-indigo-600">{confirmed.appointmentTime}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Status</span>
                <span className="font-semibold text-green-600 capitalize">{confirmed.status}</span>
              </div>
              <div className="pt-2 border-t border-green-200 text-xs text-gray-400">
                Booking ID: {confirmed.uid}
              </div>
            </div>

            <p className="text-sm text-gray-500">
              A WhatsApp confirmation will be sent to +91 {phone}
            </p>

            <button
              onClick={handleReset}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Book Another Appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
