import { Plus, Edit2, Trash2, DollarSign, AlertCircle } from 'lucide-react';
import { BottomSheet } from '../../../components';
import { useConfigLimits } from '../hooks/useConfigLimits';

interface LimitSectionProps {
  onDelete: (id: string) => void;
}

export function LimitSection({ onDelete }: LimitSectionProps) {
  const {
    spendingLimits,
    showForm,
    editingId,
    title,
    amount,
    enabled,
    hasAnotherActive,
    setTitle,
    setAmount,
    setEnabled,
    openAdd,
    openEdit,
    close,
    handleSubmit,
  } = useConfigLimits();

  const hasActiveLimit = spendingLimits.some(limit => limit.enabled);

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={openAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
        >
          <Plus className="w-4 h-4" />
          Nuevo Límite
        </button>
      </div>

      <div className="px-4 pt-3">
        <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-xs transition-colors ${
          hasActiveLimit 
            ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50 text-blue-800 dark:text-blue-300' 
            : 'bg-gray-50 dark:bg-gray-800/30 border-gray-100 dark:border-gray-800/50 text-gray-500 dark:text-gray-400'
        }`}>
          <AlertCircle className={`w-4 h-4 flex-shrink-0 ${
            hasActiveLimit ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'
          }`} />
          <span>{hasActiveLimit ? 'Alertas de gastos mensuales activadas.' : 'Sin límites activos.'}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3">
        {spendingLimits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
            <DollarSign className="w-10 h-10 mb-2 opacity-50" />
            <p>No hay límites de gasto registrados</p>
            <p className="text-sm mt-1">Crea un nuevo límite</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {spendingLimits.map(limit => (
              <div
                key={limit.id}
                className={`flex items-center justify-between py-2 px-2 ${
                  limit.enabled
                    ? 'bg-orange-50/50 dark:bg-orange-950/20'
                    : 'opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                      limit.enabled
                        ? 'bg-orange-500'
                        : 'bg-gray-400 dark:bg-gray-600'
                    }`}
                  >
                    <DollarSign className="w-3 h-3 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{limit.title}</p>
                    <p
                      className={`text-xs ${
                        limit.enabled
                          ? 'text-orange-600 dark:text-orange-400'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      ${limit.amount.toLocaleString()}/mes
                    </p>
                  </div>
                  {limit.enabled && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500 text-white">
                      Activo
                    </span>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(limit)}
                    className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(limit.id)}
                    className="p-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
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
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Título</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ej: Límite Mensual"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Monto Mensual
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="1000"
                step="0.01"
                min="0"
                className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                required
              />
            </div>
          </div>
          <label 
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
              hasAnotherActive 
                ? 'opacity-60 cursor-not-allowed bg-gray-50/50 dark:bg-gray-800/20' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={e => setEnabled(e.target.checked)}
              disabled={hasAnotherActive}
              className={`w-5 h-5 rounded border-gray-300 dark:border-gray-600 ${
                hasAnotherActive ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">Habilitado</span>
              {hasAnotherActive && (
                <span className="text-[10px] text-orange-600 dark:text-orange-400">
                  Ya tienes otro límite activo. Desactívalo primero para poder activar este.
                </span>
              )}
            </div>
          </label>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </BottomSheet>
    </>
  );
}
