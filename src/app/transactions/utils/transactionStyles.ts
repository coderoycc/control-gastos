import type { TransactionType } from '../../context/types';

export function getTypeButtonClass(type: TransactionType, currentType: TransactionType): string {
  const baseClass = 'py-1.5 px-2 text-sm rounded-md font-medium transition-colors';
  if (currentType === type) {
    switch (type) {
      case 'entrada':
        return `${baseClass} bg-green-600 text-white dark:bg-green-500`;
      case 'salida':
        return `${baseClass} bg-red-600 text-white dark:bg-red-500`;
      case 'transferencia':
        return `${baseClass} bg-blue-600 text-white dark:bg-blue-500`;
    }
  }
  return `${baseClass} flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`;
}

export function getBackgroundColor(type: TransactionType): string {
  switch (type) {
    case 'entrada':
      return 'bg-green-50/30 dark:bg-green-950/10';
    case 'salida':
      return 'bg-red-50/30 dark:bg-red-950/10';
    case 'transferencia':
      return 'bg-blue-50/30 dark:bg-blue-950/10';
  }
}
