import { useState, useMemo } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { useData } from '../../context';
import { useHorizontalSwipe } from '../../../hooks/useHorizontalSwipe';

export function useReportMonth() {
  const { transactions } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const swipeHandlers = {
    onSwipeLeft: handleNextMonth,
    onSwipeRight: handlePreviousMonth,
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
    handlePreviousMonth,
    handleNextMonth,
  };
}
