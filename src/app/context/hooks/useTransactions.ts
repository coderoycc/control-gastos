import { useCallback } from "react";
import { Transaction } from "../types";
import { transactionRepo } from "../../../services/db";

export function useTransactions(
	transactions: Transaction[],
	setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>,
) {
	const addTransaction = useCallback(
		(transaction: Omit<Transaction, "id">) => {
			const newTransaction: Transaction = {
				...transaction,
				id: Date.now().toString(),
			};
			setTransactions((prev) => [newTransaction, ...prev]);
			transactionRepo.put(newTransaction).catch(console.error);
		},
		[setTransactions],
	);

	const addTransactionsBatch = useCallback(
		async (newItems: Omit<Transaction, "id">[]) => {
			if (newItems.length === 0) return;
			const created: Transaction[] = newItems.map((item, index) => ({
				...item,
				id: `${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`,
			}));
			setTransactions((prev) => {
				const combined = [...created, ...prev];
				return combined.sort(
					(a, b) =>
						new Date(`${b.date}T${b.time || "00:00"}`).getTime() -
						new Date(`${a.date}T${a.time || "00:00"}`).getTime(),
				);
			});
			await transactionRepo.putMany(created);
		},
		[setTransactions],
	);

	const updateTransaction = useCallback(
		(id: string, transaction: Omit<Transaction, "id">) => {
			const updated: Transaction = { ...transaction, id };
			setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
			transactionRepo.put(updated).catch(console.error);
		},
		[setTransactions],
	);

	const deleteTransaction = useCallback(
		(id: string) => {
			setTransactions((prev) => prev.filter((t) => t.id !== id));
			transactionRepo.remove(id).catch(console.error);
		},
		[setTransactions],
	);

	const getTransactionById = useCallback(
		(id: string) => {
			return transactions.find((t) => t.id === id);
		},
		[transactions],
	);

	return {
		transactions,
		addTransaction,
		addTransactionsBatch,
		updateTransaction,
		deleteTransaction,
		getTransactionById,
	};
}
