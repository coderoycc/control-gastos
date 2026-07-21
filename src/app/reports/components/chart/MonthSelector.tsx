import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MonthSelectorProps {
  headerRef: React.Ref<HTMLDivElement>;
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function MonthSelector({
  headerRef,
  currentDate,
  onPreviousMonth,
  onNextMonth,
}: MonthSelectorProps) {
  return (
    <div
      ref={headerRef}
      className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between"
      style={{ touchAction: 'pan-y' }}
    >
      <button
        onClick={onPreviousMonth}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
        aria-label="Mes anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
        {format(currentDate, 'MMMM yyyy', { locale: es })}
      </span>

      <button
        onClick={onNextMonth}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
        aria-label="Mes siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
