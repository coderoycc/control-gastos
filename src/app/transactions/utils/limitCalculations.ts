import type { Transaction } from '../../context/types';

/**
 * Obtiene el total de gastos acumulados del mismo mes y año de la fecha dada,
 * excluyendo opcionalmente una transacción específica (útil para edición).
 * 
 * @param transactions Lista completa de transacciones
 * @param dateStr Fecha de referencia (formato YYYY-MM-DD)
 * @param excludeId ID de la transacción a omitir
 * @returns Total acumulado de gastos en el mes de referencia
 */
export function getMonthlyExpensesTotal(
  transactions: Transaction[],
  dateStr: string,
  excludeId?: string
): number {
  if (!dateStr) return 0;
  
  // Extraemos el año y mes en formato YYYY-MM
  const targetYearMonth = dateStr.substring(0, 7);
  
  return transactions
    .filter(t => 
      t.type === 'salida' && 
      t.date.startsWith(targetYearMonth) && 
      (!excludeId || t.id !== excludeId)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}
