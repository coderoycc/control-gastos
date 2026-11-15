import { Plus, Edit2, Trash2, DollarSign, AlertCircle, Layers } from 'lucide-react';
import { BottomSheet } from '../../../components';
import { useConfigLimits } from '../hooks/useConfigLimits';

interface LimitSectionProps {
  onDelete: (id: string) => void;
}

export function LimitSection({ onDelete }: LimitSectionProps) {
  const {
    spendingLimits,
    accounts,
    accountMap,
    showForm,
    editingId,
    title,
    amount,
    accountId,
    enabled,
    hasAnotherActiveInScope,
    setTitle,
    setAmount,
    setAccountId,
    setEnabled,
    openAdd,
    openEdit,
    close,
    handleSubmit,
  } = useConfigLimits();

  const activeLimitsCount = spendingLimits.filter((limit) => limit.enabled).length;

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={openAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nuevo Límite
        </button>
      </div>

      <div className="px-4 pt-3">
        <div
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
            activeLimitsCount > 0
              ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300'
              : 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800/50 text-gray-500 dark:text-gray-400'
          }`}
        >
          <AlertCircle
            className={`w-4 h-4 flex-shrink-0 ${
              activeLimitsCount > 0
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}
          />
          <span>
            {activeLimitsCount > 0
              ? `${activeLimitsCount} ${
                  activeLimitsCount === 1 ? 'límite activo configurado' : 'límites activos configurados'
                }.`
              : 'Sin límites activos.'}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3">
        {spendingLimits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
            <DollarSign className="w-10 h-10 mb-2 opacity-50" />
            <p>No hay límites de gasto registrados</p>
            <p className="text-sm mt-1">Crea un nuevo límite para controlar tus gastos</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {spendingLimits.map((limit) => {
              const accountName = limit.accountId ? accountMap.get(limit.accountId) : null;

              return (
                <div
                  key={limit.id}
                  className={`flex items-center justify-between py-2.5 px-2 rounded-lg transition-colors ${
                    limit.enabled
                      ? 'bg-orange-50/50 dark:bg-orange-950/20'
                      : 'opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        limit.enabled
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-400 dark:bg-gray-600 text-white'
                      }`}
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{limit.title}</p>
                        {limit.enabled && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-orange-500 text-white font-medium">
                            Activo
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs font-semibold ${
                            limit.enabled
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          ${limit.amount.toLocaleString()}/mes
                        </span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          • {accountName ? `Cuenta: ${accountName}` : 'Todas las cuentas'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(limit)}
                      className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 cursor-pointer"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(limit.id)}
                      className="p-1.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={showForm}
        onClose={close}
        title={editingId ? 'Editar Límite' : 'Nuevo Límite de Gasto'}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300 font-medium">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Límite Alimentación / Límite Mensual General"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300 font-medium">
              Aplica a
            </label>
            <div className="relative">
              <select
                value={accountId ?? ''}
                onChange={(e) => setAccountId(e.target.value ? e.target.value : null)}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white appearance-none pr-8 cursor-pointer"
              >
                <option value="">Todas las cuentas (Global)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    Cuenta: {acc.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">
              Si eliges una cuenta específica, el límite se computará solo con los gastos de esa cuenta.
            </p>
          </div>

          <div>
            <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300 font-medium">
              Monto Mensual
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                step="0.01"
                min="0.01"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <label
            className={`flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors ${
              hasAnotherActiveInScope
                ? 'opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/20'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              disabled={hasAnotherActiveInScope}
              className={`w-5 h-5 rounded border-gray-300 dark:border-gray-600 mt-0.5 ${
                hasAnotherActiveInScope ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Límite Activo</span>
              {hasAnotherActiveInScope ? (
                <span className="text-[11px] text-orange-600 dark:text-orange-400 mt-0.5">
                  Ya existe otro límite activo para este mismo destino (
                  {accountId ? 'esta cuenta' : 'todas las cuentas'}). Desactívalo primero para activar este.
                </span>
              ) : (
                <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                  Las alertas saltarán al registrar gastos en este destino.
                </span>
              )}
            </div>
          </label>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all font-medium text-sm shadow-sm cursor-pointer"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </BottomSheet>
    </>
  );
}
