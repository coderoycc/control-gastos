import { useState, useCallback } from 'react';
import { useData, type Label, type LabelType } from '../../context';
import { PRESET_COLORS } from '../utils/constants';

export function useConfigLabels() {
  const { labels, addLabel, updateLabel, deleteLabel } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [type, setType] = useState<LabelType>('salida');

  const openAdd = useCallback(() => {
    setEditingId(null);
    setName('');
    setColor(PRESET_COLORS[0]);
    setType('salida');
    setShowForm(true);
  }, []);

  const openEdit = useCallback((label: Label) => {
    setEditingId(label.id);
    setName(label.name);
    setColor(label.color);
    setType(label.type);
    setShowForm(true);
  }, []);

  const close = useCallback(() => {
    setShowForm(false);
    setEditingId(null);
    setName('');
    setColor(PRESET_COLORS[0]);
    setType('salida');
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) {
        alert('Por favor ingresa el nombre de la etiqueta');
        return;
      }
      if (editingId) {
        updateLabel(editingId, { name, color, type });
      } else {
        addLabel({ name, color, type });
      }
      close();
    },
    [name, color, type, editingId, updateLabel, addLabel, close]
  );

  return {
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
  };
}
