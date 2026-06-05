import { Account, Label, SpendingLimit, Transaction } from "../types";

export const INITIAL_ACCOUNTS: Account[] = [
	{ id: "1", name: "Cuenta Personal", detail: "", balance: 0 },
];

export const INITIAL_LABELS: Label[] = [
	// Etiquetas de salida
	{ id: "1", name: "Alimentación", color: "#10b981", type: "salida" },
	{ id: "2", name: "Transporte", color: "#3b82f6", type: "salida" },
	{ id: "3", name: "Servicios", color: "#f59e0b", type: "salida" },
	{ id: "4", name: "Entretenimiento", color: "#14b8a6", type: "salida" },
	{ id: "5", name: "Regalos", color: "#ec4899", type: "salida" },
	// Etiquetas de entrada
	{ id: "6", name: "Salario", color: "#8b5cf6", type: "entrada" },
	{ id: "7", name: "Extras", color: "#6366f1", type: "entrada" },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SPENDING_LIMITS: SpendingLimit[] = [];
