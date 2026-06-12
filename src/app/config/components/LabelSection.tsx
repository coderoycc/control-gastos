import { Plus, Edit2, TrendingUp, TrendingDown } from 'lucide-react';
import { BottomSheet } from '../../../components';
import { useConfigLabels } from '../hooks/useConfigLabels';
import { PRESET_COLORS } from '../utils/constants';

interface LabelSectionProps {
  onDelete: (id: string) => void;
}

export function LabelSection({ onDelete }: LabelSectionProps) {
  const {
    labels,
    showForm,
    editingId,
    name,
    color,
    type,
    setName,
    setColor,
    setType,
    openAdd,
    openEdit,
    close,
    handleSubmit,
  } = useConfigLabels();

  return (
    <>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={openAdd}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Etiqueta
        </button>
      </div>

      <div className="flex-1 overflow-auto px-4 py-3">
        {labels.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p>No hay etiquetas registradas</p>
            <p className="text-sm mt-1">Crea una nueva etiqueta</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {labels.map(label => (
              <div
                key={label.id}
                className="flex items-center justify-between py-2 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div
                    className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.type === 'entrada' ? (
                      <TrendingUp className="w-3 h-3 text-white" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{label.name}</p>
                    <span
                      className={`text-[10px] ${
                        label.type === 'entrada'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {label.type === 'entrada' ? 'Entrada' : 'Egreso'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEdit(label)}
                    className="p-1.5 rounded text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
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
        title={editingId ? 'Editar Etiqueta' : 'Nueva Etiqueta'}
      >
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Nombre de la Etiqueta
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Alimentación"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Color</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-12 h-12 rounded-lg transition-all ${
                    color === c
                      ? 'ring-4 ring-offset-2 ring-blue-600 dark:ring-blue-400 dark:ring-offset-gray-900 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType('entrada')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  type === 'entrada'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Ingreso
              </button>
              <button
                type="button"
                onClick={() => setType('salida')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-all ${
                  type === 'salida'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                Egreso
              </button>
            </div>
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
