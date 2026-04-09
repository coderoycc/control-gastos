// src/app/context/hooks/useAccounts.ts

import { useCallback } from 'react';
import { Account } from '../types';

export function useAccounts(
  accounts: Account[],
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>
) {
  const addAccount = useCallback(
    (account: Omit<Account, 'id'>) => {
      const newAccount = {
        ...account,
        id: Date.now().toString()
      };
      setAccounts(prev => [...prev, newAccount]);
    },
    [setAccounts]
  );

  const updateAccount = useCallback(
    (id: string, account: Omit<Account, 'id'>) => {
      setAccounts(prev =>
        prev.map(a => a.id === id ? { ...account, id } : a)
      );
    },
    [setAccounts]
  );

  const deleteAccount = useCallback(
    (id: string) => {
      setAccounts(prev => prev.filter(a => a.id !== id));
    },
    [setAccounts]
  );

  const getAccountById = useCallback(
    (id: string) => {
      return accounts.find(a => a.id === id);
    },
    [accounts]
  );

  const adjustBalance = useCallback(
    (accountId: string, amount: number) => {
      setAccounts(prev =>
        prev.map(a => a.id === accountId ? { ...a, balance: a.balance + amount } : a)
      );
    },
    [setAccounts]
  );

  const transferBetweenAccounts = useCallback(
    (fromAccountId: string, toAccountId: string, amount: number) => {
      setAccounts(prev =>
        prev.map(a => {
          if (a.id === fromAccountId) {
            return { ...a, balance: a.balance - amount };
          }
          if (a.id === toAccountId) {
            return { ...a, balance: a.balance + amount };
          }
          return a;
        })
      );
    },
    [setAccounts]
  );

  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccountById,
    adjustBalance,
    transferBetweenAccounts
  };
}