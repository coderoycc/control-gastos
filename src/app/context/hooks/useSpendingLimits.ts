// src/app/context/hooks/useSpendingLimits.ts

import { useCallback } from 'react';
import { SpendingLimit } from '../types';

export function useSpendingLimits(
  spendingLimits: SpendingLimit[],
  setSpendingLimits: React.Dispatch<React.SetStateAction<SpendingLimit[]>>
) {
  const addSpendingLimit = useCallback(
    (limit: Omit<SpendingLimit, 'id'>) => {
      const newLimit = {
        ...limit,
        id: Date.now().toString()
      };
      if (newLimit.enabled) {
        setSpendingLimits(prev => [...prev.map(l => ({ ...l, enabled: false })), newLimit]);
      } else {
        setSpendingLimits(prev => [...prev, newLimit]);
      }
    },
    [setSpendingLimits]
  );

  const updateSpendingLimit = useCallback(
    (id: string, limit: Omit<SpendingLimit, 'id'>) => {
      if (limit.enabled) {
        setSpendingLimits(prev =>
          prev.map(l =>
            l.id === id ? { ...limit, id } : { ...l, enabled: false }
          )
        );
      } else {
        setSpendingLimits(prev =>
          prev.map(l => l.id === id ? { ...limit, id } : l)
        );
      }
    },
    [setSpendingLimits]
  );

  const deleteSpendingLimit = useCallback(
    (id: string) => {
      setSpendingLimits(prev => prev.filter(l => l.id !== id));
    },
    [setSpendingLimits]
  );

  return {
    spendingLimits,
    addSpendingLimit,
    updateSpendingLimit,
    deleteSpendingLimit
  };
}