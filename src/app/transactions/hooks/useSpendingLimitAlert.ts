import { useState, useEffect, useMemo } from 'react';
import { useData } from '../../context';
import { getMonthlyExpensesTotal } from '../utils/limitCalculations';

interface UseSpendingLimitAlertProps {
  amount: string;
  date: string;
  type: string;
  excludeId?: string;
}

export function useSpendingLimitAlert({
  amount,
  date,
  type,
  excludeId,
}: UseSpendingLimitAlertProps) {
  const { transactions, spendingLimits } = useData();

  const [alertType, setAlertType] = useState<'warning_90' | 'danger_100' | null>(null);

  // Verificar si la fecha seleccionada corresponde al año y mes actuales del sistema
  const isCurrentMonth = useMemo(() => {
    if (!date) return false;
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return date.startsWith(currentYearMonth);
  }, [date]);

  // Encontrar el límite activo de gasto (solo aplicable si corresponde al mes actual)
  const activeLimit = useMemo(() => {
    if (!isCurrentMonth) return undefined;
    return spendingLimits.find(limit => limit.enabled);
  }, [spendingLimits, isCurrentMonth]);

  // Obtener el acumulado del mes sin el registro actual
  const monthlyExpensesTotalWithoutCurrent = useMemo(() => {
    return getMonthlyExpensesTotal(transactions, date, excludeId);
  }, [transactions, date, excludeId]);

  // Calcular el total incluyendo la transacción actual si es de tipo "salida"
  const totalWithCurrent = useMemo(() => {
    const parsedAmount = parseFloat(amount) || 0;
    if (type !== 'salida') {
      return monthlyExpensesTotalWithoutCurrent;
    }
    return monthlyExpensesTotalWithoutCurrent + parsedAmount;
  }, [type, monthlyExpensesTotalWithoutCurrent, amount]);

  // Calcular porcentaje consumido en base al límite
  const percentage = useMemo(() => {
    if (!activeLimit || activeLimit.amount <= 0) return 0;
    return (totalWithCurrent / activeLimit.amount) * 100;
  }, [activeLimit, totalWithCurrent]);

  // Actualizar el tipo de alerta cuando se cruza un umbral
  useEffect(() => {
    if (type !== 'salida' || !activeLimit) {
      setAlertType(null);
      return;
    }

    const limitAmount = activeLimit.amount;
    let nextAlertType: 'warning_90' | 'danger_100' | null = null;

    if (totalWithCurrent >= limitAmount) {
      nextAlertType = 'danger_100';
    } else if (totalWithCurrent >= limitAmount * 0.9) {
      nextAlertType = 'warning_90';
    }

    setAlertType(prev => prev !== nextAlertType ? nextAlertType : prev);
  }, [totalWithCurrent, activeLimit, type]);

  return {
    activeLimit,
    monthlyExpensesTotalWithoutCurrent,
    totalWithCurrent,
    percentage,
    alertType,
  };
}
