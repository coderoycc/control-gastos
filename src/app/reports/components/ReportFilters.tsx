import { BottomSheet } from '../../../components';
import { Switch } from '../../../components/ui/switch';

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
  onApply: () => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => onStartDateChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-950 ${
                  dateError
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => onEndDateChange(e.target.value)}
                className={`w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-950 ${
                  dateError
                    ? 'border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              />
            </div>
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
          onClick={onApply}
          className="w-full px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Aplicar filtros
        </button>
      </div>
    </BottomSheet>
  );
}
