import React, { createContext, useContext, useState } from 'react';

export type TransactionType = 'entrada' | 'salida' | 'transferencia';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  detail: string;
  amount: number;
  accountId: string;
  labels: string[]; // Changed to array
}

export interface Account {
  id: string;
  name: string;
  detail: string;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface SpendingLimit {
  id: string;
  title: string;
  amount: number;
  enabled: boolean;
}

interface DataContextType {
  transactions: Transaction[];
  accounts: Account[];
  labels: Label[];
  spendingLimits: SpendingLimit[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  updateAccount: (id: string, account: Omit<Account, 'id'>) => void;
  deleteAccount: (id: string) => void;
  addLabel: (label: Omit<Label, 'id'>) => void;
  updateLabel: (id: string, label: Omit<Label, 'id'>) => void;
  deleteLabel: (id: string) => void;
  addSpendingLimit: (limit: Omit<SpendingLimit, 'id'>) => void;
  updateSpendingLimit: (id: string, limit: Omit<SpendingLimit, 'id'>) => void;
  deleteSpendingLimit: (id: string) => void;
  getTransactionById: (id: string) => Transaction | undefined;
  getAccountById: (id: string) => Account | undefined;
  getLabelById: (id: string) => Label | undefined;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Cuenta Personal', detail: 'Cuenta principal' },
    { id: '2', name: 'Ahorros', detail: 'Cuenta de ahorros' },
  ]);

  const [labels, setLabels] = useState<Label[]>([
    { id: '1', name: 'Alimentación', color: '#10b981' },
    { id: '2', name: 'Servicios', color: '#f59e0b' },
    { id: '3', name: 'Transporte', color: '#3b82f6' },
    { id: '4', name: 'Ingreso', color: '#8b5cf6' },
    { id: '5', name: 'Ahorro', color: '#ec4899' },
    { id: '6', name: 'Entretenimiento', color: '#14b8a6' },
  ]);

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      type: 'entrada',
      date: '2026-03-01',
      detail: 'Salario',
      amount: 3500,
      accountId: '1',
      labels: ['4']
    },
    {
      id: '2',
      type: 'salida',
      date: '2026-03-05',
      detail: 'Supermercado',
      amount: 150,
      accountId: '1',
      labels: ['1']
    },
    {
      id: '3',
      type: 'salida',
      date: '2026-03-08',
      detail: 'Electricidad',
      amount: 80,
      accountId: '1',
      labels: ['2']
    },
    {
      id: '4',
      type: 'transferencia',
      date: '2026-03-10',
      detail: 'Ahorro mensual',
      amount: 500,
      accountId: '2',
      labels: ['5']
    },
  ]);

  const [spendingLimits, setSpendingLimits] = useState<SpendingLimit[]>([
    {
      id: '1',
      title: 'Límite Mensual',
      amount: 2000,
      enabled: true
    },
    {
      id: '2',
      title: 'Límite Semanal',
      amount: 500,
      enabled: false
    }
  ]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString()
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, transaction: Omit<Transaction, 'id'>) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...transaction, id } : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = {
      ...account,
      id: Date.now().toString()
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const updateAccount = (id: string, account: Omit<Account, 'id'>) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...account, id } : a));
  };

  const deleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const addLabel = (label: Omit<Label, 'id'>) => {
    const newLabel = {
      ...label,
      id: Date.now().toString()
    };
    setLabels(prev => [...prev, newLabel]);
  };

  const updateLabel = (id: string, label: Omit<Label, 'id'>) => {
    setLabels(prev => prev.map(l => l.id === id ? { ...label, id } : l));
  };

  const deleteLabel = (id: string) => {
    setLabels(prev => prev.filter(l => l.id !== id));
  };

  const addSpendingLimit = (limit: Omit<SpendingLimit, 'id'>) => {
    const newLimit = {
      ...limit,
      id: Date.now().toString()
    };
    // If the new limit is enabled, disable all others
    if (newLimit.enabled) {
      setSpendingLimits(prev => [...prev.map(l => ({ ...l, enabled: false })), newLimit]);
    } else {
      setSpendingLimits(prev => [...prev, newLimit]);
    }
  };

  const updateSpendingLimit = (id: string, limit: Omit<SpendingLimit, 'id'>) => {
    // If enabling this limit, disable all others
    if (limit.enabled) {
      setSpendingLimits(prev => prev.map(l => 
        l.id === id ? { ...limit, id } : { ...l, enabled: false }
      ));
    } else {
      setSpendingLimits(prev => prev.map(l => l.id === id ? { ...limit, id } : l));
    }
  };

  const deleteSpendingLimit = (id: string) => {
    setSpendingLimits(prev => prev.filter(l => l.id !== id));
  };

  const getTransactionById = (id: string) => {
    return transactions.find(t => t.id === id);
  };

  const getAccountById = (id: string) => {
    return accounts.find(a => a.id === id);
  };

  const getLabelById = (id: string) => {
    return labels.find(l => l.id === id);
  };

  return (
    <DataContext.Provider value={{
      transactions,
      accounts,
      labels,
      spendingLimits,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addAccount,
      updateAccount,
      deleteAccount,
      addLabel,
      updateLabel,
      deleteLabel,
      addSpendingLimit,
      updateSpendingLimit,
      deleteSpendingLimit,
      getTransactionById,
      getAccountById,
      getLabelById
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
}