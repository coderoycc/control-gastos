// src/app/import/components/AccountSelector.tsx
import { Account } from '../../context/types';
import { Wallet, AlertCircle } from 'lucide-react';

interface AccountSelectorProps {
  accounts: Account[];
  selectedAccountId: string;
  onSelectAccount: (id: string) => void;
  error?: string | null;
}

export function AccountSelector({
  accounts,
  selectedAccountId,
  onSelectAccount,
  error,
}: AccountSelectorProps) {
  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label
          htmlFor="account-select"
          className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200"
        >
          <Wallet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Cuenta de destino en la aplicación</span>
          <span className="text-red-500 font-bold">*</span>
        </label>

        {selectedAccount && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Saldo actual: <strong className="font-semibold text-gray-900 dark:text-gray-100">{selectedAccount.balance.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs.</strong>
          </span>
        )}
      </div>

      <div className="relative">
        <select
          id="account-select"
          value={selectedAccountId}
          onChange={(e) => onSelectAccount(e.target.value)}
          className={`w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors appearance-none bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 ${
            error
              ? 'border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-950'
              : 'border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 focus:border-blue-500'
          }`}
        >
          <option value="" disabled>
            -- Selecciona la cuenta donde se registrarán los movimientos --
          </option>
          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.name} ({acc.detail || 'Sin detalle'} - Saldo: {acc.balance.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs.)
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
