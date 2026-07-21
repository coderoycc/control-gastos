import { Tag as TagIcon, CreditCard as CardIcon } from 'lucide-react';
import { GroupDimension } from '../../utils/chartUtils';

interface DimensionSelectorProps {
  dimension: GroupDimension;
  onDimensionChange: (dim: 'tags' | 'accounts') => void;
}

export function DimensionSelector({ dimension, onDimensionChange }: DimensionSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex gap-1">
      <button
        onClick={() => onDimensionChange('tags')}
        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
          dimension === 'tags'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <TagIcon className="w-3.5 h-3.5" />
        Etiquetas
      </button>
      <button
        onClick={() => onDimensionChange('accounts')}
        className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
          dimension === 'accounts'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <CardIcon className="w-3.5 h-3.5" />
        Cuentas
      </button>
    </div>
  );
}
