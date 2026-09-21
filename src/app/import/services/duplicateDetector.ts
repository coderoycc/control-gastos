// src/app/import/services/duplicateDetector.ts
import { ParsedMovement } from '../types';
import { Transaction } from '../../context/types';

/**
 * Normaliza cadenas de texto para comparación flexible (sin acentos, mayúsculas, espacios colapsados).
 */
function cleanStringForComparison(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Detecta posibles transacciones duplicadas entre los movimientos extraídos del extracto bancario
 * y las transacciones ya existentes en la base de datos de la aplicación.
 *
 * Criterios de coincidencia:
 * 1. Misma fecha (YYYY-MM-DD).
 * 2. Mismo monto (en valor absoluto) y mismo tipo ('entrada' / 'salida').
 * 3. Si se especifica cuenta, que pertenezca a la misma cuenta seleccionada (o global).
 * 4. Coincidencia en número de documento (si existe) o similitud de texto en detalle.
 */
export function detectDuplicates(
  movements: ParsedMovement[],
  existingTransactions: Transaction[],
  targetAccountId?: string
): ParsedMovement[] {
  // Filtrar transacciones existentes relevantes
  const relevantTransactions = targetAccountId && targetAccountId !== 'all'
    ? existingTransactions.filter((t) => t.accountId === targetAccountId)
    : existingTransactions;

  return movements.map((movement) => {
    // Si ya no es importable por error de parsing, no evaluar duplicados
    if (!movement.importable) {
      return movement;
    }

    const absMonto = Math.abs(movement.monto);
    const movementDate = movement.fecha;
    const movementDocClean = movement.documento ? cleanStringForComparison(movement.documento) : null;
    const movementDescClean = cleanStringForComparison(movement.descripcion);

    const isDuplicate = relevantTransactions.some((tx) => {
      // 1. Validar fecha
      if (tx.date !== movementDate) {
        return false;
      }

      // 2. Validar tipo y monto
      if (tx.type !== movement.tipo) {
        return false;
      }
      if (Math.abs(tx.amount - absMonto) > 0.001) {
        return false;
      }

      // 3. Validar descripción / documento
      const txDetailClean = cleanStringForComparison(tx.detail);

      // Si el movimiento tiene documento y el detalle de la transacción contiene dicho documento
      if (movementDocClean && movementDocClean.length >= 4 && txDetailClean.includes(movementDocClean)) {
        return true;
      }

      // Si las descripciones son muy parecidas o una está contenida en la otra
      if (
        txDetailClean === movementDescClean ||
        (movementDescClean.length > 5 && txDetailClean.includes(movementDescClean)) ||
        (txDetailClean.length > 5 && movementDescClean.includes(txDetailClean))
      ) {
        return true;
      }

      // Si tienen misma fecha, mismo monto y tipo pero descripciones genéricas
      return false;
    });

    if (isDuplicate) {
      return {
        ...movement,
        duplicado: true,
        seleccionado: false, // Desmarcado por defecto para seguridad del usuario
      };
    }

    return {
      ...movement,
      duplicado: false,
    };
  });
}
