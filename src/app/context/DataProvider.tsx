import React, { createContext, useState } from 'react';
import { DataContextType } from './types';
import { useTransactions, useAccounts, useLabels, useSpendingLimits } from './hooks';
import { INITIAL_ACCOUNTS, INITIAL_LABELS, INITIAL_TRANSACTIONS, INITIAL_SPENDING_LIMITS } from './initialState';

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState(() => INITIAL_ACCOUNTS);
  const [labels, setLabels] = useState(() => INITIAL_LABELS);
  const [transactions, setTransactions] = useState(() => INITIAL_TRANSACTIONS);
  const [spendingLimits, setSpendingLimits] = useState(() => INITIAL_SPENDING_LIMITS);

  const transactionsHook = useTransactions(transactions, setTransactions);
  const accountsHook = useAccounts(accounts, setAccounts);
  const labelsHook = useLabels(labels, setLabels);
  const spendingLimitsHook = useSpendingLimits(spendingLimits, setSpendingLimits);

  const value: DataContextType = {
    ...transactionsHook,
    ...accountsHook,
    ...labelsHook,
    ...spendingLimitsHook
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}