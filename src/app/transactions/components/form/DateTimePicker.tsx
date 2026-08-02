import { useRef, useEffect, useState } from "react";
import { CalendarDays, Clock } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { parseDateString, formatDateTimeDisplay } from "../../utils/dateFormatter";

interface DateTimePickerProps {
  date: string;
  time: string;
  setDate: (date: string) => void;
  setTime: (time: string) => void;
}

export function DateTimePicker({ date, time, setDate, setTime }: DateTimePickerProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(e.target as Node)
      ) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [calendarOpen]);

  return (
    <div className="relative" ref={calendarRef}>
      <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
        Fecha y Hora
      </label>
      <button
        type="button"
        onClick={() => setCalendarOpen((prev) => !prev)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-left flex items-center justify-between gap-2 transition-colors hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
      >
        <span
          className={
            date ? "text-gray-800 dark:text-gray-100" : "text-gray-400"
          }
        >
          {date
            ? formatDateTimeDisplay(date, time)
            : "Seleccionar fecha y hora"}
        </span>
        <CalendarDays className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
      </button>

      {calendarOpen && (
        <div className="absolute z-50 mt-1 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
          <DayPicker
            mode="single"
            selected={parseDateString(date)}
            onSelect={(day) => {
              if (day) {
                const yyyy = day.getFullYear();
                const mm = String(day.getMonth() + 1).padStart(2, "0");
                const dd = String(day.getDate()).padStart(2, "0");
                setDate(`${yyyy}-${mm}-${dd}`);
              }
            }}
            defaultMonth={parseDateString(date)}
            captionLayout="dropdown-buttons"
            fromYear={2020}
            toYear={new Date().getFullYear() + 1}
            className="rdp-custom"
          />
          <div className="px-4 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 shrink-0">
                <Clock className="w-3.5 h-3.5" />
                Hora
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
              <button
                type="button"
                onClick={() => setCalendarOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white text-xs font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
