import type { Account, Transaction } from '../../context/types';

/**
 * Calcula los movimientos acumulados de una cuenta a partir de las transacciones
 */
export function getAccountMovements(accountId: string, transactions: Transaction[]) {
  let income = 0;
  let expense = 0;
  let transferIn = 0;
  let transferOut = 0;

  for (const t of transactions) {
    if (t.type === 'entrada' && t.accountId === accountId && !t.isPending) {
      income += t.amount;
    } else if (t.type === 'salida' && t.accountId === accountId) {
      expense += t.amount;
    } else if (t.type === 'transferencia') {
      if (t.accountId === accountId) {
        transferOut += t.amount;
      }
      if (t.toAccountId === accountId) {
        transferIn += t.amount;
      }
    }
  }

  const netMovements = income - expense + transferIn - transferOut;

  return {
    income,
    expense,
    transferIn,
    transferOut,
    netMovements,
  };
}

/**
 * Calcula el saldo real disponible de una cuenta (saldo base + movimientos calculados)
 */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  const { netMovements } = getAccountMovements(account.id, transactions);
  return (account.balance || 0) + netMovements;
}

/**
 * Calcula el saldo total disponible entre todas las cuentas
 */
export function calculateTotalAvailable(accounts: Account[], transactions: Transaction[]): number {
  return accounts.reduce((acc, account) => {
    return acc + calculateAccountBalance(account, transactions);
  }, 0);
}

/**
 * Calcula el total pendiente de cobro (ventas informales contra entrega o pendientes)
 */
export function calculatePendingReceivables(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'entrada' && t.isPending)
    .reduce((acc, t) => acc + t.amount, 0);
}

/**
 * Calcula el balance base que debe tener la cuenta para que su saldo real actual
 * sea exactamente igual a targetBalance tras un arqueo o ajuste.
 */
export function calculateBaseBalanceForTarget(
  account: Account,
  transactions: Transaction[],
  targetBalance: number
): number {
  const { netMovements } = getAccountMovements(account.id, transactions);
  return targetBalance - netMovements;
}
