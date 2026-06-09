import { useCallback } from "react";
import { Account } from "../types";
import { accountRepo } from "../../../services/db";

export function useAccounts(
	accounts: Account[],
	setAccounts: React.Dispatch<React.SetStateAction<Account[]>>,
) {
	const addAccount = useCallback(
		(account: Omit<Account, "id">) => {
			const newAccount: Account = {
				...account,
				id: Date.now().toString(),
			};
			setAccounts((prev) => [...prev, newAccount]);
			accountRepo.put(newAccount).catch(console.error);
		},
		[setAccounts],
	);

	const updateAccount = useCallback(
		(id: string, account: Omit<Account, "id">) => {
			const updated: Account = { ...account, id };
			setAccounts((prev) => prev.map((a) => (a.id === id ? updated : a)));
			accountRepo.put(updated).catch(console.error);
		},
		[setAccounts],
	);

	const deleteAccount = useCallback(
		(id: string) => {
			setAccounts((prev) => prev.filter((a) => a.id !== id));
			accountRepo.remove(id).catch(console.error);
		},
		[setAccounts],
	);

	const getAccountById = useCallback(
		(id: string) => {
			return accounts.find((a) => a.id === id);
		},
		[accounts],
	);

	const adjustBalance = useCallback(
		(accountId: string, amount: number) => {
			setAccounts((prev) => {
				const updated = prev.map((a) =>
					a.id === accountId ? { ...a, balance: a.balance + amount } : a,
				);
				const affected = updated.find((a) => a.id === accountId);
				if (affected) accountRepo.put(affected).catch(console.error);
				return updated;
			});
		},
		[setAccounts],
	);

	const transferBetweenAccounts = useCallback(
		(fromAccountId: string, toAccountId: string, amount: number) => {
			setAccounts((prev) => {
				const updated = prev.map((a) => {
					if (a.id === fromAccountId)
						return { ...a, balance: a.balance - amount };
					if (a.id === toAccountId)
						return { ...a, balance: a.balance + amount };
					return a;
				});
				const from = updated.find((a) => a.id === fromAccountId);
				const to = updated.find((a) => a.id === toAccountId);
				if (from) accountRepo.put(from).catch(console.error);
				if (to) accountRepo.put(to).catch(console.error);
				return updated;
			});
		},
		[setAccounts],
	);

	return {
		accounts,
		addAccount,
		updateAccount,
		deleteAccount,
		getAccountById,
		adjustBalance,
		transferBetweenAccounts,
	};
}
