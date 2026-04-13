import { useCallback } from 'react';
import { Transaction } from '../types';

export function useTransactions(
  transactions: Transaction[],
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>
) {
  const addTransaction = useCallback(
    (transaction: Omit<Transaction, 'id'>) => {
      const newTransaction = {
        ...transaction,
        id: Date.now().toString()
      };
      setTransactions(prev => [newTransaction, ...prev]);
    },
    [setTransactions]
  );

  const updateTransaction = useCallback(
    (id: string, transaction: Omit<Transaction, 'id'>) => {
      setTransactions(prev =>
        prev.map(t => t.id === id ? { ...transaction, id } : t)
      );
    },
    [setTransactions]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
    },
    [setTransactions]
  );

  const getTransactionById = useCallback(
    (id: string) => {
      return transactions.find(t => t.id === id);
    },
    [transactions]
  );

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionById
  };
}