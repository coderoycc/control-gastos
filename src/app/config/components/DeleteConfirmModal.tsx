import type { DeleteTarget } from '../types';

interface DeleteConfirmModalProps {
  target: DeleteTarget;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ target, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const label =
    target.type === 'account'
      ? 'Cuenta'
      : target.type === 'label'
        ? 'Etiqueta'
        : 'Límite de Gasto';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-sm w-full">
        <h3 className="font-semibold mb-2">Eliminar {label}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          ¿Estás seguro de que deseas eliminar? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-600 dark:bg-red-500 text-white hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
