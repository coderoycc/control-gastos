import { useState, useMemo, useCallback } from 'react';
import { useData } from '../../context';

export function useAccountFlow() {
  const { transactions, accounts, labels } = useData();

  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const currentAccount = currentAccountIndex === -1
    ? { id: 'all', name: 'Todas las cuentas', detail: 'Todas las cuentas' }
    : accounts[currentAccountIndex];

  const prev = useCallback(() => {
    setCurrentAccountIndex(i => {
      const base = i === -1 ? accounts.length - 1 : i > 0 ? i - 1 : accounts.length - 1;
      return base;
    });
  }, [accounts.length]);

  const next = useCallback(() => {
    setCurrentAccountIndex(i => {
      const base = i === -1 ? 0 : i < accounts.length - 1 ? i + 1 : 0;
      return base;
    });
  }, [accounts.length]);

  const accountTransactions = useMemo(() => {
    if (!currentAccount) return [];

    return transactions
      .filter(t => {
        if (currentAccount.id === 'all') return true;
        const isSource = t.accountId === currentAccount.id;
        const isDestination = t.type === 'transferencia' && t.toAccountId === currentAccount.id;
        return isSource || isDestination;
      })
      .sort((a, b) => {
        const diff = new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime();
        return sortOrder === 'desc' ? diff : -diff;
      });
  }, [transactions, currentAccount, sortOrder]);

  const totals = useMemo(() => {
    if (currentAccount.id === 'all') {
      // In "all accounts" mode, transfers move money between own accounts so they
      // cancel each other out for the net balance. We only count real income/expense.
      return accountTransactions.reduce(
        (acc, t) => {
          if (t.type === 'entrada') acc.income += t.amount;
          if (t.type === 'salida') acc.expense += t.amount;
          // transferencias: not counted in net totals for "all accounts" view
          return acc;
        },
        { income: 0, expense: 0 }
      );
    }

    // For a specific account: origin side = expense, destination side = income
    return accountTransactions.reduce(
      (acc, t) => {
        if (t.type === 'entrada') {
          acc.income += t.amount;
        } else if (t.type === 'salida') {
          acc.expense += t.amount;
        } else if (t.type === 'transferencia') {
          // accountId is the origin → money leaves → expense
          if (t.accountId === currentAccount.id) {
            acc.expense += t.amount;
          }
          // toAccountId is the destination → money arrives → income
          if (t.toAccountId === currentAccount.id) {
            acc.income += t.amount;
          }
        }
        return acc;
      },
      { income: 0, expense: 0 }
    );
  }, [accountTransactions, currentAccount.id]);

  const handleSortOrderChange = useCallback((order: 'asc' | 'desc') => {
    setSortOrder(order);
  }, []);

  return {
    accounts,
    labels,
    currentAccount,
    currentAccountIndex,
    showAccountMenu,
    accountTransactions,
    totals,
    sortOrder,
    prev,
    next,
    setCurrentAccountIndex,
    setShowAccountMenu,
    handleSortOrderChange,
  };
}
