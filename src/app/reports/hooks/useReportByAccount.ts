import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useData } from '../../context';
import { isValidDate } from '../utils/reportValidators';

export function useReportByAccount() {
  const [searchParams] = useSearchParams();
  const { transactions, accounts, labels } = useData();

  const monthParam = searchParams.get('month');
  const currentDate = monthParam ? new Date(monthParam + '-01') : new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [allTransactions, setAllTransactions] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(monthStart, 'yyyy-MM-dd'),
    end: format(monthEnd, 'yyyy-MM-dd'),
  });
  const [dateError, setDateError] = useState('');

  const prev = useCallback(() => {
    setCurrentAccountIndex(i => (i > 0 ? i - 1 : accounts.length - 1));
  }, [accounts.length]);

  const next = useCallback(() => {
    setCurrentAccountIndex(i => (i < accounts.length - 1 ? i + 1 : 0));
  }, [accounts.length]);

  const currentAccount = accounts[currentAccountIndex];

  const accountTransactions = useMemo(() => {
    if (!currentAccount) return [];

    const filterStart = parseISO(dateRange.start);
    const filterEnd = parseISO(dateRange.end);
    const rangeValid =
      !isNaN(filterStart.getTime()) && !isNaN(filterEnd.getTime());

    return transactions
      .filter(t => {
        if (t.accountId !== currentAccount.id) return false;
        if (allTransactions || !rangeValid) return true;
        return isWithinInterval(parseISO(t.date), {
          start: filterStart,
          end: filterEnd,
        });
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentAccount, dateRange, allTransactions]);

  const totals = useMemo(
    () =>
      accountTransactions.reduce(
        (acc, t) => {
          if (t.type === 'entrada') acc.income += t.amount;
          if (t.type === 'salida') acc.expense += t.amount;
          return acc;
        },
        { income: 0, expense: 0 }
      ),
    [accountTransactions]
  );

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
    setShowDateFilter(false);
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

  return {
    // State
    accounts,
    labels,
    currentAccount,
    currentAccountIndex,
    showAccountMenu,
    showDateFilter,
    allTransactions,
    dateRange,
    dateError,
    activeDateLabel,
    // Derived
    accountTransactions,
    totals,
    // Actions
    prev,
    next,
    setCurrentAccountIndex,
    setShowAccountMenu,
    setShowDateFilter,
    setAllTransactions,
    setDateRange,
    setDateError,
    handleToggleAll,
    handleDateChange,
    applyDateFilter,
  };
}
