import { X } from 'lucide-react';
import { BottomSheet } from '../../../components';
import { useData } from '../../context/hooks/useData';

interface TransactionFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAccount: string;
  onAccountChange: (account: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export function TransactionFilters({
  isOpen,
  onClose,
  selectedAccount,
  onAccountChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  hasActiveFilters,
  onClearFilters,
}: TransactionFiltersProps) {
  const { accounts } = useData();

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Filtros">
      <div className="p-4 space-y-4">
        <div>
          <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
            Cuenta
          </label>
          <select
            value={selectedAccount}
            onChange={e => onAccountChange(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
          >
            <option value="all">Todas las cuentas</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Desde
            </label>
            <input
              type="date"
              value={startDate}
              onChange={e => onStartDateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Hasta
            </label>
            <input
              type="date"
              value={endDate}
              onChange={e => onEndDateChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
            Limpiar filtros
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          Aplicar filtros
        </button>
      </div>
    </BottomSheet>
  );
}
