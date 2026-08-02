import { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useEditTransactionForm } from "../hooks/useEditTransactionForm";
import { getBackgroundColor } from "../utils/transactionStyles";
import { useParams } from "react-router";
import { useSpendingLimitAlert } from "../hooks/useSpendingLimitAlert";
import { useHorizontalSwipe } from "../../../hooks/useHorizontalSwipe";
import { SmartAmountInput } from "./SmartAmountInput";
import { TransactionTypeTabs } from "./form/TransactionTypeTabs";
import { DateTimePicker } from "./form/DateTimePicker";
import { AccountFields } from "./form/AccountFields";
import { LabelSelector } from "./form/LabelSelector";
import { SpendingLimitModal } from "./form/SpendingLimitModal";

export function EditTransactionForm() {
  const [limitModalOpen, setLimitModalOpen] = useState(false);
  const { id } = useParams<{ id: string }>();

  const {
    type,
    date,
    time,
    detail,
    amount,
    accountId,
    toAccountId,
    selectedLabels,
    showDeleteConfirm,
    filteredLabels,
    accounts,
    setType,
    setDate,
    setTime,
    setDetail,
    setAmount,
    setAccountId,
    setToAccountId,
    setShowDeleteConfirm,
    toggleLabel,
    cycleType,
    handleSubmit,
    handleDelete,
    goBack,
  } = useEditTransactionForm();

  const {
    activeLimit,
    monthlyExpensesTotalWithoutCurrent,
    totalWithCurrent,
    percentage,
    alertType,
  } = useSpendingLimitAlert({ amount, date, type, excludeId: id });

  const prevAlertTypeRef = useRef(alertType);

  useEffect(() => {
    if (
      prevAlertTypeRef.current !== alertType &&
      alertType &&
      activeLimit &&
      type === "salida"
    ) {
      const message =
        alertType === "danger_100"
          ? `¡Límite excedido! Has alcanzado o superado el 100% de tu límite ($${activeLimit.amount.toLocaleString()}).`
          : `¡Cuidado! Tus gastos acumulados del mes están por alcanzar el 90% del límite ($${activeLimit.amount.toLocaleString()}).`;
      if (alertType === "danger_100") {
        toast.error(message);
      } else {
        toast.warning(message);
      }
    }
    prevAlertTypeRef.current = alertType;
  }, [alertType, activeLimit, type]);

  const handleNegativeValue = useCallback(() => {
    toast.warning("El valor negativo se ha convertido a positivo");
  }, []);

  const swipeRef = useHorizontalSwipe(
    {
      onSwipeLeft: () => cycleType("left"),
      onSwipeRight: () => cycleType("right"),
    },
    {
      threshold: 30,
      velocityThreshold: 0.15,
      preventScrollOnSwipe: true,
    },
  );

  const isTransfer = type === "transferencia";

  return (
    <div
      ref={swipeRef}
      className={`flex flex-col h-full transition-colors ${getBackgroundColor(type)}`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={goBack}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-medium flex-1">Editar Transacción</h2>

        {activeLimit && type === "salida" && alertType && (
          <button
            type="button"
            onClick={() => setLimitModalOpen(true)}
            className="w-6 h-6 rounded-full bg-orange-500 active:bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer mr-1"
          >
            ?
          </button>
        )}

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors mr-1"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto px-4 py-3">
        <div className="space-y-3 max-w-md mx-auto">
          <TransactionTypeTabs type={type} onChange={setType} />
          <DateTimePicker date={date} time={time} setDate={setDate} setTime={setTime} />

          {/* Amount */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm z-10">
                $
              </span>
              <SmartAmountInput
                value={amount}
                onChange={setAmount}
                onNegativeValue={handleNegativeValue}
                autoFocus
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              />
            </div>
          </div>

          {/* Detail */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Detalle {isTransfer && "(opcional)"}
            </label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={
                isTransfer
                  ? "Descripción de la transferencia"
                  : "Descripción de la transacción"
              }
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              required={!isTransfer}
            />
          </div>

          <AccountFields
            type={type}
            accountId={accountId}
            toAccountId={toAccountId}
            accounts={accounts}
            setAccountId={setAccountId}
            setToAccountId={setToAccountId}
          />

          <LabelSelector
            type={type}
            filteredLabels={filteredLabels}
            selectedLabels={selectedLabels}
            toggleLabel={toggleLabel}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-4 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Save className="w-5 h-5" />
            Guardar Cambios
          </button>
        </div>
      </form>

      {/* Spending Limit Modal */}
      <SpendingLimitModal
        isOpen={limitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        activeLimit={activeLimit}
        monthlyExpensesTotalWithoutCurrent={monthlyExpensesTotalWithoutCurrent}
        amount={amount}
        totalWithCurrent={totalWithCurrent}
        percentage={percentage}
        isEdit={true}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Eliminar Transacción</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta transacción? Esta acción
              no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
