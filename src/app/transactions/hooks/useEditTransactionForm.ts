import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useData, type TransactionType } from '../../context';

export function useEditTransactionForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    accounts,
    labels,
    transferBetweenAccounts,
    adjustBalance,
  } = useData();

  const [type, setType] = useState<TransactionType>('salida');
  const [date, setDate] = useState('');
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (id) {
      const transaction = getTransactionById(id);
      if (transaction) {
        setType(transaction.type);
        setDate(transaction.date);
        setDetail(transaction.detail);
        setAmount(transaction.amount.toString());
        setAccountId(transaction.accountId);
        setToAccountId((transaction as any).toAccountId || '');
        setSelectedLabels(transaction.labels);
      } else {
        navigate('/');
      }
    }
  }, [id, getTransactionById, navigate]);

  const filteredLabels = useMemo(
    () =>
      labels.filter(label =>
        type === 'entrada' ? label.type === 'entrada' : label.type === 'salida'
      ),
    [labels, type]
  );

  const toggleLabel = useCallback((labelId: string) => {
    setSelectedLabels(prev => {
      if (prev.includes(labelId)) {
        return [];
      }
      return [labelId];
    });
  }, []);

  const goBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (type === 'transferencia') {
        if (!amount || !accountId || !toAccountId || !id) {
          alert('Por favor completa los campos de monto y ambas cuentas');
          return;
        }
        const transferAmount = parseFloat(amount);
        const oldTransaction = getTransactionById(id);

        if (oldTransaction?.type === 'transferencia' && oldTransaction.toAccountId) {
          adjustBalance(oldTransaction.accountId, oldTransaction.amount);
          adjustBalance(oldTransaction.toAccountId, -oldTransaction.amount);
        }

        updateTransaction(id, {
          type,
          date,
          detail,
          amount: transferAmount,
          accountId,
          toAccountId,
          labels: [],
        });
        transferBetweenAccounts(accountId, toAccountId, transferAmount);
      } else {
        if (!detail || !amount || !accountId || selectedLabels.length === 0 || !id) {
          alert('Por favor completa todos los campos y selecciona una etiqueta');
          return;
        }
        updateTransaction(id, {
          type,
          date,
          detail,
          amount: parseFloat(amount),
          accountId,
          labels: selectedLabels,
        });
      }

      navigate('/');
    },
    [
      type, date, detail, amount, accountId, toAccountId, selectedLabels, id,
      getTransactionById, updateTransaction, transferBetweenAccounts, adjustBalance, navigate,
    ]
  );

  const handleDelete = useCallback(() => {
    if (id) {
      deleteTransaction(id);
      navigate('/');
    }
  }, [id, deleteTransaction, navigate]);

  return {
    // State
    type,
    date,
    detail,
    amount,
    accountId,
    toAccountId,
    selectedLabels,
    showDeleteConfirm,
    // Derived
    filteredLabels,
    accounts,
    // Setters
    setType,
    setDate,
    setDetail,
    setAmount,
    setAccountId,
    setToAccountId,
    setShowDeleteConfirm,
    // Actions
    toggleLabel,
    handleSubmit,
    handleDelete,
    goBack,
  };
}
