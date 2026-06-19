import { BottomSheet } from '../../../components';
import { ToggleGroup, ToggleGroupItem } from '../../../components/ui/toggle-group';

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

        <ToggleGroup
          type="single"
          value={sortOrder}
          onValueChange={value => value && onSortOrderChange(value as 'asc' | 'desc')}
          variant="outline"
          className="w-full"
        >
          <ToggleGroupItem
            value="desc"
            className="flex-1 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Más recientes
          </ToggleGroupItem>
          <ToggleGroupItem
            value="asc"
            className="flex-1 text-sm data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
          >
            Más antiguos
          </ToggleGroupItem>
        </ToggleGroup>

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
