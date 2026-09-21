// src/app/import/services/movementNormalizer.ts
import { MovementType, ParsedMovement, RawParsedMovement } from '../types';

/**
 * Normaliza una cadena de fecha (DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, etc.) a formato ISO YYYY-MM-DD.
 */
export function normalizeDate(dateStr: string): string {
  const trimmed = dateStr.trim();

  // Caso DD/MM/YYYY o DD-MM-YYYY o DD.MM.YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmyMatch) {
    let day = dmyMatch[1].padStart(2, '0');
    let month = dmyMatch[2].padStart(2, '0');
    let year = dmyMatch[3];
    if (year.length === 2) {
      year = `20${year}`;
    }
    return `${year}-${month}-${day}`;
  }

  // Caso YYYY-MM-DD
  const ymdMatch = trimmed.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

/**
 * Parsea montos en diversos formatos numéricos bancarios:
 * - Formato Boliviano / Latino: "1.250,50", "-90,00", "90,00-"
 * - Formato Estándar: "1,250.50", "-90.00", "90.00-"
 * - Con símbolos de moneda: "Bs 1.250,50", "$ 90.00"
 * - Entre paréntesis: "(90.00)" -> -90.00
 */
export function parseAmount(amountStr: string | number): number {
  if (typeof amountStr === 'number') {
    return isNaN(amountStr) ? 0 : amountStr;
  }

  if (!amountStr || typeof amountStr !== 'string') {
    return 0;
  }

  let cleaned = amountStr.trim().toUpperCase();

  // Detectar signo negativo por paréntesis: (100.00) => -100.00
  let isNegative = false;
  if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
    isNegative = true;
    cleaned = cleaned.slice(1, -1);
  }

  // Detectar signo negativo al inicio o al final: -90.00 o 90.00- o 90.00 D
  if (cleaned.endsWith('-') || cleaned.endsWith('D') || cleaned.endsWith('DB')) {
    isNegative = true;
    cleaned = cleaned.replace(/[-D]|DB$/i, '').trim();
  } else if (cleaned.startsWith('-')) {
    isNegative = true;
    cleaned = cleaned.substring(1).trim();
  }

  // Remover símbolos de moneda y caracteres no numéricos excepto comas y puntos
  cleaned = cleaned.replace(/[^0-9,\.]/g, '');

  if (!cleaned) return 0;

  // Determinar si el separador decimal es punto o coma
  const lastDotIndex = cleaned.lastIndexOf('.');
  const lastCommaIndex = cleaned.lastIndexOf(',');

  if (lastCommaIndex > lastDotIndex) {
    // Formato 1.234,56 -> quitar puntos de miles y reemplazar coma decimal por punto
    cleaned = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (lastDotIndex > lastCommaIndex) {
    // Formato 1,234.56 -> quitar comas de miles
    cleaned = cleaned.replace(/,/g, '');
  } else if (lastCommaIndex !== -1 && lastDotIndex === -1) {
    // Solo coma presente: ej "90,00"
    cleaned = cleaned.replace(',', '.');
  }

  let num = parseFloat(cleaned);
  if (isNaN(num)) return 0;

  if (isNegative) {
    num = -Math.abs(num);
  }

  return Number(num.toFixed(2));
}

/**
 * Normaliza la descripción limpiando espacios redundantes y saltos de línea innecesarios.
 */
export function normalizeDescription(desc: string): string {
  return desc
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Convierte un movimiento crudo a un ParsedMovement validado y con tipo asignado.
 */
export function normalizeMovement(raw: RawParsedMovement, index: number): ParsedMovement {
  const normalizedDate = normalizeDate(raw.fecha);
  const normalizedDesc = normalizeDescription(raw.descripcion || '');
  const parsedMonto = parseAmount(raw.monto);
  const parsedSaldo = raw.saldo !== undefined && raw.saldo !== null ? parseAmount(raw.saldo) : undefined;

  const tipo: MovementType = parsedMonto >= 0 ? 'entrada' : 'salida';
  
  // Validar si el registro tiene fecha válida y monto distinto de 0
  const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate);
  const hasValidAmount = !isNaN(parsedMonto) && parsedMonto !== 0;
  const isImportable = isValidDate && hasValidAmount && !raw.error;

  const error = !isValidDate
    ? 'Fecha inválida'
    : !hasValidAmount
    ? 'Monto no detectado o igual a cero'
    : raw.error;

  const id = `import_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    fecha: normalizedDate,
    agencia: raw.agencia ? raw.agencia.trim() : undefined,
    descripcion: normalizedDesc || 'Movimiento sin descripción',
    documento: raw.documento ? raw.documento.trim() : undefined,
    monto: parsedMonto,
    saldo: parsedSaldo,
    tipo,
    seleccionado: isImportable,
    importable: isImportable,
    error: isImportable ? undefined : (error || 'No se pudo interpretar el movimiento'),
  };
}
