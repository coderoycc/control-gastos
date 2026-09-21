// src/app/import/types/index.ts

export type MovementType = 'entrada' | 'salida';

export interface StatementMetadata {
  titular: string | null;
  cuenta: string | null;
  producto: string | null;
  fechaDesde: string | null;
  fechaHasta: string | null;
  bancoDetectado?: string | null;
}

export interface RawParsedMovement {
  id?: string;
  fecha: string;
  agencia?: string;
  descripcion: string;
  documento?: string;
  monto: number;
  saldo?: number;
  tipo?: MovementType;
  rawText?: string;
  error?: string;
}

export interface ParsedMovement {
  id: string; // ID temporal único para la UI
  fecha: string; // Formato YYYY-MM-DD
  agencia?: string;
  descripcion: string;
  documento?: string;
  monto: number; // Positivo para entrada, negativo para salida
  saldo?: number;
  tipo: MovementType;
  seleccionado: boolean;
  importable: boolean;
  duplicado?: boolean;
  error?: string;
}

export interface ParseResult {
  movimientos: ParsedMovement[];
  metadata: StatementMetadata;
  rawCount?: number;
  errorCount?: number;
}

export interface ImportSummary {
  encontrados: number;
  seleccionados: number;
  entradasTotal: number;
  salidasTotal: number;
  cantidadEntradas: number;
  cantidadSalidas: number;
  duplicados: number;
  errores: number;
}

export type ImportStep = 'upload' | 'review' | 'confirm' | 'completed';

export interface ImportState {
  file: File | null;
  isProcessing: boolean;
  step: ImportStep;
  selectedAccountId: string;
  metadata: StatementMetadata;
  movements: ParsedMovement[];
  summary: ImportSummary;
  error: string | null;
}

export interface FinalImportResult {
  importados: number;
  omitidos: number;
  duplicados: number;
  errores: number;
}
