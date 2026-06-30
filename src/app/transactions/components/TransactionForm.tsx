import { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Save, AlertTriangle, X, CalendarDays, Clock } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { useTransactionForm, TRANSACTION_TYPES } from '../hooks/useTransactionForm';
import { getBackgroundColor } from '../utils/transactionStyles';
import { useSpendingLimitAlert } from '../hooks/useSpendingLimitAlert';
import { useHorizontalSwipe } from '../../../hooks/useHorizontalSwipe';
import { TagLabel } from '../../../components';

function parseDateString(str: string): Date | undefined {
  if (!str) return undefined;
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateTimeDisplay(dateStr: string, timeStr: string): string {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  if (!d) return dateStr;
  const datePart = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
  if (!timeStr) return datePart;
  return `${datePart}, ${timeStr}`;
}

export function TransactionForm() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!calendarOpen) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node)) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [calendarOpen]);
  const {
    type,
    date,
    time,
    detail,
    amount,
    accountId,
    toAccountId,
    selectedLabels,
    filteredLabels,
    accounts,
    setType,
    setDate,
    setTime,
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

        {/* Icono "?" naranja — abre modal de límite de gasto */}
        {activeLimit && type === 'salida' && alertType && (
          <button
            type="button"
            onClick={() => setLimitModalOpen(true)}
            className="w-6 h-6 rounded-full bg-orange-500 active:bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            ?
          </button>
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

          {/* Date & Time */}
          <div className="relative" ref={calendarRef}>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Fecha y Hora
            </label>
            <button
              type="button"
              onClick={() => setCalendarOpen(prev => !prev)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-left flex items-center justify-between gap-2 transition-colors hover:border-blue-400 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
            >
              <span className={date ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}>
                {date ? formatDateTimeDisplay(date, time) : 'Seleccionar fecha y hora'}
              </span>
              <CalendarDays className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
            </button>

            {calendarOpen && (
              <div className="absolute z-50 mt-1 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <DayPicker
                  mode="single"
                  selected={parseDateString(date)}
                  onSelect={(day) => {
                    if (day) {
                      const yyyy = day.getFullYear();
                      const mm = String(day.getMonth() + 1).padStart(2, '0');
                      const dd = String(day.getDate()).padStart(2, '0');
                      setDate(`${yyyy}-${mm}-${dd}`);
                    }
                  }}
                  defaultMonth={parseDateString(date)}
                  captionLayout="dropdown-buttons"
                  fromYear={2020}
                  toYear={new Date().getFullYear() + 1}
                  className="rdp-custom"
                />
                {/* Selector de hora */}
                <div className="px-4 pb-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      Hora
                    </span>
                    <input
                      type="time"
                      value={time}
                      onChange={e => setTime(e.target.value)}
                      className="flex-1 px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setCalendarOpen(false)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white text-xs font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                    >
                      Listo
                    </button>
                  </div>
                </div>
              </div>
            )}
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
                autoFocus
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                required
              />
            </div>
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
                    <TagLabel
                      key={label.id}
                      name={label.name}
                      color={label.color}
                      size="md"
                      selected={isSelected}
                      onClick={() => toggleLabel(label.id)}
                    />
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

      {/* Modal de detalle de límite de gasto */}
      {limitModalOpen && activeLimit && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/50"
          onClick={() => setLimitModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ?
                </span>
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                  Detalle del Límite de Gasto
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLimitModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cuerpo del modal */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Límite establecido</span>
                <span className="font-mono font-semibold text-gray-900 dark:text-white">
                  ${activeLimit.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Gastos del mes (previos)</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  ${monthlyExpensesTotalWithoutCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Monto actual a registrar</span>
                <span className="font-mono text-gray-700 dark:text-gray-300">
                  ${(parseFloat(amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Separador */}
              <div className="border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900 dark:text-white">Total Proyectado</span>
                  <span className="font-mono font-semibold text-gray-900 dark:text-white">
                    ${totalWithCurrent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Porcentaje del límite</span>
                  <span className={`font-mono font-bold ${
                    percentage >= 100
                      ? 'text-red-500 dark:text-red-400'
                      : percentage >= 90
                      ? 'text-orange-500 dark:text-orange-400'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentage >= 100
                        ? 'bg-red-500'
                        : percentage >= 90
                        ? 'bg-orange-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => setLimitModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 active:bg-gray-200 dark:active:bg-gray-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
