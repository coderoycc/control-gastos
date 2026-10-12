import { Account, Label, SpendingLimit, Transaction } from "../types";

export const INITIAL_ACCOUNTS: Account[] = [
	{ id: "1", name: "Efectivo", detail: "Dinero en mano", balance: 0 },
	{ id: "2", name: "Banco / QR", detail: "Transferencias y QR", balance: 0 },
];

export const INITIAL_LABELS: Label[] = [
	{ id: "1", name: "Venta", color: "#10b981", type: "entrada" },
	{ id: "2", name: "Mercadería / Insumos", color: "#6366f1", type: "salida" },
	{ id: "3", name: "Publicidad / Redes", color: "#ec4899", type: "salida" },
	{ id: "4", name: "Envíos / Delivery", color: "#f59e0b", type: "salida" },
	{ id: "5", name: "Empaques / Bolsas", color: "#14b8a6", type: "salida" },
	{ id: "6", name: "Gastos Personales", color: "#ef4444", type: "salida" },
	{ id: "7", name: "Otros Gastos", color: "#8b5cf6", type: "salida" },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_SPENDING_LIMITS: SpendingLimit[] = [];
