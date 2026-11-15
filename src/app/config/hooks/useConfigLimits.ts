import { useState, useCallback, useMemo } from 'react';
import { useData, type SpendingLimit } from '../../context';

export function useConfigLimits() {
  const { spendingLimits, accounts, addSpendingLimit, updateSpendingLimit, deleteSpendingLimit } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [accountId, setAccountId] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(true);

  // Mapeo rápido de cuentas para mostrar nombres
  const accountMap = useMemo(() => {
    return new Map(accounts.map((a) => [a.id, a.name]));
  }, [accounts]);

  const openAdd = useCallback(() => {
    setEditingId(null);
    setTitle('');
    setAmount('');
    setAccountId(null);

    // Por defecto, habilitar si no hay otro límite global activo
    const hasActiveGlobal = spendingLimits.some((l) => l.enabled && !l.accountId);
    setEnabled(!hasActiveGlobal);
    setShowForm(true);
  }, [spendingLimits]);

  const openEdit = useCallback((limit: SpendingLimit) => {
    setEditingId(limit.id);
    setTitle(limit.title);
    setAmount(limit.amount.toString());
    setAccountId(limit.accountId ?? null);
    setEnabled(limit.enabled);
    setShowForm(true);
  }, []);

  const close = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setTitle('');
    setAmount('');
    setAccountId(null);
    setEnabled(true);
  }, []);

  // Verifica si ya existe otro límite ACTIVO en el mismo scope (misma cuenta o ambos globales)
  const hasAnotherActiveInScope = useMemo(() => {
    const targetScope = accountId || null;
    return spendingLimits.some((l) => {
      if (l.id === editingId || !l.enabled) return false;
      const currentScope = l.accountId || null;
      return currentScope === targetScope;
    });
  }, [spendingLimits, editingId, accountId]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        alert('Por favor ingresa el título del límite');
        return;
      }
      if (!amount) {
        alert('Por favor ingresa el monto del límite');
        return;
      }
      const parsed = parseFloat(amount);
      if (isNaN(parsed) || parsed <= 0) {
        alert('Por favor ingresa un monto válido mayor a 0');
        return;
      }

      const limitData: Omit<SpendingLimit, 'id'> = {
        title: trimmedTitle,
        amount: parsed,
        enabled,
        accountId: accountId || null,
      };

      if (editingId) {
        await updateSpendingLimit(editingId, limitData);
      } else {
        await addSpendingLimit(limitData);
      }
      close();
    },
    [title, amount, enabled, accountId, editingId, updateSpendingLimit, addSpendingLimit, close]
  );

  return {
    spendingLimits,
    accounts,
    accountMap,
    showForm,
    editingId,
    title,
    amount,
    accountId,
    enabled,
    hasAnotherActiveInScope,
    setTitle,
    setAmount,
    setAccountId,
    setEnabled,
    openAdd,
    openEdit,
    close,
    handleSubmit,
  };
}
