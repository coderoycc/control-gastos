// src/app/import/components/ImportResultCard.tsx
import { FinalImportResult } from '../types';
import { CheckCircle2, List, RefreshCw, AlertCircle, Copy } from 'lucide-react';
import { Link } from 'react-router';

interface ImportResultCardProps {
  result: FinalImportResult;
  onReset: () => void;
  accountName?: string;
}

export function ImportResultCard({ result, onReset, accountName }: ImportResultCardProps) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          ¡Importación Completada!
        </h3>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Los movimientos seleccionados han sido registrados exitosamente en la cuenta{' '}
          <strong className="font-semibold text-gray-900 dark:text-gray-100">
            {accountName || 'seleccionada'}
          </strong>.
        </p>
      </div>

      {/* Tarjetas de resultados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {result.importados}
          </span>
          <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300 mt-0.5">
            Registrados
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-800">
          <span className="text-2xl font-extrabold text-gray-700 dark:text-gray-300">
            {result.omitidos}
          </span>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-0.5">
            Omitidos
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
            <Copy className="w-4 h-4" />
            <span className="text-2xl font-extrabold">{result.duplicados}</span>
          </div>
          <span className="text-xs font-medium text-amber-800 dark:text-amber-300 mt-0.5">
            Duplicados
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-2xl font-extrabold">{result.errores}</span>
          </div>
          <span className="text-xs font-medium text-rose-800 dark:text-rose-300 mt-0.5">
            Errores
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full pt-2">
        <Link
          to="/"
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-sm transition-colors"
        >
          <List className="w-4 h-4" />
          <span>Ver Transacciones</span>
        </Link>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Importar otro extracto</span>
        </button>
      </div>
    </div>
  );
}
