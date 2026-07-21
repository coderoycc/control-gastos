import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { FilterType } from '../../utils/chartUtils';

interface TypeFilterSelectorProps {
  filterType: FilterType;
  onFilterTypeChange: (type: 'salida' | 'entrada') => void;
}

export function TypeFilterSelector({ filterType, onFilterTypeChange }: TypeFilterSelectorProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onFilterTypeChange('salida')}
        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-200 ${
          filterType === 'salida'
            ? 'bg-rose-500 border-rose-500 text-white shadow-md'
            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-rose-300 dark:hover:border-rose-700'
        }`}
      >
        <ArrowDownCircle className="w-3.5 h-3.5" />
        Salida
      </button>
      <button
        onClick={() => onFilterTypeChange('entrada')}
        className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-200 ${
          filterType === 'entrada'
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700'
        }`}
      >
        <ArrowUpCircle className="w-3.5 h-3.5" />
        Entrada
      </button>
    </div>
  );
}
