import { X, Layers } from "lucide-react";
import type { SpendingLimit } from "../../../context/types";
import { LIMIT_CONSTANTS } from "../../../limits";

interface SpendingLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeLimit?: SpendingLimit | { amount: number; title?: string; accountId?: string | null } | null;
  accountName?: string | null;
  monthlyExpensesTotalWithoutCurrent: number;
  amount: string;
  totalWithCurrent: number;
  percentage: number;
  isEdit?: boolean;
}

export function SpendingLimitModal({
  isOpen,
  onClose,
  activeLimit,
  accountName,
  monthlyExpensesTotalWithoutCurrent,
  amount,
  totalWithCurrent,
  percentage,
  isEdit = false,
}: SpendingLimitModalProps) {
  if (!isOpen || !activeLimit) return null;

  const isDanger = percentage >= LIMIT_CONSTANTS.DANGER_THRESHOLD_PERCENT;
  const isWarning = percentage >= LIMIT_CONSTANTS.WARNING_THRESHOLD_PERCENT;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span
              className={`w-6 h-6 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                isDanger ? "bg-red-500" : isWarning ? "bg-orange-500" : "bg-blue-500"
              }`}
            >
              !
            </span>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                Detalle del Límite de Gasto
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {/* Información de ámbito del límite */}
          <div className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-gray-400" />
              <span>Aplica a:</span>
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {accountName ? `Cuenta "${accountName}"` : "Todas las cuentas (Global)"}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              Límite establecido
            </span>
            <span className="font-mono font-semibold text-gray-900 dark:text-white">
              $
              {activeLimit.amount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {isEdit ? "Gastos del mes (otros)" : "Gastos del mes (previos)"}
            </span>
            <span className="font-mono text-gray-700 dark:text-gray-300">
              $
              {monthlyExpensesTotalWithoutCurrent.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500 dark:text-gray-400">
              {isEdit ? "Monto modificado" : "Monto actual a registrar"}
            </span>
            <span className="font-mono text-gray-700 dark:text-gray-300">
              $
              {(parseFloat(amount) || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-900 dark:text-white">
                Total Proyectado
              </span>
              <span className="font-mono font-semibold text-gray-900 dark:text-white">
                $
                {totalWithCurrent.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>

          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>Porcentaje del límite</span>
              <span
                className={`font-mono font-bold ${
                  isDanger
                    ? "text-red-500 dark:text-red-400"
                    : isWarning
                      ? "text-orange-500 dark:text-orange-400"
                      : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isDanger
                    ? "bg-red-500"
                    : isWarning
                      ? "bg-orange-500"
                      : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
