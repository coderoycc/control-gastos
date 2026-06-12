import { ArrowLeft, Save } from 'lucide-react';
import { useTransactionForm } from '../hooks/useTransactionForm';
import { getTypeButtonClass, getBackgroundColor } from '../utils/transactionStyles';

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
    handleSubmit,
    goBack,
  } = useTransactionForm();

  return (
    <div className={`flex flex-col h-full transition-colors ${getBackgroundColor(type)}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={goBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-medium">Nueva Transacción</h2>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto px-4 py-3">
        <div className="space-y-3 max-w-md mx-auto">
          {/* Type Selection */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Tipo de Transacción
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('entrada')}
                className={getTypeButtonClass('entrada', type)}
              >
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setType('salida')}
                className={getTypeButtonClass('salida', type)}
              >
                Salida
              </button>
              <button
                type="button"
                onClick={() => setType('transferencia')}
                className={getTypeButtonClass('transferencia', type)}
              >
                Transferencia
              </button>
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
