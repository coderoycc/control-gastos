import React, { createContext, useState, useEffect } from 'react';
import { DataContextType } from './types';
import { useTransactions, useAccounts, useLabels, useSpendingLimits } from './hooks';
import { INITIAL_ACCOUNTS, INITIAL_LABELS, INITIAL_TRANSACTIONS, INITIAL_SPENDING_LIMITS } from './initialState';
import { transactionRepo, accountRepo, labelRepo, spendingLimitRepo, clearStore } from '../../services/db';
import type { Transaction, Account, Label, SpendingLimit } from './types';

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendingLimits, setSpendingLimits] = useState<SpendingLimit[]>([]);

  // Carga inicial desde IndexedDB (solo al montar)
  useEffect(() => {
    let cancelled = false;

    async function loadFromDB() {
      try {
        const [
          storedTransactions,
          storedAccounts,
          storedLabels,
          storedSpendingLimits
        ] = await Promise.all([
          transactionRepo.getAll(),
          accountRepo.getAll(),
          labelRepo.getAll(),
          spendingLimitRepo.getAll(),
        ]);

        if (cancelled) return;

        // Si no hay cuentas, es la primera vez que se abre la app → seed con datos iniciales
        const isEmpty = storedAccounts.length === 0;

        if (isEmpty) {
          await Promise.all([
            transactionRepo.putMany(INITIAL_TRANSACTIONS),
            accountRepo.putMany(INITIAL_ACCOUNTS),
            labelRepo.putMany(INITIAL_LABELS),
            spendingLimitRepo.putMany(INITIAL_SPENDING_LIMITS),
          ]);
          if (!cancelled) {
            setTransactions(INITIAL_TRANSACTIONS);
            setAccounts(INITIAL_ACCOUNTS);
            setLabels(INITIAL_LABELS);
            setSpendingLimits(INITIAL_SPENDING_LIMITS);
          }
        } else {
          // Ordenar transacciones por fecha descendente (igual que el initialState)
          const sorted = [...storedTransactions].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          if (!cancelled) {
            setTransactions(sorted);
            setAccounts(storedAccounts);
            setLabels(storedLabels);
            setSpendingLimits(storedSpendingLimits);
          }
        }
      } catch (err) {
        console.error('[DataProvider] Error cargando datos desde IndexedDB:', err);
        // Fallback: usar datos del initialState si falla la BD
        if (!cancelled) {
          setTransactions(INITIAL_TRANSACTIONS);
          setAccounts(INITIAL_ACCOUNTS);
          setLabels(INITIAL_LABELS);
          setSpendingLimits(INITIAL_SPENDING_LIMITS);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadFromDB();

    return () => { cancelled = true; };
  }, []);

  const transactionsHook = useTransactions(transactions, setTransactions);
  const accountsHook = useAccounts(accounts, setAccounts);
  const labelsHook = useLabels(labels, setLabels);
  const spendingLimitsHook = useSpendingLimits(spendingLimits, setSpendingLimits);

  const importBackup = async (backupData: {
    transactions: Transaction[];
    accounts: Account[];
    labels: Label[];
    spendingLimits: SpendingLimit[];
  }) => {
    // 1. Limpiar todos los stores de IndexedDB
    await Promise.all([
      clearStore('transactions'),
      clearStore('accounts'),
      clearStore('labels'),
      clearStore('spendingLimits'),
    ]);

    // 2. Persistir los nuevos datos en IndexedDB
    await Promise.all([
      transactionRepo.putMany(backupData.transactions),
      accountRepo.putMany(backupData.accounts),
      labelRepo.putMany(backupData.labels),
      spendingLimitRepo.putMany(backupData.spendingLimits),
    ]);

    // 3. Actualizar el estado local de React
    const sorted = [...backupData.transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setTransactions(sorted);
    setAccounts(backupData.accounts);
    setLabels(backupData.labels);
    setSpendingLimits(backupData.spendingLimits);
  };

  const value: DataContextType = {
    isLoading,
    ...transactionsHook,
    ...accountsHook,
    ...labelsHook,
    ...spendingLimitsHook,
    importBackup,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}