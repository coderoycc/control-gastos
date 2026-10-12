import { Link } from 'react-router';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { useData } from '../../context/hooks/useData';
import { getTransactionIcon, getTransactionColor, getAmountColor } from '../utils/transactionIcons';
import { formatTransactionDate } from '../utils/transactionFormatters';
import { getChannelConfig } from '../utils/salesChannels';
import { TagLabel } from '../../../components';
import type { Transaction } from '../../context/types';

interface TransactionCardProps {
  transaction: Transaction;
}

export function TransactionCard({ transaction }: TransactionCardProps) {
  const { accounts, labels, toggleTransactionPending } = useData();
  const account = accounts.find(a => a.id === transaction.accountId);
  const toAccount = accounts.find(a => a.id === transaction.toAccountId);
  const label = labels.find(l => transaction.labels?.includes(l.id));
  const channelConfig = getChannelConfig(transaction.channel);

  const handleQuickCollect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleTransactionPending(transaction.id);
    toast.success('¡Venta marcada como cobrada!');
  };

  return (
    <Link
      to={`/edit/${transaction.id}`}
      className={`block px-3 py-2.5 rounded-lg border-l-4 ${getTransactionColor(transaction.type)} hover:shadow-md transition-shadow relative bg-white dark:bg-gray-900/60 border border-gray-100 dark:border-gray-800/80 mb-1.5`}
    >
      <div className="flex">
        {/* Ícono centrado verticalmente */}
        <div className="flex-shrink-0 self-center">
          {getTransactionIcon(transaction.type)}
        </div>

        {/* Contenido */}
        <div className="flex-1 min-w-0 ml-3 leading-none">
          {/* Línea 1: Descripción + Etiqueta + Monto */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
              <p className="text-sm font-semibold truncate">
                {transaction.detail || (transaction.type === 'entrada' ? 'Venta' : 'Transacción')}
              </p>
              {label && (
                <TagLabel
                  name={label.name}
                  color={label.color}
                  size="sm"
                />
              )}
            </div>
            <p className={`flex-shrink-0 font-semibold text-sm ${getAmountColor(transaction.type)}`}>
              {transaction.type === 'salida' ? '-' : ''}${transaction.amount.toLocaleString()}
            </p>
          </div>

          {/* Línea 2: Badges de Canal y Estado de Cobro */}
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            {channelConfig && (
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${channelConfig.bgLight}`}>
                <span>{channelConfig.icon}</span>
                <span>{channelConfig.name}</span>
              </span>
            )}

            {transaction.isPending && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span>⏳</span>
                <span>Por cobrar</span>
              </span>
            )}
          </div>

          {/* Línea 3: Fecha + Cuenta + Botón de Cobro Rápido */}
          <div className="flex items-center justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2 truncate">
              <span>{formatTransactionDate(transaction.date)}</span>
              <span>•</span>
              {transaction.type === 'transferencia' ? (
                <span className="truncate">
                  {account?.name || 'Origen'} → {toAccount?.name || 'Destino'}
                </span>
              ) : (
                <span className="truncate">{account?.name || 'Cuenta'}</span>
              )}
            </div>

            {transaction.isPending && (
              <button
                type="button"
                onClick={handleQuickCollect}
                className="inline-flex items-center gap-1 px-2 py-0.5 ml-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-medium shadow-xs transition-colors shrink-0"
                title="Marcar como cobrado"
              >
                <Check className="w-3 h-3" />
                <span>Cobrar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
