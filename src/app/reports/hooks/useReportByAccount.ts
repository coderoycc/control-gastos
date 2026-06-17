import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { useData } from '../../context';
import { isValidDate } from '../utils/reportValidators';
 
export function useReportByAccount() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { transactions, accounts, labels } = useData();
 
  const monthParam = searchParams.get('month');
  const currentDate = useMemo(() => {
    const now = new Date();
    if (monthParam) {
      const [yearStr, monthStr] = monthParam.split('-');
      const year = parseInt(yearStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      return new Date(year, month, 1);
    }
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, [monthParam]);
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
 
  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [allTransactions, setAllTransactions] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(monthStart, 'yyyy-MM-dd'),
    end: format(monthEnd, 'yyyy-MM-dd'),
  });
  const [dateError, setDateError] = useState('');
 
  useEffect(() => {
    if (!allTransactions) {
      setDateRange({
        start: format(monthStart, 'yyyy-MM-dd'),
        end: format(monthEnd, 'yyyy-MM-dd'),
      });
    }
  }, [monthStart, monthEnd, allTransactions]);
 
  const prev = useCallback(() => {
    setCurrentAccountIndex(i => (i > 0 ? i - 1 : accounts.length - 1));
  }, [accounts.length]);
 
  const next = useCallback(() => {
    setCurrentAccountIndex(i => (i < accounts.length - 1 ? i + 1 : 0));
  }, [accounts.length]);
 
  const currentAccount = currentAccountIndex === -1
    ? { id: 'all', name: 'Todas las cuentas', detail: 'Todas las cuentas' }
    : accounts[currentAccountIndex];

  const selectedAccountId = currentAccountIndex === -1 ? 'all' : currentAccount?.id || 'all';

  const handleAccountChange = useCallback((accountId: string) => {
    if (accountId === 'all') {
      setCurrentAccountIndex(-1);
    } else {
      const index = accounts.findIndex(a => a.id === accountId);
      if (index !== -1) {
        setCurrentAccountIndex(index);
      }
    }
  }, [accounts]);

  const accountTransactions = useMemo(() => {
    if (!currentAccount) return [];

    const filterStart = parseISO(dateRange.start);
    const filterEnd = parseISO(dateRange.end);
    const rangeValid =
      !isNaN(filterStart.getTime()) && !isNaN(filterEnd.getTime());

    return transactions
      .filter(t => {
        if (currentAccount.id !== 'all') {
          const isSource = t.accountId === currentAccount.id;
          const isDestination = t.type === 'transferencia' && t.toAccountId === currentAccount.id;
          if (!isSource && !isDestination) return false;
        }
        if (allTransactions || !rangeValid) return true;
        return isWithinInterval(parseISO(t.date), {
          start: filterStart,
          end: filterEnd,
        });
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentAccount, dateRange, allTransactions]);

  const totals = useMemo(() => {
    if (currentAccount.id === 'all') {
      return accountTransactions.reduce(
        (acc, t) => {
          if (t.type === 'entrada') acc.income += t.amount;
          if (t.type === 'salida') acc.expense += t.amount;
          return acc;
        },
        { income: 0, expense: 0 }
      );
    }

    return accountTransactions.reduce(
      (acc, t) => {
        if (t.type === 'entrada') {
          acc.income += t.amount;
        } else if (t.type === 'salida') {
          acc.expense += t.amount;
        } else if (t.type === 'transferencia') {
          if (t.accountId === currentAccount.id) {
            acc.expense += t.amount;
          } else {
            acc.income += t.amount;
          }
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [accountTransactions, currentAccount.id]);

  const activeDateLabel = (() => {
    if (allTransactions) return 'Todas las transacciones';
    const s = parseISO(dateRange.start);
    const e = parseISO(dateRange.end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Rango inválido';
    return `${format(s, 'd MMM', { locale: es })} – ${format(e, 'd MMM yyyy', { locale: es })}`;
  })();

  const applyDateFilter = useCallback(() => {
    const s = parseISO(dateRange.start);
    const e = parseISO(dateRange.end);
    if (!isValidDate(dateRange.start) || !isValidDate(dateRange.end)) {
      setDateError('Fecha inválida');
      return;
    }
    if (s > e) {
      setDateError('La fecha inicio debe ser menor que la fecha fin');
      return;
    }
    setDateError('');
    setShowFilters(false);
  }, [dateRange]);

  const handleToggleAll = useCallback((checked: boolean) => {
    setAllTransactions(checked);
    setDateError('');
  }, []);

  const handleDateChange = useCallback(
    (field: 'start' | 'end', value: string) => {
      setDateError(value && !isValidDate(value) ? 'Fecha inválida' : '');
      setDateRange(r => ({ ...r, [field]: value }));
    },
    []
  );

  const handlePreviousMonth = useCallback(() => {
    const prevMonth = subMonths(currentDate, 1);
    setSearchParams({ month: format(prevMonth, 'yyyy-MM') });
  }, [currentDate, setSearchParams]);

  const handleNextMonth = useCallback(() => {
    const nextMonth = addMonths(currentDate, 1);
    setSearchParams({ month: format(nextMonth, 'yyyy-MM') });
  }, [currentDate, setSearchParams]);

  return {
    // State
    accounts,
    labels,
    currentAccount,
    currentAccountIndex,
    showAccountMenu,
    showFilters,
    allTransactions,
    dateRange,
    dateError,
    activeDateLabel,
    selectedAccountId,
    // Derived
    accountTransactions,
    totals,
    // Actions
    prev,
    next,
    setCurrentAccountIndex,
    setShowAccountMenu,
    setShowFilters,
    setAllTransactions,
    setDateRange,
    setDateError,
    handleAccountChange,
    handleToggleAll,
    handleDateChange,
    applyDateFilter,
    handlePreviousMonth,
    handleNextMonth,
  };
}
