import { useMemo, useEffect } from 'react';
import { parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { useData } from '../../context';
import { useHorizontalSwipe } from '../../../hooks/useHorizontalSwipe';
import { useReportsDate } from '../context';

export function useReportMonth() {
  const { transactions } = useData();
  const { currentDate, goToPreviousMonth, goToNextMonth, resetToMonthView } = useReportsDate();

  useEffect(() => {
    resetToMonthView();
  }, [resetToMonthView]);

  const swipeHandlers = {
    onSwipeLeft: goToNextMonth,
    onSwipeRight: goToPreviousMonth,
  };
  const containerRef = useHorizontalSwipe(swipeHandlers, {
    threshold: 50,
    delta: 20,
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [transactions, monthStart, monthEnd]);

  const totals = useMemo(() => {
    return monthTransactions.reduce(
      (acc, t) => {
        if (t.type === 'entrada') {
          acc.income += t.amount;
        } else if (t.type === 'salida') {
          acc.expenses += t.amount;
        } else {
          acc.transfers += t.amount;
        }
        return acc;
      },
      { income: 0, expenses: 0, transfers: 0 }
    );
  }, [monthTransactions]);

  const balance = totals.income - totals.expenses;

  return {
    containerRef,
    currentDate,
    monthTransactions,
    totals,
    balance,
    handlePreviousMonth: goToPreviousMonth,
    handleNextMonth: goToNextMonth,
  };
}
