import { useState } from 'react';
import { Scale, Wallet, Clock, ChevronRight } from 'lucide-react';
import { useData } from '../../context';
import {
  calculateAccountBalance,
  calculateTotalAvailable,
  calculatePendingReceivables,
} from '../utils/accountBalances';
import { BalanceAdjustmentModal } from './BalanceAdjustmentModal';

interface TotalBalanceCardProps {
  onFilterPending?: () => void;
}

export function TotalBalanceCard({ onFilterPending }: TotalBalanceCardProps) {
  const { accounts, transactions } = useData();
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedAdjustAccountId, setSelectedAdjustAccountId] = useState<string | undefined>(
    undefined
  );

  const totalAvailable = calculateTotalAvailable(accounts, transactions);
  const pendingReceivables = calculatePendingReceivables(transactions);

  const openAdjustModal = (accountId?: string) => {
    setSelectedAdjustAccountId(accountId);
    setIsAdjustModalOpen(true);
  };

  return (
    <>
      <div className="mx-4 mt-2 mb-1 p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white shadow-md relative overflow-hidden">
        {/* Adorno visual sutil de fondo */}
        <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Fila superior: Título y botón de arqueo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium uppercase tracking-wider text-slate-300/90">
                Dinero Disponible Total
              </span>
            </div>

            <button
              onClick={() => openAdjustModal()}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 active:scale-95 text-[11px] font-medium text-slate-200 transition-all cursor-pointer backdrop-blur-xs"
              title="Ajustar saldo o cuadrar efectivo"
            >
              <Scale className="w-3 h-3 text-blue-300" />
              <span>Arqueo</span>
            </button>
          </div>

          {/* Saldo total en grande */}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white">
              ${totalAvailable.toLocaleString()}
            </span>

            {/* Badge de por cobrar si existe */}
            {pendingReceivables > 0 && (
              <button
                onClick={onFilterPending}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-medium hover:bg-amber-500/30 transition-colors"
                title="Ventas pendientes por cobrar"
              >
                <Clock className="w-3 h-3" />
                <span>+${pendingReceivables.toLocaleString()} por cobrar</span>
              </button>
            )}
          </div>

          {/* Cuentas individuales en chips deslizables */}
          {accounts.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
              {accounts.map((acc) => {
                const bal = calculateAccountBalance(acc, transactions);
                return (
                  <button
                    key={acc.id}
                    onClick={() => openAdjustModal(acc.id)}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/15 text-left transition-all active:scale-95 border border-white/5"
                    title={`Ajustar ${acc.name}`}
                  >
                    <span className="text-[11px] text-slate-300 truncate max-w-[90px]">
                      {acc.name}:
                    </span>
                    <span className="text-[11px] font-bold text-white">
                      ${bal.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <BalanceAdjustmentModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        accounts={accounts}
        initialAccountId={selectedAdjustAccountId}
      />
    </>
  );
}
