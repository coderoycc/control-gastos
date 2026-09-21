// src/app/import/components/FilterToolbar.tsx
import { SelectionFilterType } from '../services/selectionManager';
import { CheckSquare, Square, ArrowDownLeft, ArrowUpRight, Filter } from 'lucide-react';

interface FilterToolbarProps {
  onApplyFilter: (filter: SelectionFilterType) => void;
  totalMovements: number;
  selectedCount: number;
  entradasCount: number;
  salidasCount: number;
  duplicadosCount: number;
}

export function FilterToolbar({
  onApplyFilter,
  totalMovements,
  selectedCount,
  entradasCount,
  salidasCount,
  duplicadosCount,
}: FilterToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 dark:bg-gray-900/60 p-3 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
        <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span>Selección rápida:</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onApplyFilter('all')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-xs transition-colors"
        >
          <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Todos</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-gray-100 dark:bg-gray-700 text-[10px] text-gray-600 dark:text-gray-300 font-semibold">
            {totalMovements}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onApplyFilter('none')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-xs transition-colors"
        >
          <Square className="w-3.5 h-3.5 text-gray-400" />
          <span>Ninguno</span>
        </button>

        <button
          type="button"
          onClick={() => onApplyFilter('incomes')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 border border-gray-200 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 shadow-xs transition-colors"
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Solo entradas</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[10px] text-emerald-800 dark:text-emerald-300 font-semibold">
            {entradasCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => onApplyFilter('expenses')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-gray-800 text-rose-700 dark:text-rose-400 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-xs transition-colors"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          <span>Solo salidas</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-[10px] text-rose-800 dark:text-rose-300 font-semibold">
            {salidasCount}
          </span>
        </button>

        {duplicadosCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            {duplicadosCount} {duplicadosCount === 1 ? 'duplicado detectado' : 'duplicados detectados'}
          </span>
        )}
      </div>
    </div>
  );
}
