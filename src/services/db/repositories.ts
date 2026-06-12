import { getAll, put, remove, putMany } from "./idb";
import type {
	Transaction,
	Account,
	Label,
	SpendingLimit,
	UserSettings,
} from "../../app/context/types";

export const transactionRepo = {
	getAll: (): Promise<Transaction[]> => getAll<Transaction>("transactions"),
	put: (item: Transaction): Promise<void> =>
		put<Transaction>("transactions", item),
	remove: (id: string): Promise<void> => remove("transactions", id),
	putMany: (items: Transaction[]): Promise<void> =>
		putMany<Transaction>("transactions", items),
};

export const accountRepo = {
	getAll: (): Promise<Account[]> => getAll<Account>("accounts"),
	put: (item: Account): Promise<void> => put<Account>("accounts", item),
	remove: (id: string): Promise<void> => remove("accounts", id),
	putMany: (items: Account[]): Promise<void> =>
		putMany<Account>("accounts", items),
};

export const labelRepo = {
	getAll: (): Promise<Label[]> => getAll<Label>("labels"),
	put: (item: Label): Promise<void> => put<Label>("labels", item),
	remove: (id: string): Promise<void> => remove("labels", id),
	putMany: (items: Label[]): Promise<void> => putMany<Label>("labels", items),
};

export const spendingLimitRepo = {
	getAll: (): Promise<SpendingLimit[]> =>
		getAll<SpendingLimit>("spendingLimits"),
	put: (item: SpendingLimit): Promise<void> =>
		put<SpendingLimit>("spendingLimits", item),
	remove: (id: string): Promise<void> => remove("spendingLimits", id),
	putMany: (items: SpendingLimit[]): Promise<void> =>
		putMany<SpendingLimit>("spendingLimits", items),
};

export const userSettingsRepo = {
	getAll: (): Promise<UserSettings[]> =>
		getAll<UserSettings>("userSettings"),
	put: (item: UserSettings): Promise<void> =>
		put<UserSettings>("userSettings", item),
	remove: (id: string): Promise<void> => remove("userSettings", id),
};
