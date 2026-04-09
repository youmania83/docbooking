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
        caption: "flex items-center justify-between pt-1 relative mb-4",
        caption_label: "text-sm font-semibold text-gray-900",
        nav: "space-x-1 flex items-center justify-between absolute top-0 left-0 right-0 w-full",
        nav_button: cn(
          "h-8 w-8 bg-white border border-gray-300 rounded-md p-0 opacity-100 hover:bg-gray-100 hover:border-gray-400 transition-all"
        ),
        nav_button_previous: "absolute left-0",
        nav_button_next: "absolute right-0",
        table: "w-full border-collapse space-y-2",
        head_row: "flex gap-2",
        head_cell: "text-gray-700 rounded-md w-10 font-semibold text-xs uppercase text-center",
        row: "flex gap-2 w-full",
        cell: "h-10 w-10 text-center p-0 relative focus-within:relative focus-within:z-20",
        day: cn(
          "h-10 w-10 p-0 font-normal rounded-md text-sm text-gray-900 hover:bg-gray-100 transition-colors",
          "aria-selected:opacity-100"
        ),
        day_selected: "bg-blue-600 text-white hover:bg-blue-700 font-semibold",
        day_today: "bg-blue-100 text-blue-900 font-bold border border-blue-300",
        day_outside: "text-gray-400 opacity-50",
        day_disabled: "text-gray-300 cursor-not-allowed bg-gray-50",
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
