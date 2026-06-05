// src/app/context/hooks/useLabels.ts

import { useCallback } from 'react';
import { Label } from '../types';
import { labelRepo } from '../../../services/db';

export function useLabels(
  labels: Label[],
  setLabels: React.Dispatch<React.SetStateAction<Label[]>>
) {
  const addLabel = useCallback(
    (label: Omit<Label, 'id'>) => {
      const newLabel: Label = {
        ...label,
        id: Date.now().toString()
      };
      setLabels(prev => [...prev, newLabel]);
      labelRepo.put(newLabel).catch(console.error);
    },
    [setLabels]
  );

  const updateLabel = useCallback(
    (id: string, label: Omit<Label, 'id'>) => {
      const updated: Label = { ...label, id };
      setLabels(prev =>
        prev.map(l => l.id === id ? updated : l)
      );
      labelRepo.put(updated).catch(console.error);
    },
    [setLabels]
  );

  const deleteLabel = useCallback(
    (id: string) => {
      setLabels(prev => prev.filter(l => l.id !== id));
      labelRepo.remove(id).catch(console.error);
    },
    [setLabels]
  );

  const getLabelById = useCallback(
    (id: string) => {
      return labels.find(l => l.id === id);
    },
    [labels]
  );

  return {
    labels,
    addLabel,
    updateLabel,
    deleteLabel,
    getLabelById
  };
}