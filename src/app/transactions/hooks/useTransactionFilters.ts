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
  sortOrder: 'asc' | 'desc';
  selectedLabelId: string | null;
  searchQuery: string;
  setSelectedAccount: (account: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setShowFilters: (show: boolean) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setSelectedLabelId: (labelId: string | null) => void;
  setSearchQuery: (query: string) => void;
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
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

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

    if (selectedLabelId === '__none__') {
      filtered = filtered.filter(t => !t.labels || t.labels.length === 0);
    } else if (selectedLabelId !== null) {
      filtered = filtered.filter(t => t.labels && t.labels.includes(selectedLabelId));
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const detailMatch = t.detail && t.detail.toLowerCase().includes(query);
        const descMatch = (t as any).description && (t as any).description.toLowerCase().includes(query);
        const textMatch = (t as any).text && (t as any).text.toLowerCase().includes(query);
        return detailMatch || descMatch || textMatch;
      });
    }

    return filtered.sort((a, b) => {
      const timeA = new Date(`${a.date}T${a.time || '00:00'}`).getTime();
      const timeB = new Date(`${b.date}T${b.time || '00:00'}`).getTime();
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [transactions, selectedAccount, currentDate, startDate, endDate, sortOrder, selectedLabelId, searchQuery]);

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
    setSortOrder('desc');
    setSelectedLabelId(null);
    setSearchQuery('');
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
    sortOrder,
    selectedLabelId,
    searchQuery,
    setSelectedAccount,
    setStartDate,
    setEndDate,
    setShowFilters,
    setSortOrder,
    setSelectedLabelId,
    setSearchQuery,
    clearFilters,
    clearDateRange,
    filterDateText,
  };
}
