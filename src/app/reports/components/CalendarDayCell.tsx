import type { Transaction } from '../../context/types';

interface CalendarDayCellProps {
  day: Date;
  transactions: Transaction[];
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: () => void;
}

export function CalendarDayCell({
  day,
  transactions,
  isSelected,
  isToday,
  isCurrentMonth,
  onClick,
}: CalendarDayCellProps) {
  const hasTransactions = transactions.length > 0;
  const dayNumber = day.getDate();

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center w-full h-full min-h-[46px] rounded-2xl transition-all duration-150 select-none
        ${isSelected
          ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-400 font-bold scale-105 z-10'
          : isToday
          ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-extrabold border-2 border-blue-400/60 dark:border-blue-500/60'
          : isCurrentMonth
          ? hasTransactions
            ? 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 cursor-pointer font-semibold'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900/50'
          : 'text-gray-300 dark:text-gray-700 opacity-40'}
      `}
    >
      <span className="text-base sm:text-lg leading-none">
        {dayNumber}
      </span>

      {/* Indicador de día con transacciones */}
      {hasTransactions && (
        <span
          className={`mt-1.5 w-2 h-2 rounded-full transition-all ${
            isSelected
              ? 'bg-white'
              : 'bg-blue-500 dark:bg-blue-400'
          }`}
        />
      )}
    </button>
  );
}

