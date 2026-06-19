import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router';
import type { Transaction } from '../app/context';

interface TransactionTableProps {
  transactions: Transaction[];
  labels: Array<{ id: string; name: string; color: string }>;
  accounts?: Array<{ id: string; name: string }>;
  currentAccountId?: string;
}

export function TransactionTable({ transactions, labels, accounts, currentAccountId }: TransactionTableProps) {
  return (
    <div className="flex flex-col flex-1">
      {transactions.length === 0 ? (
        <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
          <p className="text-sm">No hay transacciones</p>
        </div>
      ) : (
        <div className="overflow-x-hidden">
          {transactions.map(transaction => {
            return (
              <Link
                key={transaction.id}
                to={`/edit/${transaction.id}`}
                className="flex items-center px-3 py-2 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors cursor-pointer overflow-x-hidden"
              >
                {/* Detail Column */}
                <div className="flex-1 min-w-0 pr-2">
                  <p className="text-sm line-clamp-2">{transaction.detail}</p>
                  {transaction.type === 'transferencia' && (
                  <div className="flex items-center w-full mt-0.5">
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 truncate" style={{ width: '46%' }}>
                      {(() => {
                        const fromName = accounts?.find(a => a.id === transaction.accountId)?.name || 'Origen';
                        return fromName;
                      })()}
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 text-center flex-shrink-0" style={{ width: '8%' }}>
                      →
                    </span>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 truncate" style={{ width: '46%' }}>
                      {(() => {
                        const toName = accounts?.find(a => a.id === transaction.toAccountId)?.name || 'Destino';
                        return toName;
                      })()}
                    </span>
                  </div>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
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
                  {transaction.type === 'transferencia' && currentAccountId === 'all' && (
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ${transaction.amount.toLocaleString()}
                    </p>
                  )}
                  {transaction.type === 'transferencia' && currentAccountId && currentAccountId !== 'all' && transaction.accountId === currentAccountId && (
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      -${transaction.amount.toLocaleString()}
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
                  {transaction.type === 'transferencia' && currentAccountId === 'all' && (
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                      ${transaction.amount.toLocaleString()}
                    </p>
                  )}
                  {transaction.type === 'transferencia' && currentAccountId && currentAccountId !== 'all' && transaction.toAccountId === currentAccountId && (
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
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
  );
}