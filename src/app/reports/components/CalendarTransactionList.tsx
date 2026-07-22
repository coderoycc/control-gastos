import { TransactionCard } from '../../transactions';
import type { Transaction } from '../../context/types';

interface CalendarTransactionListProps {
  day: Date;
  transactions: Transaction[];
  typeParam?: 'entrada' | 'salida' | 'transferencia' | null;
  income?: number;
  expenses?: number;
  transfers?: number;
}

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function CalendarTransactionList({
  transactions,
  typeParam,
  income = 0,
  expenses = 0,
  transfers = 0,
}: CalendarTransactionListProps) {
  // Solo mostrar el total si hay un único tipo de transacción filtrado
  const showTotal = typeParam === 'entrada' || typeParam === 'salida' || typeParam === 'transferencia';

  const totalAmount = typeParam === 'entrada' ? income : typeParam === 'salida' ? expenses : transfers;

  const totalColorClass =
    typeParam === 'entrada'
      ? 'text-emerald-600 dark:text-emerald-400'
      : typeParam === 'salida'
      ? 'text-rose-500 dark:text-rose-400'
      : 'text-blue-500 dark:text-blue-400';

  return (
    <div className="flex flex-col h-full">
      {/* Barra de total — visible solo con un tipo filtrado */}
      {showTotal && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-900/30">
          <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total</span>
          <span className={`text-sm font-bold ${totalColorClass}`}>
            {formatCurrency(totalAmount)}
          </span>
        </div>
      )}

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
