import { useMemo } from 'react';
import { useData } from '../../context';
import { calculateLimitStatus } from '../../limits';

interface UseSpendingLimitAlertProps {
  amount: string;
  date: string;
  type: string;
  accountId?: string | null;
  excludeId?: string;
}

export function useSpendingLimitAlert({
  amount,
  date,
  type,
  accountId,
  excludeId,
}: UseSpendingLimitAlertProps) {
  const { transactions, spendingLimits } = useData();

  // Evaluamos de forma puramente computada el estado y las alertas del límite
  const limitStatus = useMemo(() => {
    return calculateLimitStatus({
      transactions,
      spendingLimits,
      amount,
      date,
      type,
      accountId,
      excludeId,
    });
  }, [transactions, spendingLimits, amount, date, type, accountId, excludeId]);

  return {
    activeLimit: limitStatus?.activeLimit,
    monthlyExpensesTotalWithoutCurrent: limitStatus?.monthlyExpensesTotalWithoutCurrent ?? 0,
    totalWithCurrent: limitStatus?.totalWithCurrent ?? 0,
    percentage: limitStatus?.percentage ?? 0,
    alertType: limitStatus?.alertType ?? null,
  };
}
