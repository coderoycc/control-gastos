import type { Transaction } from '../context/types';
import type { SpendingLimit, LimitStatus } from './types';
import { LIMIT_CONSTANTS } from './constants';

/**
 * Normaliza un SpendingLimit cargado desde IndexedDB o backup.
 * Garantiza retrocompatibilidad asignando accountId: null si no existe.
 */
export function normalizeSpendingLimit(raw: unknown): SpendingLimit {
  const item = raw as Partial<SpendingLimit>;
  return {
    id: typeof item.id === 'string' && item.id.trim() ? item.id : crypto.randomUUID(),
    title: typeof item.title === 'string' ? item.title.trim() : 'Límite',
    amount: typeof item.amount === 'number' && !isNaN(item.amount) && item.amount > 0 ? item.amount : 0,
    enabled: Boolean(item.enabled),
    accountId: item.accountId ? String(item.accountId).trim() : null,
  };
}

/**
 * Valida un array de SpendingLimits garantizando unicidad de límites activos por scope:
 * Máximo 1 límite activo global (accountId == null) y máximo 1 límite activo por cuenta específica.
 */
export function sanitizeSpendingLimits(limits: unknown[]): SpendingLimit[] {
  if (!Array.isArray(limits)) return [];
  const normalized = limits.map(normalizeSpendingLimit);
  const activeScopes = new Set<string>();

  return normalized.map((limit) => {
    if (!limit.enabled) return limit;
    const scopeKey = limit.accountId ? `account:${limit.accountId}` : 'global';
    if (activeScopes.has(scopeKey)) {
      // Si ya hay un activo para ese scope, desactivamos los siguientes para evitar inconsistencias
      return { ...limit, enabled: false };
    }
    activeScopes.add(scopeKey);
    return limit;
  });
}

/**
 * Calcula el total de gastos (salidas) en el mes/año de referencia.
 * Permite filtrar por una cuenta específica o considerar todas las cuentas.
 */
export function getMonthlyExpensesTotal(
  transactions: Transaction[],
  dateStr: string,
  options?: {
    excludeId?: string;
    accountId?: string | null;
  }
): number {
  if (!dateStr) return 0;
  const targetYearMonth = dateStr.substring(0, 7);

  return transactions
    .filter((t) => {
      if (t.type !== 'salida') return false;
      if (!t.date.startsWith(targetYearMonth)) return false;
      if (options?.excludeId && t.id === options.excludeId) return false;
      if (options?.accountId && t.accountId !== options.accountId) return false;
      return true;
    })
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
}

/**
 * Encuentra el límite de gasto activo más aplicable para una transacción.
 * Da prioridad al límite específico de la cuenta; si no hay uno activo, busca el límite global.
 */
export function findApplicableLimit(
  spendingLimits: SpendingLimit[],
  accountId?: string | null
): SpendingLimit | undefined {
  if (accountId) {
    const accountSpecificLimit = spendingLimits.find(
      (limit) => limit.enabled && limit.accountId === accountId
    );
    if (accountSpecificLimit) {
      return accountSpecificLimit;
    }
  }

  // Si no hay límite específico, buscar límite global (accountId es null o undefined)
  return spendingLimits.find((limit) => limit.enabled && !limit.accountId);
}

/**
 * Evalúa el estado del límite para una transacción y calcula montos y alertas.
 */
export function calculateLimitStatus(params: {
  transactions: Transaction[];
  spendingLimits: SpendingLimit[];
  amount: string | number;
  date: string;
  type: string;
  accountId?: string | null;
  excludeId?: string;
}): LimitStatus | null {
  const { transactions, spendingLimits, amount, date, type, accountId, excludeId } = params;

  if (type !== 'salida' || !date) {
    return null;
  }

  const activeLimit = findApplicableLimit(spendingLimits, accountId);
  if (!activeLimit || activeLimit.amount <= 0) {
    return null;
  }

  const monthlyExpensesTotalWithoutCurrent = getMonthlyExpensesTotal(transactions, date, {
    excludeId,
    accountId: activeLimit.accountId,
  });

  const parsedAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const totalWithCurrent = monthlyExpensesTotalWithoutCurrent + parsedAmount;
  const percentage = (totalWithCurrent / activeLimit.amount) * 100;

  let alertType: LimitStatus['alertType'] = null;
  if (totalWithCurrent >= activeLimit.amount * LIMIT_CONSTANTS.DANGER_RATIO) {
    alertType = 'danger_100';
  } else if (totalWithCurrent >= activeLimit.amount * LIMIT_CONSTANTS.WARNING_RATIO) {
    alertType = 'warning_90';
  }

  return {
    activeLimit,
    monthlyExpensesTotalWithoutCurrent,
    totalWithCurrent,
    percentage,
    alertType,
  };
}
