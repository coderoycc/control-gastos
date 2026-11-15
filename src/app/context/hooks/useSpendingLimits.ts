import { useCallback } from "react";
import type { SpendingLimit } from "../types";
import { spendingLimitRepo } from "../../../services/db";
import { normalizeSpendingLimit } from "../../limits";

export function useSpendingLimits(
  spendingLimits: SpendingLimit[],
  setSpendingLimits: React.Dispatch<React.SetStateAction<SpendingLimit[]>>,
) {
  const addSpendingLimit = useCallback(
    async (limit: Omit<SpendingLimit, "id">) => {
      const newLimit: SpendingLimit = normalizeSpendingLimit({
        ...limit,
        id: crypto.randomUUID(),
      });

      try {
        let updatedList: SpendingLimit[];
        if (newLimit.enabled) {
          // Si el nuevo límite está activo, desactivamos cualquier otro límite
          // con el mismo scope (misma cuenta o ambos globales)
          const targetScope = newLimit.accountId || null;
          const limitsToUpdate: SpendingLimit[] = [];

          updatedList = [
            ...spendingLimits.map((l) => {
              const currentScope = l.accountId || null;
              if (currentScope === targetScope && l.enabled) {
                const deactivated = { ...l, enabled: false };
                limitsToUpdate.push(deactivated);
                return deactivated;
              }
              return l;
            }),
            newLimit,
          ];

          await Promise.all([
            ...limitsToUpdate.map((l) => spendingLimitRepo.put(l)),
            spendingLimitRepo.put(newLimit),
          ]);
        } else {
          updatedList = [...spendingLimits, newLimit];
          await spendingLimitRepo.put(newLimit);
        }

        setSpendingLimits(updatedList);
      } catch (error) {
        console.error("[useSpendingLimits] Error al agregar límite:", error);
      }
    },
    [spendingLimits, setSpendingLimits],
  );

  const updateSpendingLimit = useCallback(
    async (id: string, limit: Omit<SpendingLimit, "id">) => {
      const updated: SpendingLimit = normalizeSpendingLimit({ ...limit, id });

      try {
        let nextList: SpendingLimit[];
        if (updated.enabled) {
          const targetScope = updated.accountId || null;
          const limitsToUpdate: SpendingLimit[] = [];

          nextList = spendingLimits.map((l) => {
            if (l.id === id) {
              return updated;
            }
            const currentScope = l.accountId || null;
            if (currentScope === targetScope && l.enabled) {
              const deactivated = { ...l, enabled: false };
              limitsToUpdate.push(deactivated);
              return deactivated;
            }
            return l;
          });

          await Promise.all([
            ...limitsToUpdate.map((l) => spendingLimitRepo.put(l)),
            spendingLimitRepo.put(updated),
          ]);
        } else {
          nextList = spendingLimits.map((l) => (l.id === id ? updated : l));
          await spendingLimitRepo.put(updated);
        }

        setSpendingLimits(nextList);
      } catch (error) {
        console.error("[useSpendingLimits] Error al actualizar límite:", error);
      }
    },
    [spendingLimits, setSpendingLimits],
  );

  const deleteSpendingLimit = useCallback(
    async (id: string) => {
      try {
        await spendingLimitRepo.remove(id);
        setSpendingLimits((prev) => prev.filter((l) => l.id !== id));
      } catch (error) {
        console.error("[useSpendingLimits] Error al eliminar límite:", error);
      }
    },
    [setSpendingLimits],
  );

  return {
    spendingLimits,
    addSpendingLimit,
    updateSpendingLimit,
    deleteSpendingLimit,
  };
}
