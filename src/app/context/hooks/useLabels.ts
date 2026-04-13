// src/app/context/hooks/useLabels.ts

import { useCallback } from 'react';
import { Label } from '../types';

export function useLabels(
  labels: Label[],
  setLabels: React.Dispatch<React.SetStateAction<Label[]>>
) {
  const addLabel = useCallback(
    (label: Omit<Label, 'id'>) => {
      const newLabel = {
        ...label,
        id: Date.now().toString()
      };
      setLabels(prev => [...prev, newLabel]);
    },
    [setLabels]
  );

  const updateLabel = useCallback(
    (id: string, label: Omit<Label, 'id'>) => {
      setLabels(prev =>
        prev.map(l => l.id === id ? { ...label, id } : l)
      );
    },
    [setLabels]
  );

  const deleteLabel = useCallback(
    (id: string) => {
      setLabels(prev => prev.filter(l => l.id !== id));
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