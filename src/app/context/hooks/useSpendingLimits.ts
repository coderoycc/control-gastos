import { useCallback } from "react";
import { SpendingLimit } from "../types";
import { spendingLimitRepo } from "../../../services/db";

export function useSpendingLimits(
	spendingLimits: SpendingLimit[],
	setSpendingLimits: React.Dispatch<React.SetStateAction<SpendingLimit[]>>,
) {
	const addSpendingLimit = useCallback(
		(limit: Omit<SpendingLimit, "id">) => {
			const newLimit: SpendingLimit = {
				...limit,
				id: Date.now().toString(),
			};
			if (newLimit.enabled) {
				setSpendingLimits((prev) => {
					const updated = [
						...prev.map((l) => ({ ...l, enabled: false })),
						newLimit,
					];
					updated.forEach((l) => spendingLimitRepo.put(l).catch(console.error));
					return updated;
				});
			} else {
				setSpendingLimits((prev) => [...prev, newLimit]);
				spendingLimitRepo.put(newLimit).catch(console.error);
			}
		},
		[setSpendingLimits],
	);

	const updateSpendingLimit = useCallback(
		(id: string, limit: Omit<SpendingLimit, "id">) => {
			const updated: SpendingLimit = { ...limit, id };
			if (limit.enabled) {
				setSpendingLimits((prev) => {
					const next = prev.map((l) =>
						l.id === id ? updated : { ...l, enabled: false },
					);
					next.forEach((l) => spendingLimitRepo.put(l).catch(console.error));
					return next;
				});
			} else {
				setSpendingLimits((prev) =>
					prev.map((l) => (l.id === id ? updated : l)),
				);
				spendingLimitRepo.put(updated).catch(console.error);
			}
		},
		[setSpendingLimits],
	);

	const deleteSpendingLimit = useCallback(
		(id: string) => {
			setSpendingLimits((prev) => prev.filter((l) => l.id !== id));
			spendingLimitRepo.remove(id).catch(console.error);
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
