// src/app/import/services/bankStatementParser.ts
import { ParseResult, StatementMetadata, RawParsedMovement, ParsedMovement } from '../types';
import { normalizeMovement, parseAmount, normalizeDate } from './movementNormalizer';

/**
 * Patrones de líneas que deben ignorarse explícitamente (cabeceras, resúmenes, totales, etc.)
 */
const NOISE_LINE_PATTERNS = [
  /^(fecha|movimiento|ag\b|descripci[oó]n|nro\.?\s*doc|documento|monto|saldo|d[eé]bito|cr[eé]dito)/i,
  /^(total\s*cr[eé]ditos?|total\s*d[eé]bitos?|tr[aá]nsito|consultado|congelado|sobregirado|disponible|total\b)/i,
  /^(resumen|extracto\s*de\s*cuenta|estado\s*de\s*cuenta|p[aá]gina\s*\d+|hoja\s*\d+)/i,
  /^(saldo\s*anterior|saldo\s*inicial|saldo\s*final|saldo\s*disponible|saldo\s*contable)/i,
  /^(banco\s*nacional\s*de\s*bolivia|banco\s*mercantil|banco\s*de\s*cr[eé]dito|banco\s*uni[oó]n|banco\s*ganadero|banco\s*bisa|banco\s*sol|banco\s*econ[oó]mico)/i,
  /^[-=_*#\s]{4,}$/, // Separadores visuales
  /^(\s*[-+]?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*){2,}$/, // Resúmenes de saldos/balances puramente numéricos
];

/**
 * Expresión regular para detectar fechas al inicio de una línea (DD/MM/YYYY, DD-MM-YYYY, DD/MM/YY, YYYY-MM-DD)
 */
const DATE_START_REGEX = /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})\b/;

/**
 * Expresión regular para detectar montos numéricos (ej: -90.00, 10,605.68, 1.250,50, 90.00-)
 */
const AMOUNT_REGEX = /[-+]?\s*\(?\s*\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\s*\)?[-+]?/g;

/**
 * Extrae los metadatos generales del extracto bancario (Titular, Nro de cuenta, Período, Banco).
 */
export function extractStatementMetadata(lines: string[]): StatementMetadata {
  const metadata: StatementMetadata = {
    titular: null,
    cuenta: null,
    producto: null,
    fechaDesde: null,
    fechaHasta: null,
    bancoDetectado: null,
  };

  const fullText = lines.slice(0, 30).join(' '); // Buscar metadatos en las primeras líneas

  // Detección de Banco
  if (/banco nacional de bolivia|bnb/i.test(fullText)) {
    metadata.bancoDetectado = 'Banco Nacional de Bolivia (BNB)';
  } else if (/banco de cr[eé]dito|bcp/i.test(fullText)) {
    metadata.bancoDetectado = 'Banco de Crédito (BCP)';
  } else if (/mercantil\s*santa\s*cruz|bmsc/i.test(fullText)) {
    metadata.bancoDetectado = 'Banco Mercantil Santa Cruz';
  } else if (/banco\s*uni[oó]n/i.test(fullText)) {
    metadata.bancoDetectado = 'Banco Unión';
  } else if (/banco\s*ganadero/i.test(fullText)) {
    metadata.bancoDetectado = 'Banco Ganadero';
  } else if (/banco\s*bisa/i.test(fullText)) {
    metadata.bancoDetectado = 'Banco Bisa';
  }

  // Detección de Titular
  const titularMatch = fullText.match(/(?:titular|nombre|se[nñ]or(?:\(a\))?|cliente)[:\s]+([A-ZÁÉÍÓÚÑ\s]{3,40})(?=\s+(?:cuenta|cta|nro|desde|per[ií]odo|moneda|\d|$))/i);
  if (titularMatch && titularMatch[1]) {
    metadata.titular = titularMatch[1].trim();
  }

  // Detección de Cuenta
  const cuentaMatch = fullText.match(/(?:cuenta|nro\.?\s*cuenta|cta\.?\s*(?:cte|ahorros?)?|nro\.)[:\s]*([0-9\-]{6,25})/i);
  if (cuentaMatch && cuentaMatch[1]) {
    metadata.cuenta = cuentaMatch[1].trim();
  }

  // Detección de Producto
  const productoMatch = fullText.match(/(cuenta\s*corriente|caja\s*de\s*ahorro|cuenta\s*de\s*ahorros|cuentas\s*a\s*plazo)/i);
  if (productoMatch && productoMatch[1]) {
    metadata.producto = productoMatch[1].trim();
  }

  // Detección de Rango de Fechas (Desde / Hasta)
  const rangoMatch = fullText.match(/(?:desde|del)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\s*(?:hasta|al)[:\s]*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/i);
  if (rangoMatch) {
    metadata.fechaDesde = normalizeDate(rangoMatch[1]);
    metadata.fechaHasta = normalizeDate(rangoMatch[2]);
  }

  return metadata;
}

/**
 * Determina si una línea es ruido (cabecera, pie de página, total general).
 */
export function isNoiseLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return NOISE_LINE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/**
 * Parsea una línea principal de movimiento o un bloque continuo de movimiento.
 * Estructura esperada en banca boliviana / estándar:
 * [Fecha] [AG (opcional)] [Descripción...] [Nro Doc (opcional)] [Monto] [Saldo (opcional)]
 */
export function parseMovementBlock(blockText: string): RawParsedMovement | null {
  const trimmed = blockText.trim();
  const dateMatch = trimmed.match(DATE_START_REGEX);
  if (!dateMatch) return null;

  const rawDate = dateMatch[1];
  let remainder = trimmed.substring(dateMatch[0].length).trim();

  // Detectar agencia si se encuentra al inicio del remanente (ej. "LPZ", "SCZ", "CBBA", "CBB", "001", "AG01")
  let agencia: string | undefined;
  const agenciaMatch = remainder.match(/^([A-Z]{2,4}|\d{2,4})\b/);
  if (agenciaMatch && agenciaMatch[1] && !/^\d{5,}$/.test(agenciaMatch[1])) {
    agencia = agenciaMatch[1];
    remainder = remainder.substring(agenciaMatch[0].length).trim();
  }

  // Buscar todos los números compatibles con montos al final o dentro de la línea
  const tokens = remainder.split(/\s+/);
  if (tokens.length === 0) {
    return {
      fecha: rawDate,
      agencia,
      descripcion: '',
      monto: 0,
      error: 'Movimiento sin datos de monto',
    };
  }

  // Extraer números desde el final hacia adelante
  const numericSuffixes: { index: number; valueStr: string; valueNum: number }[] = [];
  
  for (let i = tokens.length - 1; i >= 0; i--) {
    const token = tokens[i];
    // Verificar si el token tiene formato numérico/moneda (contiene dígitos y posiblemente . o , o signo)
    if (/^[-+]?\(?Bs\.?\$?\d+([.,]\d+)?\)?[-+]?$/i.test(token) || /^[-+]?\(?\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?\)?[-+]?$/.test(token)) {
      const num = parseAmount(token);
      if (!isNaN(num)) {
        numericSuffixes.unshift({ index: i, valueStr: token, valueNum: num });
      }
    } else {
      // Si encontramos un token no numérico, nos detenemos si ya tenemos al menos 1 o 2 números al final
      if (numericSuffixes.length >= 1) {
        break;
      }
    }
  }

  let monto = 0;
  let saldo: number | undefined;
  let descTokens: string[] = [];
  let documento: string | undefined;

  if (numericSuffixes.length >= 3) {
    // Formato [Débito, Crédito, Saldo]: el último es saldo, el anterior crédito, y el primero débito
    const debito = numericSuffixes[numericSuffixes.length - 3].valueNum;
    const credito = numericSuffixes[numericSuffixes.length - 2].valueNum;
    saldo = numericSuffixes[numericSuffixes.length - 1].valueNum;
    if (credito > 0) {
      monto = credito;
    } else if (debito > 0) {
      monto = -Math.abs(debito);
    } else {
      monto = debito !== 0 ? debito : credito;
    }
    const splitIndex = numericSuffixes[numericSuffixes.length - 3].index;
    descTokens = tokens.slice(0, splitIndex);
  } else if (numericSuffixes.length === 2) {
    // El penúltimo es monto y el último es saldo
    monto = numericSuffixes[numericSuffixes.length - 2].valueNum;
    saldo = numericSuffixes[numericSuffixes.length - 1].valueNum;
    const splitIndex = numericSuffixes[numericSuffixes.length - 2].index;
    descTokens = tokens.slice(0, splitIndex);
  } else if (numericSuffixes.length === 1) {
    // Solo se detectó monto (la columna Saldo fue excluida o no está presente)
    monto = numericSuffixes[0].valueNum;
    descTokens = tokens.slice(0, numericSuffixes[0].index);
  } else {
    // Fallback con regex global de montos
    const amountMatches = Array.from(remainder.matchAll(AMOUNT_REGEX));
    if (amountMatches.length >= 2) {
      monto = parseAmount(amountMatches[amountMatches.length - 2][0]);
      saldo = parseAmount(amountMatches[amountMatches.length - 1][0]);
    } else if (amountMatches.length === 1) {
      monto = parseAmount(amountMatches[0][0]);
    }
    descTokens = tokens;
  }

  // Si entre los últimos tokens de descripción hay un número de documento (ej: "646534" o "5742431970")
  if (descTokens.length > 0) {
    const lastToken = descTokens[descTokens.length - 1];
    if (/^\d{4,12}$/.test(lastToken)) {
      documento = lastToken;
      descTokens.pop();
    }
  }

  const descripcion = descTokens.join(' ').trim();

  return {
    fecha: rawDate,
    agencia,
    descripcion: descripcion || 'Movimiento bancario',
    documento,
    monto,
    saldo,
    rawText: trimmed,
  };
}

/**
 * Función principal del parser: Recibe el texto extraído (string continuo o array de líneas)
 * y devuelve los movimientos normalizados y los metadatos del extracto.
 */
export function parseBankStatement(source: string | string[]): ParseResult {
  const lines: string[] = Array.isArray(source)
    ? source
    : source.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const metadata = extractStatementMetadata(lines);
  const rawMovements: RawParsedMovement[] = [];

  let currentMovementBlock: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Verificar si es una línea de ruido (cabeceras, resúmenes, totales)
    if (isNoiseLine(line)) {
      // Cerrar inmediatamente el movimiento anterior para no contaminarlo con totales o balances
      if (currentMovementBlock) {
        const parsed = parseMovementBlock(currentMovementBlock);
        if (parsed) {
          rawMovements.push(parsed);
        }
        currentMovementBlock = null;
      }
      continue;
    }

    // Verificar si la línea comienza con una fecha (inicio de un nuevo movimiento)
    if (DATE_START_REGEX.test(line)) {
      if (currentMovementBlock) {
        const parsed = parseMovementBlock(currentMovementBlock);
        if (parsed) {
          rawMovements.push(parsed);
        }
      }
      currentMovementBlock = line;
    } else if (currentMovementBlock) {
      // Línea de continuación (descripción multilínea)
      currentMovementBlock += ` ${line}`;
    }
  }

  // Procesar el último bloque acumulado
  if (currentMovementBlock) {
    const parsed = parseMovementBlock(currentMovementBlock);
    if (parsed) {
      rawMovements.push(parsed);
    }
  }

  // Normalizar y validar todos los movimientos
  const normalizedMovements: ParsedMovement[] = rawMovements.map((raw, index) =>
    normalizeMovement(raw, index)
  );

  const errorCount = normalizedMovements.filter((m) => !m.importable).length;

  return {
    movimientos: normalizedMovements,
    metadata,
    rawCount: normalizedMovements.length,
    errorCount,
  };
}
