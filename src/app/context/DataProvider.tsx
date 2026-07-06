import React, { createContext, useState, useEffect } from 'react';
import { DataContextType } from './types';
import { useTransactions, useAccounts, useLabels, useSpendingLimits } from './hooks';
import { INITIAL_ACCOUNTS, INITIAL_LABELS, INITIAL_TRANSACTIONS, INITIAL_SPENDING_LIMITS } from './initialState';
import { transactionRepo, accountRepo, labelRepo, spendingLimitRepo, userSettingsRepo, clearStore } from '../../services/db';
import type { Transaction, Account, Label, SpendingLimit, UserSettings } from './types';

export const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [spendingLimits, setSpendingLimits] = useState<SpendingLimit[]>([]);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadFromDB() {
      try {
        const [
          storedTransactions,
          storedAccounts,
          storedLabels,
          storedSpendingLimits,
          storedUserSettings,
        ] = await Promise.all([
          transactionRepo.getAll(),
          accountRepo.getAll(),
          labelRepo.getAll(),
          spendingLimitRepo.getAll(),
          userSettingsRepo.getAll(),
        ]);

        if (cancelled) return;

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
          const sorted = [...storedTransactions].sort(
            (a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime()
          );
          if (!cancelled) {
            setTransactions(sorted);
            setAccounts(storedAccounts);
            setLabels(storedLabels);
            setSpendingLimits(storedSpendingLimits);
          }
        }

        if (!cancelled && storedUserSettings.length > 0) {
          setUserSettings(storedUserSettings[0]);
        }
      } catch (err) {
        console.error('[DataProvider] Error cargando datos desde IndexedDB:', err);
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
    await Promise.all([
      clearStore('transactions'),
      clearStore('accounts'),
      clearStore('labels'),
      clearStore('spendingLimits'),
    ]);

    await Promise.all([
      transactionRepo.putMany(backupData.transactions),
      accountRepo.putMany(backupData.accounts),
      labelRepo.putMany(backupData.labels),
      spendingLimitRepo.putMany(backupData.spendingLimits),
    ]);

    const sorted = [...backupData.transactions].sort(
      (a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime()
    );
    setTransactions(sorted);
    setAccounts(backupData.accounts);
    setLabels(backupData.labels);
    setSpendingLimits(backupData.spendingLimits);
  };

  const saveUserSettings = async (settings: Omit<UserSettings, 'id'>) => {
    const existing = userSettings;
    const id = existing?.id ?? crypto.randomUUID();
    const updated: UserSettings = { ...settings, id };
    await userSettingsRepo.put(updated);
    setUserSettings(updated);
  };

  const deleteUserSettings = async () => {
    if (userSettings) {
      await userSettingsRepo.remove(userSettings.id);
      setUserSettings(null);
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [
        storedTransactions,
        storedAccounts,
        storedLabels,
        storedSpendingLimits,
      ] = await Promise.all([
        transactionRepo.getAll(),
        accountRepo.getAll(),
        labelRepo.getAll(),
        spendingLimitRepo.getAll(),
      ]);

      const sorted = [...storedTransactions].sort(
        (a, b) => new Date(`${b.date}T${b.time || '00:00'}`).getTime() - new Date(`${a.date}T${a.time || '00:00'}`).getTime()
      );
      setTransactions(sorted);
      setAccounts(storedAccounts);
      setLabels(storedLabels);
      setSpendingLimits(storedSpendingLimits);
    } catch (err) {
      console.error('[DataProvider] Error refrescando datos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const value: DataContextType = {
    isLoading,
    ...transactionsHook,
    ...accountsHook,
    ...labelsHook,
    ...spendingLimitsHook,
    importBackup,
    userSettings,
    saveUserSettings,
    deleteUserSettings,
    refreshData,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}