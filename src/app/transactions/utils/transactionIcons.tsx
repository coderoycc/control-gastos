import { ArrowUpCircle, ArrowDownCircle, ArrowRightLeft } from 'lucide-react';
import type { TransactionType } from '../../context/types';

export function getTransactionIcon(type: TransactionType) {
  switch (type) {
    case 'entrada':
      return <ArrowUpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
    case 'salida':
      return <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
    case 'transferencia':
      return <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
  }
}

export function getTransactionColor(type: TransactionType) {
  switch (type) {
    case 'entrada':
      return 'border-l-green-600 dark:border-l-green-400 bg-green-50 dark:bg-green-950/20';
    case 'salida':
      return 'border-l-red-600 dark:border-l-red-400 bg-red-50 dark:bg-red-950/20';
    case 'transferencia':
      return 'border-l-blue-600 dark:border-l-blue-400 bg-blue-50 dark:bg-blue-950/20';
  }
}

export function getAmountColor(type: TransactionType) {
  switch (type) {
    case 'entrada':
      return 'text-green-700 dark:text-green-400';
    case 'salida':
      return 'text-red-700 dark:text-red-400';
    case 'transferencia':
      return 'text-blue-700 dark:text-blue-400';
  }
}
