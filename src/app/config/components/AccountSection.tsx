import { Plus, Edit2, Trash2 } from 'lucide-react';
import { BottomSheet } from '../../../components';
import { useConfigAccounts } from '../hooks/useConfigAccounts';

interface AccountSectionProps {
  onDelete: (id: string) => void;
}

export function AccountSection({ onDelete }: AccountSectionProps) {
  const {
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
  } = useConfigAccounts();

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={openAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Cuenta
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-4">
            <p>No hay cuentas registradas</p>
            <p className="text-sm mt-1">Crea una nueva cuenta</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {accounts.map(account => (
              <div
                key={account.id}
                className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{account.name}</p>
                  {account.detail && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{account.detail}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(account)}
                    className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(account.id)}
                    className="p-1.5 rounded text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={showForm}
        onClose={close}
        title={editingId ? 'Editar Cuenta' : 'Nueva Cuenta'}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Nombre de la Cuenta
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Cuenta Personal"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Detalle (opcional)
            </label>
            <input
              type="text"
              value={detail}
              onChange={e => setDetail(e.target.value)}
              placeholder="Descripción adicional"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={close}
              className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
            >
              {editingId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </BottomSheet>
    </>
  );
}
