interface DateFilterModalProps {
  allTransactions: boolean;
  dateRange: { start: string; end: string };
  dateError: string;
  onToggleAll: (checked: boolean) => void;
  onDateChange: (field: 'start' | 'end', value: string) => void;
  onApply: () => void;
  onClose: () => void;
}

export function DateFilterModal({
  allTransactions,
  dateRange,
  dateError,
  onToggleAll,
  onDateChange,
  onApply,
  onClose,
}: DateFilterModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-medium">Filtrar por Fecha</h3>
        </div>
        <div className="p-4 space-y-3">
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
            <div className="space-y-3">
              {(['start', 'end'] as const).map(field => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {field === 'start' ? 'Fecha Inicio' : 'Fecha Fin'}
                  </label>
                  <input
                    type="date"
                    value={dateRange[field]}
                    onChange={e => onDateChange(field, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-950 ${
                      dateError
                        ? 'border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {dateError && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center">
              {dateError}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={onApply}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
