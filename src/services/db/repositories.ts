import { getAll, put, remove, putMany } from "./idb";
import type {
	Transaction,
	Account,
	Label,
	SpendingLimit,
} from "../../app/context/types";

// ── Transactions ────────────────────────────────────────────────────────────

export const transactionRepo = {
	getAll: (): Promise<Transaction[]> => getAll<Transaction>("transactions"),
	put: (item: Transaction): Promise<void> =>
		put<Transaction>("transactions", item),
	remove: (id: string): Promise<void> => remove("transactions", id),
	putMany: (items: Transaction[]): Promise<void> =>
		putMany<Transaction>("transactions", items),
};

// ── Accounts ─────────────────────────────────────────────────────────────────

export const accountRepo = {
	getAll: (): Promise<Account[]> => getAll<Account>("accounts"),
	put: (item: Account): Promise<void> => put<Account>("accounts", item),
	remove: (id: string): Promise<void> => remove("accounts", id),
	putMany: (items: Account[]): Promise<void> =>
		putMany<Account>("accounts", items),
};

// ── Labels ───────────────────────────────────────────────────────────────────

export const labelRepo = {
	getAll: (): Promise<Label[]> => getAll<Label>("labels"),
	put: (item: Label): Promise<void> => put<Label>("labels", item),
	remove: (id: string): Promise<void> => remove("labels", id),
	putMany: (items: Label[]): Promise<void> => putMany<Label>("labels", items),
};

// ── SpendingLimits ────────────────────────────────────────────────────────────

export const spendingLimitRepo = {
	getAll: (): Promise<SpendingLimit[]> =>
		getAll<SpendingLimit>("spendingLimits"),
	put: (item: SpendingLimit): Promise<void> =>
		put<SpendingLimit>("spendingLimits", item),
	remove: (id: string): Promise<void> => remove("spendingLimits", id),
	putMany: (items: SpendingLimit[]): Promise<void> =>
		putMany<SpendingLimit>("spendingLimits", items),
};
