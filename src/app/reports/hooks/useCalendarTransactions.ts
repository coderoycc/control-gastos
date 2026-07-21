import { useState, useMemo } from 'react';
import { startOfMonth, endOfMonth, addMonths, subMonths, format, parseISO } from 'date-fns';
import { useData } from '../../context';
import type { Transaction } from '../../context/types';

export interface CalendarFilters {
  tagId?: string | null;
  tagValue?: string | null;
  accountId?: string | null;
  transactionType?: 'entrada' | 'salida' | 'transferencia' | null;
}

export interface UseCalendarTransactionsResult {
  currentMonth: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  transactionsByDay: Record<string, Transaction[]>;
  daysWithTransactions: Set<string>;
  selectedDay: Date | null;
  setSelectedDay: (day: Date | null) => void;
  dayTransactions: Transaction[];
  dayTotals: { income: number; expenses: number; balance: number };
}

export function useCalendarTransactions(
  initialMonth?: string | null,
  filters?: CalendarFilters,
): UseCalendarTransactionsResult {
  const { transactions, labels } = useData();

  const parseInitialMonth = (): Date => {
    if (initialMonth) {
      const [year, month] = initialMonth.split('-').map(Number);
      if (!isNaN(year) && !isNaN(month)) {
        return new Date(year, month - 1, 1);
      }
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const [currentMonth, setCurrentMonth] = useState<Date>(parseInitialMonth);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const filteredTransactions = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const monthStartTime = monthStart.getTime();
    const monthEndTime = monthEnd.getTime();

    return transactions.filter(tx => {
      // Filtro por mes
      const txDate = parseISO(tx.date);
      const txTime = txDate.getTime();
      if (txTime < monthStartTime || txTime > monthEndTime) return false;

      // Filtro por accountId
      if (filters?.accountId) {
        if (tx.accountId !== filters.accountId && tx.toAccountId !== filters.accountId) return false;
      }

      // Filtro por tagId
      if (filters?.tagId) {
        if (filters.tagId === 'no-tag' || filters.tagId === '__none__') {
          if (tx.labels && tx.labels.length > 0) return false;
        } else if (!tx.labels?.includes(filters.tagId)) {
          return false;
        }
      }

      // Filtro por tagValue (nombre de etiqueta)
      if (filters?.tagValue && !filters.tagId) {
        const matchingLabel = labels.find(
          l => l.name.toLowerCase() === filters.tagValue!.toLowerCase(),
        );
        if (!matchingLabel || !tx.labels?.includes(matchingLabel.id)) return false;
      }

      // Filtro por tipo de transacción
      if (filters?.transactionType) {
        if (tx.type !== filters.transactionType) return false;
      }

      return true;
    });
  }, [transactions, labels, currentMonth, filters?.accountId, filters?.tagId, filters?.tagValue, filters?.transactionType]);

  const transactionsByDay = useMemo<Record<string, Transaction[]>>(() => {
    const map: Record<string, Transaction[]> = {};
    for (const tx of filteredTransactions) {
      const key = tx.date; // ya es YYYY-MM-DD
      if (!map[key]) map[key] = [];
      map[key].push(tx);
    }
    return map;
  }, [filteredTransactions]);

  const daysWithTransactions = useMemo<Set<string>>(
    () => new Set(Object.keys(transactionsByDay)),
    [transactionsByDay],
  );

  const dayTransactions = useMemo<Transaction[]>(() => {
    if (!selectedDay) return [];
    const key = format(selectedDay, 'yyyy-MM-dd');
    return transactionsByDay[key] ?? [];
  }, [selectedDay, transactionsByDay]);

  const dayTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const tx of dayTransactions) {
      if (tx.type === 'entrada') income += tx.amount;
      else if (tx.type === 'salida') expenses += tx.amount;
    }
    return { income, expenses, balance: income - expenses };
  }, [dayTransactions]);

  const goToPreviousMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const goToNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    transactionsByDay,
    daysWithTransactions,
    selectedDay,
    setSelectedDay,
    dayTransactions,
    dayTotals,
  };
}
