import { useState, useRef, useEffect } from 'react';
import { X, CalendarDays } from 'lucide-react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { BottomSheet } from '../../../components';
import { useData } from '../../context/hooks/useData';
import { Switch } from '../../../components/ui/switch';

interface TransactionFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
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

export function TransactionFilters({
  isOpen,
  onClose,
  selectedAccount,
  onAccountChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  hasActiveFilters,
  onClearFilters,
  sortOrder,
  onSortOrderChange,
}: TransactionFiltersProps) {
  const { accounts } = useData();

  const [calendarOpen, setCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!calendarOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [calendarOpen]);

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
    if (localRange?.from) {
      const startStr = formatDateString(localRange.from);
      const endStr = localRange.to ? formatDateString(localRange.to) : startStr;
      onStartDateChange(startStr);
      onEndDateChange(endStr);
    } else {
      onStartDateChange('');
      onEndDateChange('');
    }
    onClose();
  };

  const handleClear = () => {
    setLocalRange(undefined);
    onClearFilters();
  };

  // Convert local range values to display strings
  const displayStart = localRange?.from ? formatDateString(localRange.from) : '';
  const displayEnd = localRange?.to ? formatDateString(localRange.to) : '';

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filtros">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
            Cuenta
          </label>
          <select
            value={selectedAccount}
            onChange={e => onAccountChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >
            <option value="all">Todas las cuentas</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range Picker */}
        <div ref={calendarRef}>
          <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300">
            Rango de fechas
          </label>
          <button
            type="button"
            onClick={() => setCalendarOpen(prev => !prev)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-left flex items-center justify-between gap-2 transition-colors hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
          >
            <span className={displayStart || displayEnd ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}>
              {formatDateRangeDisplay(displayStart, displayEnd)}
            </span>
            <CalendarDays className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          </button>

          {calendarOpen && (
            <div 
              className="fixed inset-0 z-[110] flex items-center justify-center p-4"
              onTouchStart={e => e.stopPropagation()}
              onTouchMove={e => e.stopPropagation()}
              onTouchEnd={e => e.stopPropagation()}
            >
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/40 dark:bg-black/60 transition-opacity" 
                onClick={() => setCalendarOpen(false)}
              />
              
              {/* Modal Container */}
              <div className="relative w-full max-w-[330px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-2.5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-1.5 pb-1 border-b border-gray-100 dark:border-gray-805">
                  <span className="font-semibold text-xs text-gray-700 dark:text-gray-300">Seleccionar fechas</span>
                  <button 
                    type="button" 
                    onClick={() => setCalendarOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="overflow-x-auto flex justify-center">
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

                <div className="mt-2.5 flex gap-2">
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
              </div>
            </div>
          )}
        </div>

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

        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors text-sm"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
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
