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
  const transactionLabels = labels.filter(l => transaction.labels.includes(l.id));

  return (
    <Link
      key={transaction.id}
      to={`/edit/${transaction.id}`}
      className={`block p-4 rounded-lg border-l-4 ${getTransactionColor(transaction.type)} hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          {getTransactionIcon(transaction.type)}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{transaction.detail}</p>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {transactionLabels.map(label => (
                <span
                  key={label.id}
                  className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {account?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              {formatTransactionDate(transaction.date)}
            </p>
          </div>
        </div>
        <div className="text-right ml-2">
          <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
            {transaction.type === 'salida' ? '-' : ''}${transaction.amount.toLocaleString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
