import { useState, useCallback } from 'react';
import { useData, type Account } from '../../context';

export function useConfigAccounts() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [detail, setDetail] = useState('');

  const openAdd = useCallback(() => {
    setEditingId(null);
    setName('');
    setDetail('');
    setShowForm(true);
  }, []);

  const openEdit = useCallback((account: Account) => {
    setEditingId(account.id);
    setName(account.name);
    setDetail(account.detail);
    setShowForm(true);
  }, []);

  const close = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setDetail('');
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) {
        alert('Por favor ingresa el nombre de la cuenta');
        return;
      }
      if (editingId) {
        updateAccount(editingId, {
          name,
          detail,
          balance: accounts.find(a => a.id === editingId)?.balance || 0,
        });
      } else {
        addAccount({ name, detail, balance: 0 });
      }
      close();
    },
    [name, detail, editingId, accounts, updateAccount, addAccount, close]
  );

  return {
    accounts,
    showForm,
    editingId,
    name,
    detail,
    setName,
    setDetail,
    openAdd,
    openEdit,
    close,
    handleSubmit,
  };
}
