import { useState } from 'react';
import { toast } from 'sonner';
import { X, Check, Scale } from 'lucide-react';
import { useData } from '../../context';
import { calculateAccountBalance, calculateBaseBalanceForTarget } from '../utils/accountBalances';
import type { Account } from '../../context/types';

interface BalanceAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  initialAccountId?: string;
}

export function BalanceAdjustmentModal({
  isOpen,
  onClose,
  accounts,
  initialAccountId,
}: BalanceAdjustmentModalProps) {
  const { transactions, setAccountExactBalance } = useData();
  const [selectedAccountId, setSelectedAccountId] = useState(
    initialAccountId || accounts[0]?.id || ''
  );
  const [realAmount, setRealAmount] = useState('');

  if (!isOpen || accounts.length === 0) return null;

  const currentAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];
  const calculatedBalance = currentAccount
    ? calculateAccountBalance(currentAccount, transactions)
    : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(realAmount);
    if (isNaN(parsed)) {
      toast.error('Ingresa un monto válido');
      return;
    }

    if (!currentAccount) return;

    // Calculamos el saldo base necesario para que el saldo resultante sea exactamente el real
    const newBaseBalance = calculateBaseBalanceForTarget(
      currentAccount,
      transactions,
      parsed
    );

    setAccountExactBalance(currentAccount.id, newBaseBalance);
    toast.success(`Saldo de "${currentAccount.name}" actualizado a $${parsed.toLocaleString()}`);
    setRealAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Arqueo / Ajustar Saldo</h3>
              <p className="text-[11px] text-gray-500">¿Cuánto dinero tienes en mano o banco?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cuenta a ajustar
            </label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Calculado: ${calculateAccountBalance(acc, transactions).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 text-xs flex justify-between">
            <span className="text-gray-500">Saldo según la app:</span>
            <span className="font-bold text-gray-800 dark:text-gray-200">
              ${calculatedBalance.toLocaleString()}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              ¿Cuánto tienes físicamente ahora?
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                type="number"
                step="any"
                autoFocus
                value={realAmount}
                onChange={(e) => setRealAmount(e.target.value)}
                placeholder="Ej. 450"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-semibold"
                required
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              El saldo se ajustará para que coincida exactamente con lo que tienes.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Guardar Saldo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
