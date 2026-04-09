import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router';
import type { Transaction } from '../context';

interface TransactionTableProps {
  transactions: Transaction[];
  labels: Array<{ id: string; name: string; color: string }>;
}

export function TransactionTable({ transactions, labels }: TransactionTableProps) {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Table Header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 text-xs font-medium text-gray-600 dark:text-gray-400 overflow-x-hidden">
        <div className="flex-1 min-w-0">Detalle</div>
        <div className="w-20 text-right flex-shrink-0">Gasto</div>
        <div className="w-20 text-right flex-shrink-0">Ingreso</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        {transactions.length === 0 ? (
          <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p className="text-sm">No hay transacciones</p>
          </div>
        ) : (
          <div className="overflow-x-hidden">
            {transactions.map(transaction => {
              const transactionLabels = labels.filter(l => transaction.labels.includes(l.id));
              return (
                <Link
                  key={transaction.id}
                  to={`/edit/${transaction.id}`}
                  className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer overflow-x-hidden"
                >
                  {/* Detail Column */}
                  <div className="flex-1 min-w-0 pr-2">
                    <p className="text-sm font-medium truncate">{transaction.detail}</p>
                    {transaction.type !== 'transferencia' && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {transactionLabels.map(label => (
                        <span
                          key={label.id}
                          className="inline-block px-1.5 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </span>
                      ))}
                    </div>
                    )}
                    {transaction.type === 'transferencia' && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      → {(transaction as any).toAccountId ? `Destino: ${(transaction as any).toAccountId}` : 'Transferencia'}
                    </p>
                    )}
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {format(parseISO(transaction.date), "d MMM yyyy", { locale: es })}
                    </p>
                  </div>

                  {/* Expense Column */}
                  <div className="w-20 text-right">
                    {transaction.type === 'salida' && (
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        -${transaction.amount.toLocaleString()}
                      </p>
                    )}
                    {transaction.type === 'transferencia' && (
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        →${transaction.amount.toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Income Column */}
                  <div className="w-20 text-right">
                    {transaction.type === 'entrada' && (
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        +${transaction.amount.toLocaleString()}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}