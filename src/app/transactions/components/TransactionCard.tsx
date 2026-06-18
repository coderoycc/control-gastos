import { Link } from 'react-router';
import { useData } from '../../context/hooks/useData';
import { getTransactionIcon, getTransactionColor, getAmountColor } from '../utils/transactionIcons';
import { formatTransactionDate } from '../utils/transactionFormatters';
import type { Transaction } from '../../context/types';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { accounts, labels } = useData();
  const account = accounts.find(a => a.id === transaction.accountId);
  const toAccount = accounts.find(a => a.id === transaction.toAccountId);
  const label = labels.find(l => transaction.labels.includes(l.id));

  return (
    <Link
      to={`/edit/${transaction.id}`}
      className={`block px-3 py-2.5 rounded-lg border-l-4 ${getTransactionColor(transaction.type)} hover:shadow-md transition-shadow`}
    >
      {/* Línea 1: Icono + Descripción + Etiqueta + Monto */}
      <div className="flex items-center overflow-hidden">
        {getTransactionIcon(transaction.type)}
        <div className="flex items-center gap-1 flex-1 min-w-0 ml-2">
          <p className="truncate text-sm font-medium leading-tight">{transaction.detail}</p>
          {label && (
            <span
              className="flex-shrink-0 overflow-hidden whitespace-nowrap max-w-[70px] label-tag text-[9px] px-1 py-px rounded font-medium text-white"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          )}
        </div>
        <p className={`flex-shrink-0 font-semibold text-sm ml-2 ${getAmountColor(transaction.type)}`}>
          {transaction.type === 'salida' ? '-' : ''}${transaction.amount.toLocaleString()}
        </p>
      </div>

      {/* Línea 2: Cuenta/Transfer + Fecha */}
      <div className="flex items-center gap-2 ml-7 text-gray-500 dark:text-gray-400">
        {transaction.type === 'transferencia' ? (
          <span className="truncate text-[11px]">
            {account?.name || 'Origen'}
            {' → '}
            {toAccount?.name || 'Destino'}
          </span>
        ) : (
          <span className="truncate text-[11px]">{account?.name}</span>
        )}
        <span>·</span>
        <span className="whitespace-nowrap text-xs leading-tight">{formatTransactionDate(transaction.date)}</span>
      </div>
    </Link>
  );
}
