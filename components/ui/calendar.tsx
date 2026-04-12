import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("rdp", className)}
      classNames={{
        months: "flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0",
        month: "space-y-4 w-full",
        caption: "flex items-center justify-between pt-1 relative mb-6",
        caption_label: "text-lg font-bold text-gray-900",
        nav: "space-x-1 flex items-center justify-between absolute top-0 left-0 right-0 w-full",
        nav_button: cn(
          "h-9 w-9 bg-blue-50 border-2 border-blue-200 rounded-lg p-0 hover:bg-blue-100 hover:border-blue-400 transition-all text-blue-600 hover:text-blue-700"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse space-y-2 mt-4",
        head_row: "flex gap-3 mb-2",
        head_cell: "text-gray-600 rounded-lg w-10 font-bold text-xs uppercase text-center tracking-wider",
        row: "flex gap-3 w-full",
        cell: "h-11 w-11 text-center p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-11 w-11 p-0 font-semibold rounded-lg text-sm text-gray-900 hover:bg-blue-50 hover:text-blue-600 transition-all duration-150 border-2 border-transparent",
          "aria-selected:opacity-100"
        ),
        day_selected: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600 shadow-md",
        day_today: "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900 font-bold border-2 border-blue-400 ring-2 ring-blue-200",
        day_outside: "text-gray-300 opacity-40",
        day_disabled: "text-gray-300 cursor-not-allowed bg-gray-50 opacity-50",
        day_range_middle: "rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
