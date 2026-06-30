import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useData, type TransactionType } from '../../context';

export const TRANSACTION_TYPES: TransactionType[] = ['entrada', 'salida', 'transferencia'];

export function useTransactionForm() {
  const navigate = useNavigate();
  const { addTransaction, accounts, labels, transferBetweenAccounts } = useData();

  const [type, setType] = useState<TransactionType>('salida');
  const getLocalDateString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [date, setDate] = useState(getLocalDateString());
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  });
  const [detail, setDetail] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [toAccountId, setToAccountId] = useState(accounts[1]?.id || '');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

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

    if (type !== 'transferencia') {
      const selectedLabel = filteredLabels.find(l => l.id === labelId);
      if (selectedLabel) {
        const capitalizedName = selectedLabel.name.charAt(0).toUpperCase() + selectedLabel.name.slice(1);
        const isDetailEmpty = detail.trim() === '';
        const matchesAnyLabel = filteredLabels.some(
          l => l.name.toLowerCase() === detail.trim().toLowerCase()
        );

        if (isDetailEmpty || matchesAnyLabel) {
          setDetail(capitalizedName);
        }
      }
    }
  }, [type, detail, filteredLabels, setDetail]);

  const cycleType = useCallback((direction: 'left' | 'right') => {
    setType(prev => {
      const idx = TRANSACTION_TYPES.indexOf(prev);
      if (direction === 'left') {
        return TRANSACTION_TYPES[(idx + 1) % 3];
      }
      return TRANSACTION_TYPES[(idx - 1 + 3) % 3];
    });
  }, []);

  const goBack = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (type === 'transferencia') {
        if (!amount || !accountId || !toAccountId) {
          alert('Por favor completa los campos de monto y ambas cuentas');
          return;
        }
        const transferAmount = parseFloat(amount);
        addTransaction({
          type,
          date,
          time,
          detail,
          amount: transferAmount,
          accountId,
          toAccountId,
          labels: [],
        });
        transferBetweenAccounts(accountId, toAccountId, transferAmount);
      } else {
        if (!detail || !amount || !accountId) {
          alert('Por favor completa todos los campos');
          return;
        }
        addTransaction({
          type,
          date,
          time,
          detail,
          amount: parseFloat(amount),
          accountId,
          labels: selectedLabels,
        });
      }

      navigate('/');
    },
    [type, date, time, detail, amount, accountId, toAccountId, selectedLabels, addTransaction, transferBetweenAccounts, navigate]
  );

  return {
    // State
    type,
    date,
    time,
    detail,
    amount,
    accountId,
    toAccountId,
    selectedLabels,
    // Derived
    filteredLabels,
    accounts,
    // Setters
    setType,
    setDate,
    setTime,
    setDetail,
    setAmount,
    setAccountId,
    setToAccountId,
    // Actions
    toggleLabel,
    cycleType,
    handleSubmit,
    goBack,
  };
}
