import { Tag as TagIcon, CreditCard as CardIcon, Share2 as ShareIcon } from 'lucide-react';
import { GroupDimension } from '../../utils/chartUtils';

interface DimensionSelectorProps {
  dimension: GroupDimension;
  onDimensionChange: (dim: 'tags' | 'accounts' | 'channels') => void;
}

export function DimensionSelector({ dimension, onDimensionChange }: DimensionSelectorProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex gap-1">
      <button
        onClick={() => onDimensionChange('tags')}
        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
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
        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
          dimension === 'accounts'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <CardIcon className="w-3.5 h-3.5" />
        Cuentas
      </button>
      <button
        onClick={() => onDimensionChange('channels')}
        className={`flex-1 py-2 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 ${
          dimension === 'channels'
            ? 'bg-purple-600 text-white shadow-md'
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <ShareIcon className="w-3.5 h-3.5" />
        Canales
      </button>
    </div>
  );
}
