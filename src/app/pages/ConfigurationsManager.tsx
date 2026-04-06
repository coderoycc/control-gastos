import { useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, DollarSign } from 'lucide-react';
import { useData, type Account, type Label, type SpendingLimit } from '../context/DataContext';

const PRESET_COLORS = [
  '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', 
  '#ec4899', '#14b8a6', '#ef4444', '#06b6d4',
  '#84cc16', '#f97316', '#6366f1', '#a855f7'
];

export function ConfigurationsManager() {
  const { 
    accounts, addAccount, updateAccount, deleteAccount,
    labels, addLabel, updateLabel, deleteLabel,
    spendingLimits, addSpendingLimit, updateSpendingLimit, deleteSpendingLimit
  } = useData();
  
  const [activeTab, setActiveTab] = useState<'accounts' | 'labels' | 'limits'>('accounts');
  
  // Account states
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [accountName, setAccountName] = useState('');
  const [accountDetail, setAccountDetail] = useState('');
  
  // Label states
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelName, setLabelName] = useState('');
  const [labelColor, setLabelColor] = useState(PRESET_COLORS[0]);
  
  // Spending Limit states
  const [showLimitForm, setShowLimitForm] = useState(false);
  const [editingLimitId, setEditingLimitId] = useState<string | null>(null);
  const [limitTitle, setLimitTitle] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [limitEnabled, setLimitEnabled] = useState(true);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: 'account' | 'label' | 'limit', id: string } | null>(null);

  // Account handlers
  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountName) {
      alert('Por favor ingresa el nombre de la cuenta');
      return;
    }

    if (editingAccountId) {
      updateAccount(editingAccountId, { name: accountName, detail: accountDetail });
      setEditingAccountId(null);
    } else {
      addAccount({ name: accountName, detail: accountDetail });
    }

    setAccountName('');
    setAccountDetail('');
    setShowAccountForm(false);
  };

  const handleEditAccount = (account: Account) => {
    setEditingAccountId(account.id);
    setAccountName(account.name);
    setAccountDetail(account.detail);
    setShowAccountForm(true);
  };

  const handleCancelAccount = () => {
    setShowAccountForm(false);
    setEditingAccountId(null);
    setAccountName('');
    setAccountDetail('');
  };

  // Label handlers
  const handleLabelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!labelName) {
      alert('Por favor ingresa el nombre de la etiqueta');
      return;
    }

    if (editingLabelId) {
      updateLabel(editingLabelId, { name: labelName, color: labelColor });
      setEditingLabelId(null);
    } else {
      addLabel({ name: labelName, color: labelColor });
    }

    setLabelName('');
    setLabelColor(PRESET_COLORS[0]);
    setShowLabelForm(false);
  };

  const handleEditLabel = (label: Label) => {
    setEditingLabelId(label.id);
    setLabelName(label.name);
    setLabelColor(label.color);
    setShowLabelForm(true);
  };

  const handleCancelLabel = () => {
    setShowLabelForm(false);
    setEditingLabelId(null);
    setLabelName('');
    setLabelColor(PRESET_COLORS[0]);
  };

  // Spending Limit handlers
  const handleLimitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!limitTitle) {
      alert('Por favor ingresa el título del límite');
      return;
    }

    if (!limitAmount) {
      alert('Por favor ingresa el monto del límite');
      return;
    }

    const amount = parseFloat(limitAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Por favor ingresa un monto válido');
      return;
    }

    if (editingLimitId) {
      updateSpendingLimit(editingLimitId, { 
        title: limitTitle,
        amount,
        enabled: limitEnabled
      });
      setEditingLimitId(null);
    } else {
      addSpendingLimit({ 
        title: limitTitle,
        amount,
        enabled: limitEnabled
      });
    }

    setLimitTitle('');
    setLimitAmount('');
    setLimitEnabled(true);
    setShowLimitForm(false);
  };

  const handleEditLimit = (limit: SpendingLimit) => {
    setEditingLimitId(limit.id);
    setLimitTitle(limit.title);
    setLimitAmount(limit.amount.toString());
    setLimitEnabled(limit.enabled);
    setShowLimitForm(true);
  };

  const handleCancelLimit = () => {
    setShowLimitForm(false);
    setEditingLimitId(null);
    setLimitTitle('');
    setLimitAmount('');
    setLimitEnabled(true);
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      if (showDeleteConfirm.type === 'account') {
        deleteAccount(showDeleteConfirm.id);
      } else if (showDeleteConfirm.type === 'label') {
        deleteLabel(showDeleteConfirm.id);
      } else {
        deleteSpendingLimit(showDeleteConfirm.id);
      }
      setShowDeleteConfirm(null);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-medium mb-3">Configuraciones</h2>
        
        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('accounts')}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'accounts'
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Cuentas
          </button>
          <button
            onClick={() => setActiveTab('labels')}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'labels'
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Etiquetas
          </button>
          <button
            onClick={() => setActiveTab('limits')}
            className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'limits'
                ? 'bg-blue-600 dark:bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            Límites
          </button>
        </div>
      </div>

      {/* Accounts Tab */}
      {activeTab === 'accounts' && (
        <>
          {/* Add Account Button */}
          {!showAccountForm && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowAccountForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Cuenta
              </button>
            </div>
          )}

          {/* Account Form */}
          {showAccountForm && (
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <form onSubmit={handleAccountSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300">
                    Nombre de la Cuenta
                  </label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Ej: Cuenta Personal"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300">
                    Detalle (opcional)
                  </label>
                  <input
                    type="text"
                    value={accountDetail}
                    onChange={(e) => setAccountDetail(e.target.value)}
                    placeholder="Descripción adicional"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelAccount}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingAccountId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Accounts List */}
          <div className="flex-1 overflow-auto px-4 py-3">
            {accounts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <p>No hay cuentas registradas</p>
                <p className="text-sm mt-1">Crea una nueva cuenta</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map(account => (
                  <div
                    key={account.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{account.name}</p>
                        {account.detail && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {account.detail}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={() => handleEditAccount(account)}
                          className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm({ type: 'account', id: account.id })}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Labels Tab */}
      {activeTab === 'labels' && (
        <>
          {/* Add Label Button */}
          {!showLabelForm && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowLabelForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nueva Etiqueta
              </button>
            </div>
          )}

          {/* Label Form */}
          {showLabelForm && (
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <form onSubmit={handleLabelSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300">
                    Nombre de la Etiqueta
                  </label>
                  <input
                    type="text"
                    value={labelName}
                    onChange={(e) => setLabelName(e.target.value)}
                    placeholder="Ej: Alimentación"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setLabelColor(color)}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          labelColor === color 
                            ? 'ring-2 ring-offset-2 ring-blue-600 dark:ring-blue-400 dark:ring-offset-gray-900 scale-110' 
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelLabel}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    {editingLabelId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Labels List */}
          <div className="flex-1 overflow-auto px-4 py-3">
            {labels.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <p>No hay etiquetas registradas</p>
                <p className="text-sm mt-1">Crea una nueva etiqueta</p>
              </div>
            ) : (
              <div className="space-y-2">
                {labels.map(label => (
                  <div
                    key={label.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div 
                          className="w-8 h-8 rounded-lg flex-shrink-0" 
                          style={{ backgroundColor: label.color }}
                        />
                        <p className="font-medium truncate">{label.name}</p>
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={() => handleEditLabel(label)}
                          className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm({ type: 'label', id: label.id })}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Spending Limits Tab */}
      {activeTab === 'limits' && (
        <>
          {/* Add Limit Button */}
          {!showLimitForm && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <button
                onClick={() => setShowLimitForm(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md"
              >
                <Plus className="w-4 h-4" />
                Nuevo Límite
              </button>
            </div>
          )}

          {/* Limit Form */}
          {showLimitForm && (
            <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
              <form onSubmit={handleLimitSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300">
                    Título
                  </label>
                  <input
                    type="text"
                    value={limitTitle}
                    onChange={(e) => setLimitTitle(e.target.value)}
                    placeholder="Ej: Límite Mensual"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1.5 text-gray-700 dark:text-gray-300">
                    Monto
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      $
                    </span>
                    <input
                      type="number"
                      value={limitAmount}
                      onChange={(e) => setLimitAmount(e.target.value)}
                      placeholder="1000"
                      step="0.01"
                      min="0"
                      className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={limitEnabled}
                    onChange={(e) => setLimitEnabled(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm">Habilitado</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelLimit}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    {editingLimitId ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Limits List */}
          <div className="flex-1 overflow-auto px-4 py-3">
            {spendingLimits.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <DollarSign className="w-12 h-12 mb-3 opacity-50" />
                <p>No hay límites de gasto registrados</p>
                <p className="text-sm mt-1">Crea un nuevo límite</p>
              </div>
            ) : (
              <div className="space-y-2">
                {spendingLimits.map(limit => (
                  <div
                    key={limit.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      limit.enabled
                        ? 'border-orange-500 dark:border-orange-400 bg-orange-50/50 dark:bg-orange-950/20 shadow-sm'
                        : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 opacity-60'
                    } hover:shadow-md`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          limit.enabled 
                            ? 'bg-gradient-to-br from-orange-500 to-pink-500' 
                            : 'bg-gray-400 dark:bg-gray-600'
                        }`}>
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{limit.title}</p>
                          <p className={`text-sm ${
                            limit.enabled
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}>
                            ${limit.amount.toLocaleString()} / mes
                          </p>
                        </div>
                        {limit.enabled && (
                          <div className="px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white text-xs font-medium">
                            Activo
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 ml-3">
                        <button
                          onClick={() => handleEditLimit(limit)}
                          className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm({ type: 'limit', id: limit.id })}
                          className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">
              Eliminar {showDeleteConfirm.type === 'account' ? 'Cuenta' : showDeleteConfirm.type === 'label' ? 'Etiqueta' : 'Límite de Gasto'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ¿Estás seguro de que deseas eliminar? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
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