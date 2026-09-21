// src/app/import/services/selectionManager.ts
import { ParsedMovement, ImportSummary } from '../types';

export type SelectionFilterType = 'all' | 'none' | 'incomes' | 'expenses';

/**
 * Calcula dinámicamente el resumen de totales y cantidades a partir de la lista actual de movimientos.
 */
export function calculateSummary(movements: ParsedMovement[]): ImportSummary {
  let entradasTotal = 0;
  let salidasTotal = 0;
  let cantidadEntradas = 0;
  let cantidadSalidas = 0;
  let seleccionados = 0;
  let duplicados = 0;
  let errores = 0;

  for (const m of movements) {
    if (m.duplicado) {
      duplicados++;
    }
    if (!m.importable || m.error) {
      errores++;
    }

    if (m.seleccionado && m.importable) {
      seleccionados++;
      if (m.monto > 0) {
        entradasTotal += m.monto;
        cantidadEntradas++;
      } else if (m.monto < 0) {
        salidasTotal += Math.abs(m.monto);
        cantidadSalidas++;
      }
    }
  }

  return {
    encontrados: movements.length,
    seleccionados,
    entradasTotal: Number(entradasTotal.toFixed(2)),
    salidasTotal: Number(salidasTotal.toFixed(2)),
    cantidadEntradas,
    cantidadSalidas,
    duplicados,
    errores,
  };
}

/**
 * Aplica filtros de selección rápida sobre la lista de movimientos sin eliminar elementos.
 */
export function applySelectionFilter(
  movements: ParsedMovement[],
  filterType: SelectionFilterType
): ParsedMovement[] {
  switch (filterType) {
    case 'all':
      return movements.map((m) =>
        m.importable ? { ...m, seleccionado: true } : m
      );

    case 'none':
      return movements.map((m) => ({ ...m, seleccionado: false }));

    case 'incomes':
      return movements.map((m) => {
        if (!m.importable) return m;
        return { ...m, seleccionado: m.monto > 0 };
      });

    case 'expenses':
      return movements.map((m) => {
        if (!m.importable) return m;
        return { ...m, seleccionado: m.monto < 0 };
      });

    default:
      return movements;
  }
}

/**
 * Alterna manualmente el estado de selección de un movimiento individual.
 */
export function toggleMovementSelection(
  movements: ParsedMovement[],
  id: string
): ParsedMovement[] {
  return movements.map((m) => {
    if (m.id === id) {
      // Solo permitir seleccionar si es importable
      if (!m.importable) return m;
      return { ...m, seleccionado: !m.seleccionado };
    }
    return m;
  });
}
