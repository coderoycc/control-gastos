import { Link } from 'react-router';
import { useData } from '../../context/hooks/useData';
import { getTransactionIcon, getTransactionColor, getAmountColor } from '../utils/transactionIcons';
import { formatTransactionDate } from '../utils/transactionFormatters';
import { TagLabel } from '../../../components';
import type { Transaction } from '../../context/types';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { accounts, labels } = useData();
  const account = accounts.find(a => a.id === transaction.accountId);
  const toAccount = accounts.find(a => a.id === transaction.toAccountId);
  const label = labels.find(l => transaction.labels?.includes(l.id));

  return (
    <Link
      to={`/edit/${transaction.id}`}
      className={`block px-3 py-2 rounded-lg border-l-4 ${getTransactionColor(transaction.type)} hover:shadow-md transition-shadow`}
    >
      <div className="flex">
        {/* Ícono centrado verticalmente */}
        <div className="flex-shrink-0 self-center">
          {getTransactionIcon(transaction.type)}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 ml-3 leading-none">
          {/* Línea 1: Descripción + Etiqueta + Monto */}
          <div className="flex items-center">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <p className="text-sm font-semibold line-clamp-2">{transaction.detail}</p>
              {label && (
                <TagLabel
                  name={label.name}
                  color={label.color}
                  size="sm"
                />
              )}
            </div>
            <p className={`flex-shrink-0 font-semibold text-sm ml-2 ${getAmountColor(transaction.type)}`}>
              {transaction.type === 'salida' ? '-' : ''}${transaction.amount.toLocaleString()}
            </p>
          </div>

          {/* Línea 2: Fecha */}
          <div className="mt-px">
            <span className="text-xs text-gray-500 dark:text-gray-400">{formatTransactionDate(transaction.date)}</span>
          </div>

          {/* Línea 3: Cuenta */}
          <div className="mt-px">
            {transaction.type === 'transferencia' ? (
              <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                {account?.name || 'Origen'}
                {' → '}
                {toAccount?.name || 'Destino'}
              </span>
            ) : (
              <span className="truncate text-xs text-gray-500 dark:text-gray-400">{account?.name}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
