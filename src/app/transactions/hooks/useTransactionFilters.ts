import { useState, useMemo, useCallback } from 'react';
import { parseISO, isWithinInterval, startOfMonth, endOfMonth } from 'date-fns';
import { useData } from '../../context/hooks/useData';
import { formatFilterDateRange } from '../utils/transactionFormatters';

export interface TransactionFiltersResult {
  filteredTransactions: ReturnType<typeof useData>['transactions'];
  summary: { income: number; expense: number };
  balance: number;
  selectedAccount: string;
  startDate: string;
  endDate: string;
  showFilters: boolean;
  setSelectedAccount: (account: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setShowFilters: (show: boolean) => void;
  clearFilters: () => void;
  clearDateRange: () => void;
  filterDateText: string | null;
}

export function useTransactionFilters(currentDate: Date): TransactionFiltersResult {
  const { transactions } = useData();

  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.accountId === selectedAccount);
    }

    if (startDate && endDate) {
      filtered = filtered.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, {
          start: parseISO(startDate),
          end: parseISO(endDate),
        });
      });
    } else {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      filtered = filtered.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });
    }

    return filtered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions, selectedAccount, currentDate, startDate, endDate]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, t) => {
        if (t.type === 'entrada') {
          acc.income += t.amount;
        } else if (t.type === 'salida') {
          acc.expense += t.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [filteredTransactions]);

  const balance = summary.income - summary.expense;

  const clearFilters = useCallback(() => {
    setSelectedAccount('all');
    setStartDate('');
    setEndDate('');
  }, []);

  const clearDateRange = useCallback(() => {
    setStartDate('');
    setEndDate('');
  }, []);

  const filterDateText = startDate && endDate
    ? formatFilterDateRange(startDate, endDate)
    : null;

  return {
    filteredTransactions,
    summary,
    balance,
    selectedAccount,
    startDate,
    endDate,
    showFilters,
    setSelectedAccount,
    setStartDate,
    setEndDate,
    setShowFilters,
    clearFilters,
    clearDateRange,
    filterDateText,
  };
}
