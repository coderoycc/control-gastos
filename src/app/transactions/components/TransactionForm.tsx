import { ArrowLeft, Save, AlertTriangle, X } from 'lucide-react';
import { useTransactionForm, TRANSACTION_TYPES } from '../hooks/useTransactionForm';
import { getBackgroundColor } from '../utils/transactionStyles';
import { useSpendingLimitAlert } from '../hooks/useSpendingLimitAlert';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../../../components/ui/tooltip';
import { useHorizontalSwipe } from '../../../hooks/useHorizontalSwipe';

export function TransactionForm() {
  const {
    type,
    date,
    detail,
    amount,
    accountId,
    toAccountId,
    selectedLabels,
    filteredLabels,
    accounts,
    setType,
    setDate,
    setDetail,
    setAmount,
    setAccountId,
    setToAccountId,
    toggleLabel,
    cycleType,
    handleSubmit,
    goBack,
  } = useTransactionForm();

  const {
    activeLimit,
    monthlyExpensesTotalWithoutCurrent,
    totalWithCurrent,
    percentage,
    alertType,
    isAlertVisible,
    setIsAlertVisible,
  } = useSpendingLimitAlert({ amount, date, type });

  const swipeRef = useHorizontalSwipe({
    onSwipeLeft: () => cycleType('left'),
    onSwipeRight: () => cycleType('right'),
  }, {
    threshold: 30,
    velocityThreshold: 0.15,
    preventScrollOnSwipe: true,
  });

  return (
    <div ref={swipeRef} className={`flex flex-col h-full transition-colors ${getBackgroundColor(type)}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={goBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-medium flex-1">Nueva Transacción</h2>

        {/* Icono "?" naranja con Tooltip informativo de límites (solo aparece si hay una alerta activa) */}
        {activeLimit && type === 'salida' && alertType && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="w-6 h-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm transition-all hover:scale-105 cursor-pointer"
                >
                  ?
                </button>
              </TooltipTrigger>
              <TooltipContent 
                side="bottom" 
                align="end" 
                className="p-3 max-w-[260px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-lg text-gray-800 dark:text-gray-200 z-[110]"
              >
                <div className="space-y-1.5 text-xs">
                  <p className="font-semibold text-orange-600 dark:text-orange-400 border-b border-gray-100 dark:border-gray-800 pb-1">
                    Detalle del Límite de Gasto
                  </p>
                  <div className="flex justify-between gap-4">
                    <span>Límite establecido:</span>
                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                      ${activeLimit.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Gastos del mes (previos):</span>
                    <span className="font-mono">
                      ${monthlyExpensesTotalWithoutCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-1">
                    <span>Monto actual a registrar:</span>
                    <span className="font-mono">
                      ${(parseFloat(amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 font-semibold text-gray-900 dark:text-white pt-0.5">
                    <span>Total Proyectado:</span>
                    <span className="font-mono">
                      ${totalWithCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4 text-[10px] text-gray-500 dark:text-gray-400">
                    <span>Porcentaje de límite:</span>
                    <span className={`font-mono font-bold ${percentage >= 100 ? 'text-red-500 dark:text-red-400' : percentage >= 90 ? 'text-orange-500 dark:text-orange-400' : 'text-gray-600 dark:text-gray-300'}`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Banner de alerta temporal */}
      {isAlertVisible && activeLimit && (
        <div className={`px-4 py-2.5 text-xs flex items-center justify-between border-b transition-all animate-in slide-in-from-top duration-300 ${
          alertType === 'danger_100'
            ? 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-300'
            : 'bg-amber-50 dark:bg-amber-950/20 border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${
              alertType === 'danger_100' ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
            }`} />
            <span>
              {alertType === 'danger_100'
                ? `¡Límite excedido! Has alcanzado o superado el 100% de tu límite ($${activeLimit.amount.toLocaleString()}).`
                : `¡Cuidado! Tus gastos acumulados del mes están por alcanzar el 90% del límite ($${activeLimit.amount.toLocaleString()}).`
              }
            </span>
          </div>
          <button
            onClick={() => setIsAlertVisible(false)}
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto px-4 py-3">
        <div className="space-y-3 max-w-md mx-auto">
          {/* Type Selection - Tabs */}
          <div>
            <label className="block text-xs mb-1 text-gray-700 dark:text-gray-300">
              Tipo de Transacción
            </label>
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {TRANSACTION_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
                    type === t
                      ? t === 'entrada'
                        ? 'text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400'
                        : t === 'salida'
                        ? 'text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400'
                        : 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {t === 'entrada' ? 'Entrada' : t === 'salida' ? 'Salida' : 'Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              required
            />
          </div>

          {/* Detail */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Detalle {type === 'transferencia' && '(opcional)'}
            </label>
            <input
              type="text"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder={
                type === 'transferencia'
                  ? 'Descripción de la transferencia'
                  : 'Descripción de la transacción'
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              required={type !== 'transferencia'}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                required
              />
            </div>
          </div>

          {/* Account */}
          {type !== 'transferencia' && (
            <div>
              <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
                Cuenta
              </label>
              <select
                value={accountId}
                onChange={e => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                required
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {type === 'transferencia' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
                  Cuenta Origen
                </label>
                <select
                  value={accountId}
                  onChange={e => setAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  required
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
                  Cuenta Destino
                </label>
                <select
                  value={toAccountId}
                  onChange={e => setToAccountId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                  required
                >
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Label */}
          {type !== 'transferencia' && (
            <div>
              <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
                Etiqueta
              </label>
              <div className="flex flex-wrap gap-1.5">
                {filteredLabels.map(label => {
                  const isSelected = selectedLabels.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                        isSelected
                          ? 'border-gray-900 dark:border-white scale-105 shadow-md'
                          : 'border-transparent opacity-50 hover:opacity-75'
                      }`}
                      style={{
                        backgroundColor: isSelected ? label.color : `${label.color}40`,
                        color: isSelected ? 'white' : label.color,
                      }}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
              {filteredLabels.length === 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                  No hay etiquetas de{' '}
                  {type === 'entrada' ? 'ingreso' : 'egreso'}. Crea etiquetas en
                  Configuración.
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-4 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Save className="w-5 h-5" />
            Guardar Transacción
          </button>
        </div>
      </form>
    </div>
  );
}
