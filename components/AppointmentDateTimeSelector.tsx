"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle } from "lucide-react"
import { format, addDays, isToday, isBefore, startOfDay } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"

/**
 * Parse a slot label like "09:00 AM" or "5:00 PM" into minutes-from-midnight.
 * Returns null on malformed input.
 */
function slotToMinutes(slot: string): number | null {
  const match = slot.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return null
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const meridian = match[3].toUpperCase()
  if (meridian === "PM" && hours !== 12) hours += 12
  if (meridian === "AM" && hours === 12) hours = 0
  return hours * 60 + minutes
}

/** Minimum minutes in the future a slot must be to remain selectable. */
const SLOT_LEAD_TIME_MINUTES = 15

interface TimeSlot {
  time: string
  available: boolean
}

interface AppointmentDateTimeSelectorProps {
  onSelectionChange: (date: Date | null, time: string | null) => void
  selectedDate: Date | null
  selectedTime: string | null
  availableSlots?: string[]
  minDaysFromNow?: number
  maxDaysFromNow?: number
  isLoadingSlots?: boolean
  error?: string | null
  className?: string
}

/**
 * AppointmentDateTimeSelector Component
 * 
 * Premium appointment date and time selection system with:
 * - Calendar date picker with disabled past dates
 * - Available time slots after date selection
 * - Smooth animations and transitions
 * - Mobile responsive design
 * - Accessibility features
 */
export default function AppointmentDateTimeSelector({
  onSelectionChange,
  selectedDate,
  selectedTime,
  availableSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "02:00 PM",
    "02:30 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ],
  minDaysFromNow = 0,
  maxDaysFromNow = 30,
  isLoadingSlots = false,
  error = null,
  className,
}: AppointmentDateTimeSelectorProps) {
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(selectedDate)

  // Re-render every minute so slot availability stays in sync with the clock.
  const [nowTick, setNowTick] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowTick(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  // Calculate disabled dates
  const disabledDates = useCallback((date: Date) => {
    const today = startOfDay(new Date())
    const minDate = addDays(today, minDaysFromNow)
    const maxDate = addDays(today, maxDaysFromNow)

    return isBefore(date, minDate) || isBefore(maxDate, date)
  }, [minDaysFromNow, maxDaysFromNow])

  // Earliest bookable time (in minutes from midnight) for the selected date.
  // For today, it's "now + lead time". For future dates, zero (all slots allowed).
  const earliestSlotMinutes = useMemo(() => {
    if (!internalSelectedDate) return 0
    if (!isToday(internalSelectedDate)) return 0
    const now = new Date(nowTick)
    return now.getHours() * 60 + now.getMinutes() + SLOT_LEAD_TIME_MINUTES
  }, [internalSelectedDate, nowTick])

  const isSlotDisabled = useCallback(
    (slot: string) => {
      const mins = slotToMinutes(slot)
      if (mins === null) return false
      return mins < earliestSlotMinutes
    },
    [earliestSlotMinutes]
  )

  // If the user already picked a slot that is now in the past (e.g., they
  // lingered on the page past the lead time), unselect it.
  useEffect(() => {
    if (selectedTime && isSlotDisabled(selectedTime)) {
      onSelectionChange(internalSelectedDate, null)
    }
  }, [selectedTime, isSlotDisabled, internalSelectedDate, onSelectionChange])

  // Handle date selection
  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return

      setInternalSelectedDate(date)
      onSelectionChange(date, null) // Reset time when date changes
    },
    [onSelectionChange]
  )

  // Handle time selection
  const handleTimeSelect = useCallback(
    (time: string) => {
      onSelectionChange(internalSelectedDate, time)
    },
    [internalSelectedDate, onSelectionChange]
  )

  // Format display date
  const formattedDate = useMemo(() => {
    if (!internalSelectedDate) return null
    return format(internalSelectedDate, "EEEE, MMMM d, yyyy")
  }, [internalSelectedDate])

  return (
    <div className={cn("w-full space-y-8", className)}>
      {/* Date Selection Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 overflow-visible">
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <CalendarIcon size={24} className="text-blue-600" />
            Select Appointment Date
          </h3>
          <p className="text-gray-600 text-sm">
            Choose your preferred appointment date
          </p>
        </div>

        {/* Calendar Grid */}
        <div className="flex justify-center mb-6 w-full">
          <Calendar
            mode="single"
            selected={internalSelectedDate ?? undefined}
            onSelect={handleDateSelect}
            disabled={disabledDates}
            className=""
          />
        </div>

        {/* Selected Date Display */}
        {internalSelectedDate && (
          <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <CheckCircle size={20} className="text-blue-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Selected Date
                </p>
                <p className="text-blue-600 font-bold text-lg">{formattedDate}</p>
              </div>
            </div>
          </div>
        )}

        {!internalSelectedDate && (
          <div className="text-center text-gray-400 text-sm py-6">
            Click on a date to select
          </div>
        )}
      </div>

      {/* Time Slot Selection Section */}
      {internalSelectedDate && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-slideUp">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Clock size={24} className="text-blue-600" />
              Select Appointment Time
            </h3>
            <p className="text-gray-600 text-sm">
              Choose your preferred time slot
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold text-sm">{error}</p>
              </div>
            </div>
          )}

          {isLoadingSlots ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {availableSlots.map((slot) => {
                const disabled = isSlotDisabled(slot)
                return (
                  <button
                    key={slot}
                    onClick={() => !disabled && handleTimeSelect(slot)}
                    disabled={disabled}
                    className={cn(
                      "py-3 px-3 rounded-lg font-semibold transition-all duration-200 border-2 text-center text-sm sm:text-base",
                      disabled
                        ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed line-through opacity-60"
                        : "hover:shadow-md active:scale-95",
                      !disabled && selectedTime === slot
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg ring-2 ring-blue-300"
                        : !disabled
                        ? "bg-white text-gray-900 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                        : ""
                    )}
                    aria-pressed={selectedTime === slot}
                    aria-disabled={disabled}
                    aria-label={disabled ? `${slot} (unavailable, past time)` : `Select ${slot}`}
                    title={disabled ? "This slot is in the past" : undefined}
                  >
                    {slot}
                  </button>
                )
              })}
            </div>
            {isToday(internalSelectedDate as Date) && (
              <p className="text-xs text-gray-500 mb-4">
                Past time slots for today are disabled. Select a future time or another date.
              </p>
            )}
            </>
          )}

          {/* Selected Time Display */}
          {selectedTime && !isLoadingSlots && (
            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-4 animate-fadeIn">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-blue-600 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold">
                    Selected Time
                  </p>
                  <p className="text-blue-600 font-bold text-lg">{selectedTime}</p>
                </div>
              </div>
            </div>
          )}

          {!selectedTime && !isLoadingSlots && (
            <div className="text-center text-gray-500 text-sm py-4">
              Select a time slot to continue
            </div>
          )}
        </div>
      )}

      {/* Availability Summary Card */}
      {internalSelectedDate && selectedTime && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 animate-slideUp">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle size={24} className="text-green-600" />
            <h4 className="text-lg font-bold text-gray-900">
              Appointment Ready
            </h4>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                Date
              </p>
              <p className="text-gray-900 font-bold">{formattedDate}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase font-semibold mb-1">
                Time
              </p>
              <p className="text-gray-900 font-bold">{selectedTime}</p>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}
