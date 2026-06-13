import { useState, useCallback } from 'react';
import { useData, type SpendingLimit } from '../../context';

export function useConfigLimits() {
  const { spendingLimits, addSpendingLimit, updateSpendingLimit, deleteSpendingLimit } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [enabled, setEnabled] = useState(true);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setTitle('');
    setAmount('');
    const hasActive = spendingLimits.some(limit => limit.enabled);
    setEnabled(!hasActive);
    setShowForm(true);
  }, [spendingLimits]);

  const openEdit = useCallback((limit: SpendingLimit) => {
    setEditingId(limit.id);
    setTitle(limit.title);
    setAmount(limit.amount.toString());
    setEnabled(limit.enabled);
    setShowForm(true);
  }, []);

  const close = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setAmount('');
    const hasActive = spendingLimits.some(limit => limit.enabled);
    setEnabled(!hasActive);
  }, [spendingLimits]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!title) {
        alert('Por favor ingresa el título del límite');
        return;
      }
      if (!amount) {
        alert('Por favor ingresa el monto del límite');
        return;
      }
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
      }
      if (editingId) {
        updateSpendingLimit(editingId, { title, amount: parsed, enabled });
      } else {
        addSpendingLimit({ title, amount: parsed, enabled });
      }
      close();
    },
    [title, amount, enabled, editingId, updateSpendingLimit, addSpendingLimit, close]
  );

  const hasAnotherActive = spendingLimits.some(limit => limit.enabled && limit.id !== editingId);

  return {
    spendingLimits,
    showForm,
    editingId,
    title,
    amount,
    enabled,
    hasAnotherActive,
    setTitle,
    setAmount,
    setEnabled,
    openAdd,
    openEdit,
    close,
    handleSubmit,
  };
}
