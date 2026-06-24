import { useState, useRef, useEffect } from 'react';
import { CalendarDays, X } from 'lucide-react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { BottomSheet } from '../../../components';
import { Switch } from '../../../components/ui/switch';
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover';

interface ReportFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  allTransactions: boolean;
  onToggleAll: (checked: boolean) => void;
  dateError: string;
  onApply: (dates?: { start: string; end: string }) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

function parseDateString(str: string): Date | undefined {
  if (!str) return undefined;
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateString(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateDisplay(str: string): string {
  if (!str) return '';
  const d = parseDateString(str);
  if (!d) return str;
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

function formatDateRangeDisplay(start: string, end: string): string {
  if (!start && !end) return 'Seleccionar rango';
  if (start && end) {
    if (start === end) {
      const d = parseDateString(start);
      return d ? d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : start;
    }
    return `${formatDateDisplay(start)} - ${formatDateDisplay(end)}`;
  }
  if (start) return `Desde ${formatDateDisplay(start)}`;
  return `Hasta ${formatDateDisplay(end)}`;
}

export function ReportFilters({
  isOpen,
  onClose,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  allTransactions,
  onToggleAll,
  dateError,
  onApply,
  sortOrder,
  onSortOrderChange,
}: ReportFiltersProps) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const lastClickRef = useRef<{ day: string; time: number } | null>(null);

  const [localRange, setLocalRange] = useState<DateRange | undefined>(() => ({
    from: parseDateString(startDate),
    to: parseDateString(endDate),
  }));

  useEffect(() => {
    if (isOpen) {
      setLocalRange({
        from: parseDateString(startDate),
        to: parseDateString(endDate),
      });
    }
  }, [isOpen, startDate, endDate]);

  const handleDayClick = (day: Date) => {
    const now = Date.now();
    const dayStr = day.toDateString();
    if (lastClickRef.current && lastClickRef.current.day === dayStr && (now - lastClickRef.current.time) < 300) {
      // Doble click: seleccionar una sola fecha
      setLocalRange({ from: day, to: day });
      setCalendarOpen(false);
      lastClickRef.current = null;
    } else {
      lastClickRef.current = { day: dayStr, time: now };
    }
  };

  const handleApply = () => {
    if (!allTransactions && localRange?.from) {
      const startStr = formatDateString(localRange.from);
      const endStr = localRange.to ? formatDateString(localRange.to) : startStr;
      onApply({ start: startStr, end: endStr });
    } else {
      onApply();
    }
  };

  // Convert local range values to display strings
  const displayStart = localRange?.from ? formatDateString(localRange.from) : '';
  const displayEnd = localRange?.to ? formatDateString(localRange.to) : '';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filtros de fecha">
      <div className="p-4 space-y-4">
        <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <input
            type="checkbox"
            checked={allTransactions}
            onChange={e => onToggleAll(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
          />
          <span className="flex-1 text-sm">Todas las transacciones</span>
        </label>

        {!allTransactions && (
          <div>
            <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300">
              Rango de fechas
            </label>
            <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className={`w-full px-3 py-2 rounded-lg border text-sm text-left flex items-center justify-between gap-2 transition-colors hover:border-blue-400 dark:hover:border-blue-500 bg-white dark:bg-gray-955 focus:outline-none focus:ring-2 focus:ring-blue-400/40 ${
                    dateError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`.replace('dark:bg-gray-955', 'dark:bg-gray-950')}
                >
                  <span className={displayStart || displayEnd ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}>
                    {formatDateRangeDisplay(displayStart, displayEnd)}
                  </span>
                  <CalendarDays className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-[330px] p-2.5 max-h-[90vh] flex flex-col bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden" align="start" sideOffset={4}>
                <div className="flex-shrink-0 flex justify-between items-center mb-1.5 pb-1 border-b border-gray-100 dark:border-gray-850">
                  <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">Seleccionar fechas</span>
                  <button 
                    type="button" 
                    onClick={() => setCalendarOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-805 text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="overflow-y-auto min-h-0 flex-1 flex justify-center">
                  <DayPicker
                    mode="range"
                    selected={localRange}
                    onSelect={setLocalRange}
                    onDayClick={handleDayClick}
                    defaultMonth={localRange?.from || new Date()}
                    captionLayout="dropdown-buttons"
                    fromYear={2020}
                    toYear={new Date().getFullYear() + 1}
                    className="rdp-custom"
                  />
                </div>

                <div className="flex-shrink-0 mt-2.5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLocalRange(undefined);
                    }}
                    className="flex-1 py-1 text-xs font-medium bg-gray-155 dark:bg-gray-800 hover:bg-gray-250 dark:hover:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300"
                  >
                    Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarOpen(false)}
                    className="flex-1 py-1 text-xs font-semibold bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white rounded-lg"
                  >
                    Aceptar
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <div className="flex items-center justify-between p-3.5 rounded-xl border border-gray-100 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-gray-850 dark:text-gray-200">
              Ordenar por fecha
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {sortOrder === 'desc' ? 'Más recientes primero' : 'Más antiguos primero'}
            </span>
          </div>
          <Switch
            checked={sortOrder === 'desc'}
            onCheckedChange={(checked) => onSortOrderChange(checked ? 'desc' : 'asc')}
          />
        </div>

        {dateError && (
          <p className="text-xs text-red-600 dark:text-red-400 text-center">
            {dateError}
          </p>
        )}

        <button
          onClick={handleApply}
          className="w-full px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm"
        >
          Aplicar filtros
        </button>
      </div>
    </BottomSheet>
  );
}
