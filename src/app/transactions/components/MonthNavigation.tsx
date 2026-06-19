import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDaysInMonth } from 'date-fns';
import { formatMonthYear, formatYear } from '../utils/transactionFormatters';

interface MonthNavigationProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  filterDateText: string | null;
}

export function MonthNavigation({
  currentDate,
  onPreviousMonth,
  onNextMonth,
  filterDateText,
}: MonthNavigationProps) {
  return (
    <div className="px-4 pt-2 pb-1 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="flex items-center justify-between max-w-md mx-auto">
        <button
          onClick={onPreviousMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-center">
          <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
            01
          </span>
          <span className="text-2xl font-bold uppercase tracking-wide">
            {formatMonthYear(currentDate)}
          </span>
          <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
            {getDaysInMonth(currentDate)}
          </span>
        </div>

        <button
          onClick={onNextMonth}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
        {formatYear(currentDate)}
      </p>

      {filterDateText && (
        <p className="text-center text-xs text-blue-600 dark:text-blue-400 mt-1">
          {filterDateText}
        </p>
      )}
    </div>
  );
}
