import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useData, type TransactionType } from '../context';

export function EditTransaction() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTransactionById, updateTransaction, deleteTransaction, accounts, labels, transferBetweenAccounts, adjustBalance } = useData();
  
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

  const handleSubmit = (e: React.FormEvent) => {
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
        labels: []
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
        labels: selectedLabels
      });
    }

    navigate('/');
  };

  const handleDelete = () => {
    if (id) {
      deleteTransaction(id);
      navigate('/');
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => {
      if (prev.includes(labelId)) {
        return [];
      } else {
        return [labelId];
      }
    });
  };

  const filteredLabels = labels.filter(label => 
    type === 'entrada' ? label.type === 'entrada' : label.type === 'salida'
  );

  const getTypeButtonClass = (buttonType: TransactionType) => {
    const baseClass = 'py-1.5 px-2 text-sm rounded-md font-medium transition-colors';
    if (type === buttonType) {
      switch (buttonType) {
        case 'entrada':
          return `${baseClass} bg-green-600 text-white dark:bg-green-500`;
        case 'salida':
          return `${baseClass} bg-red-600 text-white dark:bg-red-500`;
        case 'transferencia':
          return `${baseClass} bg-blue-600 text-white dark:bg-blue-500`;
      }
    }
    return `${baseClass} flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700`;
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'entrada':
        return 'bg-green-50/30 dark:bg-green-950/10';
      case 'salida':
        return 'bg-red-50/30 dark:bg-red-950/10';
      case 'transferencia':
        return 'bg-blue-50/30 dark:bg-blue-950/10';
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors ${getBackgroundColor()}`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate('/')}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="font-medium flex-1">Editar Transacción</h2>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-auto px-4 py-3">
        <div className="space-y-3 max-w-md mx-auto">
          {/* Type Selection */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Tipo de Transacción
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('entrada')}
                className={getTypeButtonClass('entrada')}
              >
                Entrada
              </button>
              <button
                type="button"
                onClick={() => setType('salida')}
                className={getTypeButtonClass('salida')}
              >
                Salida
              </button>
              <button
                type="button"
                onClick={() => setType('transferencia')}
                className={getTypeButtonClass('transferencia')}
              >
                Transferencia
              </button>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Fecha
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              required
            />
          </div>

          {/* Detail */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Detalle {type === 'transferencia' && '(opcional)'}
            </label>
            <input
              type="text"
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              placeholder={type === 'transferencia' ? 'Descripción de la transferencia' : 'Descripción de la transacción'}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              required={type !== 'transferencia'}
            />
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Monto
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                $
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                required
              />
            </div>
          </div>

          {/* Account */}
          {type !== 'transferencia' && (
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Cuenta
            </label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
              required
            >
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>
          )}

          {type === 'transferencia' && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
                Cuenta Origen
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                required
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
                Cuenta Destino
              </label>
              <select
                value={toAccountId}
                onChange={(e) => setToAccountId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
                required
              >
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          )}

          {/* Label */}
          {type !== 'transferencia' && (
          <div>
            <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
              Etiqueta
            </label>
            <div className="flex flex-wrap gap-1.5">
              {filteredLabels.map(label => {
                const isSelected = selectedLabels.includes(label.id);
                return (
                  <button
                    key={label.id}
                    type="button"
                    onClick={() => toggleLabel(label.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2 ${
                      isSelected 
                        ? 'border-gray-900 dark:border-white scale-105 shadow-md' 
                        : 'border-transparent opacity-50 hover:opacity-75'
                    }`}
                    style={{ 
                      backgroundColor: isSelected ? label.color : `${label.color}40`,
                      color: isSelected ? 'white' : label.color
                    }}
                  >
                    {label.name}
                  </button>
                );
              })}
            </div>
            {filteredLabels.length === 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                No hay etiquetas de {type === 'entrada' ? 'ingreso' : 'egreso'}. Crea etiquetas en Configuración.
              </p>
            )}
          </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 mt-4 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            <Save className="w-5 h-5" />
            Guardar Cambios
          </button>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Eliminar Transacción</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}