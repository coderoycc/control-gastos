import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { TransactionCard } from '../../transactions';
import type { Transaction } from '../../context/types';

interface CalendarTransactionListProps {
  day: Date;
  transactions: Transaction[];
  income: number;
  expenses: number;
  balance: number;
}

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function CalendarTransactionList({
  day,
  transactions,
  income,
  expenses,
  balance,
}: CalendarTransactionListProps) {
  const dayLabel = format(day, "EEEE d 'de' MMMM", { locale: es });

  return (
    <div className="flex flex-col h-full">
      {/* Fecha */}
      <div className="px-4 pt-1 pb-3 border-b border-gray-100 dark:border-gray-800">
        <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 capitalize">{dayLabel}</p>
      </div>

      {/* Lista de transacciones */}
      <div className="flex-1 overflow-auto px-4 py-3 space-y-2">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-600 text-center py-6">
            No hay transacciones este día
          </p>
        ) : (
          transactions.map(tx => (
            <TransactionCard key={tx.id} transaction={tx} />
          ))
        )}
      </div>
    </div>
  );
}
