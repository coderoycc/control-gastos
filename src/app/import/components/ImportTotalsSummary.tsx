// src/app/import/components/ImportTotalsSummary.tsx
import { ImportSummary } from '../types';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';

interface ImportTotalsSummaryProps {
  summary: ImportSummary;
  onProceed: () => void;
  disabled?: boolean;
  isProcessing?: boolean;
}

export function ImportTotalsSummary({
  summary,
  onProceed,
  disabled,
  isProcessing,
}: ImportTotalsSummaryProps) {
  const netBalance = summary.entradasTotal - summary.salidasTotal;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Resumen de Selección
        </h4>
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          <strong className="text-blue-600 dark:text-blue-400">{summary.seleccionados}</strong> de {summary.encontrados} seleccionados
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {/* Entradas */}
        <div className="flex flex-col bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 p-3 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
            <ArrowDownLeft className="w-3.5 h-3.5" />
            <span>Entradas ({summary.cantidadEntradas})</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            +{summary.entradasTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs.
          </p>
        </div>

        {/* Salidas */}
        <div className="flex flex-col bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 p-3 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-rose-700 dark:text-rose-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Salidas ({summary.cantidadSalidas})</span>
          </div>
          <p className="text-base sm:text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
            -{summary.salidasTotal.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs.
          </p>
        </div>

        {/* Balance Neto */}
        <div className="col-span-2 sm:col-span-1 flex flex-col bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800 p-3 rounded-lg">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Impacto Neto</span>
          </div>
          <p
            className={`text-base sm:text-lg font-bold mt-1 ${
              netBalance > 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : netBalance < 0
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
          >
            {netBalance > 0 ? '+' : ''}
            {netBalance.toLocaleString('es-BO', { minimumFractionDigits: 2 })} Bs.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <button
          type="button"
          onClick={onProceed}
          disabled={disabled || summary.seleccionados === 0 || isProcessing}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-800 text-white disabled:text-gray-500 font-medium text-sm shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed"
        >
          <span>Confirmar e Importar {summary.seleccionados} Movimientos</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
