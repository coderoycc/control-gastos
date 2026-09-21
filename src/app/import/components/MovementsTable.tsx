// src/app/import/components/MovementsTable.tsx
import { ParsedMovement } from '../types';
import { ArrowDownLeft, ArrowUpRight, Copy, AlertTriangle, X } from 'lucide-react';

interface MovementsTableProps {
  movements: ParsedMovement[];
  onToggleSelection: (id: string) => void;
}

export function MovementsTable({ movements, onToggleSelection }: MovementsTableProps) {
  if (movements.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No hay movimientos para mostrar.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
      {/* Vista de Tabla para Pantallas Medianas y Grandes */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/75 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-semibold">
              <th className="py-3 px-3 w-10 text-center">Sel.</th>
              <th className="py-3 px-3 w-28">Fecha</th>
              <th className="py-3 px-2 w-16">Agencia</th>
              <th className="py-3 px-3">Descripción / Detalle</th>
              <th className="py-3 px-3 w-28">Nro. Doc</th>
              <th className="py-3 px-3 w-32 text-right">Monto</th>
              <th className="py-3 px-3 w-28 text-right">Saldo</th>
              <th className="py-3 px-3 w-28 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {movements.map((movement) => {
              const isIncome = movement.monto > 0;
              const isExpense = movement.monto < 0;

              return (
                <tr
                  key={movement.id}
                  onClick={() => movement.importable && onToggleSelection(movement.id)}
                  className={`transition-colors cursor-pointer select-none ${
                    !movement.importable
                      ? 'bg-red-50/40 dark:bg-red-950/20 opacity-75'
                      : movement.seleccionado
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50/70 dark:hover:bg-blue-950/40'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800/40 opacity-60'
                  }`}
                >
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={movement.seleccionado}
                      disabled={!movement.importable}
                      onChange={() => onToggleSelection(movement.id)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 cursor-pointer disabled:opacity-40"
                    />
                  </td>

                  <td className="py-3 px-3 font-mono text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {movement.fecha}
                  </td>

                  <td className="py-3 px-2 text-xs font-mono text-gray-500 dark:text-gray-400">
                    {movement.agencia || '-'}
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                        {movement.descripcion}
                      </span>
                      {movement.error && (
                        <span className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          {movement.error}
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap">
                    {movement.documento || '-'}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap font-semibold">
                    <span
                      className={`inline-flex items-center gap-1 ${
                        isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      {isIncome ? (
                        <ArrowDownLeft className="w-3.5 h-3.5 shrink-0" />
                      ) : isExpense ? (
                        <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      ) : null}
                      {movement.monto > 0 ? '+' : ''}
                      {movement.monto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {movement.saldo !== undefined
                      ? movement.saldo.toLocaleString('es-BO', { minimumFractionDigits: 2 })
                      : '-'}
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {!movement.importable ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800">
                        <X className="w-3 h-3" /> Error
                      </span>
                    ) : movement.duplicado ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                        <Copy className="w-3 h-3" /> Duplicado
                      </span>
                    ) : !movement.seleccionado ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        Omitido
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Vista de Tarjetas para Móviles */}
      <div className="md:hidden divide-y divide-gray-100 dark:divide-gray-800">
        {movements.map((movement) => {
          const isIncome = movement.monto > 0;
          const isExpense = movement.monto < 0;

          return (
            <div
              key={movement.id}
              onClick={() => movement.importable && onToggleSelection(movement.id)}
              className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer select-none ${
                !movement.importable
                  ? 'bg-red-50/40 dark:bg-red-950/20 opacity-75'
                  : movement.seleccionado
                  ? 'bg-blue-50/30 dark:bg-blue-950/20'
                  : 'opacity-60'
              }`}
            >
              <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={movement.seleccionado}
                  disabled={!movement.importable}
                  onChange={() => onToggleSelection(movement.id)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-700 cursor-pointer disabled:opacity-40"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                    {movement.fecha} {movement.agencia ? `• ${movement.agencia}` : ''}
                  </span>
                  
                  <span
                    className={`text-sm font-semibold inline-flex items-center gap-0.5 ${
                      isIncome
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isExpense
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {isIncome ? '+' : ''}
                    {movement.monto.toLocaleString('es-BO', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <p className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-snug break-words">
                  {movement.descripcion}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 font-mono">
                    {movement.documento && <span>Doc: {movement.documento}</span>}
                    {movement.saldo !== undefined && (
                      <span>Saldo: {movement.saldo.toLocaleString('es-BO', { minimumFractionDigits: 2 })}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!movement.importable ? (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                        Error
                      </span>
                    ) : movement.duplicado ? (
                      <span className="text-[10px] px-2 py-0.2 rounded-full font-medium bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                        Duplicado
                      </span>
                    ) : null}
                  </div>
                </div>

                {movement.error && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 mt-0.5">
                    {movement.error}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
