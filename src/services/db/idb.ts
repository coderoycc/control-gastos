const DB_NAME = "control-gastos-db";
const DB_VERSION = 2;

export type StoreName =
	| "transactions"
	| "accounts"
	| "labels"
	| "spendingLimits";

const ALL_STORES: StoreName[] = [
	"transactions",
	"accounts",
	"labels",
	"spendingLimits",
];

let dbInstance: IDBDatabase | null = null;

/**
 * Abre (o crea) la base de datos IndexedDB.
 * Reutiliza la instancia si ya fue abierta.
 */
export function openDB(): Promise<IDBDatabase> {
	if (dbInstance) return Promise.resolve(dbInstance);

	return new Promise((resolve, reject) => {
		const request = indexedDB.open(DB_NAME, DB_VERSION);

		request.onupgradeneeded = (event) => {
			const db = (event.target as IDBOpenDBRequest).result;
			const oldVersion = event.oldVersion;

			// Si venimos de una versión anterior, borramos todos los stores
			// para forzar un reseed limpio con el nuevo initialState.
			if (oldVersion > 0) {
				for (const store of ALL_STORES) {
					if (db.objectStoreNames.contains(store)) {
						db.deleteObjectStore(store);
					}
				}
			}

			// Crear (o recrear) todos los stores
			for (const store of ALL_STORES) {
				db.createObjectStore(store, { keyPath: "id" });
			}
		};

		request.onsuccess = (event) => {
			dbInstance = (event.target as IDBOpenDBRequest).result;
			resolve(dbInstance);
		};

		request.onerror = (event) => {
			console.error(
				"[IDB] Error al abrir la base de datos:",
				(event.target as IDBOpenDBRequest).error,
			);
			reject((event.target as IDBOpenDBRequest).error);
		};
	});
}

/**
 * Obtiene todos los registros de un object store.
 */
export async function getAll<T>(store: StoreName): Promise<T[]> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(store, "readonly");
		const req = tx.objectStore(store).getAll();
		req.onsuccess = () => resolve(req.result as T[]);
		req.onerror = () => reject(req.error);
	});
}

/**
 * Inserta o actualiza un registro (upsert) en un object store.
 */
export async function put<T extends { id: string }>(
	store: StoreName,
	item: T,
): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(store, "readwrite");
		const req = tx.objectStore(store).put(item);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

/**
 * Elimina un registro por su id de un object store.
 */
export async function remove(store: StoreName, id: string): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(store, "readwrite");
		const req = tx.objectStore(store).delete(id);
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

/**
 * Inserta múltiples registros en un object store dentro de una sola transacción.
 * Útil para el seed inicial de datos.
 */
export async function putMany<T extends { id: string }>(
	store: StoreName,
	items: T[],
): Promise<void> {
	if (items.length === 0) return;
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(store, "readwrite");
		const objectStore = tx.objectStore(store);
		for (const item of items) {
			objectStore.put(item);
		}
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}

/**
 * Elimina todos los registros de un object store.
 */
export async function clearStore(store: StoreName): Promise<void> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(store, "readwrite");
		const req = tx.objectStore(store).clear();
		req.onsuccess = () => resolve();
		req.onerror = () => reject(req.error);
	});
}

/**
 * Cuenta los registros en un object store.
 */
export async function countRecords(store: StoreName): Promise<number> {
	const db = await openDB();
	return new Promise((resolve, reject) => {
		const tx = db.transaction(store, "readonly");
		const req = tx.objectStore(store).count();
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}
