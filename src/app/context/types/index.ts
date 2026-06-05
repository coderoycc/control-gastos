// src/app/context/types/index.ts

export type TransactionType = 'entrada' | 'salida' | 'transferencia';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string;
  detail: string;
  amount: number;
  accountId: string;
  toAccountId?: string;
  labels: string[];
}

export interface Account {
  id: string;
  name: string;
  detail: string;
  balance: number;
}

export type LabelType = 'entrada' | 'salida';

export interface Label {
  id: string;
  name: string;
  color: string;
  type: LabelType;
}

export interface SpendingLimit {
  id: string;
  title: string;
  amount: number;
  enabled: boolean;
}

export interface DataContextType {
  isLoading: boolean;
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
  adjustBalance: (accountId: string, amount: number) => void;
  transferBetweenAccounts: (fromAccountId: string, toAccountId: string, amount: number) => void;
  importBackup: (backupData: {
    transactions: Transaction[];
    accounts: Account[];
    labels: Label[];
    spendingLimits: SpendingLimit[];
  }) => Promise<void>;
}