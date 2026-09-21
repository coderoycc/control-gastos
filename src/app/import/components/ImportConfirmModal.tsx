// src/app/import/components/ImportConfirmModal.tsx
import { Account } from '../../context/types';
import { ImportSummary } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';
import { ArrowDownLeft, ArrowUpRight, Wallet, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface ImportConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary: ImportSummary;
  selectedAccount?: Account;
  isProcessing: boolean;
  error?: string | null;
}

export function ImportConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  summary,
  selectedAccount,
  isProcessing,
  error,
}: ImportConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isProcessing && onClose()}>
      <DialogContent className="max-w-md w-full p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Confirmar Importación de Movimientos
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Revisa los detalles antes de registrar definitivamente las transacciones en tu aplicación.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Cuenta destino */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Cuenta de destino</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {selectedAccount?.name || 'Cuenta no seleccionada'}
              </p>
              {selectedAccount?.detail && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {selectedAccount.detail}
                </p>
              )}
            </div>
          </div>

          {/* Métricas a importar */}
          <div className="space-y-2 text-xs sm:text-sm">
            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
              <span className="text-gray-600 dark:text-gray-400">Movimientos seleccionados:</span>
              <span className="font-bold text-gray-900 dark:text-gray-100">{summary.seleccionados}</span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                <ArrowDownLeft className="w-4 h-4" /> Entradas ({summary.cantidadEntradas}):
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{summary.entradasTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs.
              </span>
            </div>

            <div className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-800">
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                <ArrowUpRight className="w-4 h-4" /> Salidas ({summary.cantidadSalidas}):
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                -{summary.salidasTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs.
              </span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Volver a revisar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registrando...</span>
              </>
            ) : (
              <span>Confirmar y Guardar</span>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
