// src/app/import/hooks/useImportStatement.ts
import { useState, useCallback, useMemo } from 'react';
import { useData } from '../../context';
import {
  ImportStep,
  StatementMetadata,
  ParsedMovement,
  ImportSummary,
  FinalImportResult,
} from '../types';
import { extractTextFromPDF } from '../services/pdfExtractor';
import { parseBankStatement } from '../services/bankStatementParser';
import { detectDuplicates } from '../services/duplicateDetector';
import {
  calculateSummary,
  applySelectionFilter,
  toggleMovementSelection,
  SelectionFilterType,
} from '../services/selectionManager';

const INITIAL_METADATA: StatementMetadata = {
  titular: null,
  cuenta: null,
  producto: null,
  fechaDesde: null,
  fechaHasta: null,
  bancoDetectado: null,
};

export function useImportStatement() {
  const { transactions, accounts, addTransactionsBatch } = useData();

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<ImportStep>('upload');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [metadata, setMetadata] = useState<StatementMetadata>(INITIAL_METADATA);
  const [movements, setMovements] = useState<ParsedMovement[]>([]);
  const [finalResult, setFinalResult] = useState<FinalImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Totales calculados dinámicamente
  const summary: ImportSummary = useMemo(() => {
    return calculateSummary(movements);
  }, [movements]);

  /**
   * Procesa el archivo PDF subido, extrae el texto, ejecuta el parser bancario
   * y analiza duplicados frente a las transacciones existentes.
   */
  const handleFileSelect = useCallback(
    async (uploadedFile: File) => {
      setError(null);
      setIsProcessing(true);
      setFile(uploadedFile);

      try {
        // 1. Extraer texto de todas las páginas del PDF
        const extracted = await extractTextFromPDF(uploadedFile);

        if (!extracted.rawText || extracted.lines.length === 0) {
          throw new Error('No se pudo extraer texto del archivo PDF. Verifique que no sea un documento escaneado.');
        }

        // 2. Parsear el extracto bancario
        const parseResult = parseBankStatement(extracted.lines);

        if (parseResult.movimientos.length === 0) {
          throw new Error('No se detectaron movimientos bancarios en el documento.');
        }

        // 3. Detectar duplicados con transacciones existentes
        const withDuplicates = detectDuplicates(
          parseResult.movimientos,
          transactions,
          selectedAccountId || undefined
        );

        setMetadata(parseResult.metadata);
        setMovements(withDuplicates);
        setStep('review');

        // Si hay una sola cuenta en el sistema, preseleccionarla automáticamente
        if (!selectedAccountId && accounts.length === 1) {
          setSelectedAccountId(accounts[0].id);
        }
      } catch (err: unknown) {
        console.error('[useImportStatement] Error procesando PDF:', err);
        const message = err instanceof Error ? err.message : 'Error desconocido al procesar el archivo PDF';
        setError(message);
        setStep('upload');
      } finally {
        setIsProcessing(false);
      }
    },
    [transactions, selectedAccountId, accounts]
  );

  /**
   * Cambia la cuenta destino y actualiza la detección de duplicados para esa cuenta.
   */
  const handleAccountChange = useCallback(
    (newAccountId: string) => {
      setSelectedAccountId(newAccountId);
      setMovements((prev) => detectDuplicates(prev, transactions, newAccountId));
    },
    [transactions]
  );

  /**
   * Aplica filtros de selección rápida (todos, ninguno, solo entradas, solo salidas).
   */
  const applyFilter = useCallback((filterType: SelectionFilterType) => {
    setMovements((prev) => applySelectionFilter(prev, filterType));
  }, []);

  /**
   * Alterna la selección manual de un movimiento individual.
   */
  const toggleSelection = useCallback((id: string) => {
    setMovements((prev) => toggleMovementSelection(prev, id));
  }, []);

  /**
   * Valida e inicia el modal de confirmación.
   */
  const proceedToConfirm = useCallback(() => {
    if (!selectedAccountId) {
      setError('Debes seleccionar una cuenta para importar los movimientos.');
      return false;
    }

    const selectedCount = movements.filter((m) => m.seleccionado && m.importable).length;
    if (selectedCount === 0) {
      setError('Debes seleccionar al menos un movimiento válido para importar.');
      return false;
    }

    setError(null);
    setStep('confirm');
    return true;
  }, [selectedAccountId, movements]);

  /**
   * Cancela la confirmación y regresa a la revisión.
   */
  const cancelConfirm = useCallback(() => {
    setStep('review');
  }, []);

  /**
   * Ejecuta la persistencia definitiva de los movimientos seleccionados en IndexedDB.
   */
  const confirmImport = useCallback(async () => {
    if (!selectedAccountId) {
      setError('No se ha seleccionado una cuenta.');
      return;
    }

    const toImport = movements.filter((m) => m.seleccionado && m.importable);
    if (toImport.length === 0) {
      setError('No hay movimientos seleccionados para importar.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const newTransactions = toImport.map((m) => ({
        type: (m.monto >= 0 ? 'entrada' : 'salida') as 'entrada' | 'salida',
        date: m.fecha,
        detail: m.documento ? `[Doc: ${m.documento}] ${m.descripcion}` : m.descripcion,
        amount: Math.abs(m.monto),
        accountId: selectedAccountId,
        labels: [],
      }));

      await addTransactionsBatch(newTransactions);

      const omitidos = movements.length - toImport.length;
      const duplicados = movements.filter((m) => m.duplicado).length;
      const errores = movements.filter((m) => !m.importable).length;

      setFinalResult({
        importados: toImport.length,
        omitidos,
        duplicados,
        errores,
      });

      setStep('completed');
    } catch (err: unknown) {
      console.error('[useImportStatement] Error confirmando importación:', err);
      const message = err instanceof Error ? err.message : 'Error al guardar los movimientos en la base de datos.';
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAccountId, movements, addTransactionsBatch]);

  /**
   * Reinicia el estado completo para importar otro documento.
   */
  const reset = useCallback(() => {
    setFile(null);
    setIsProcessing(false);
    setStep('upload');
    setSelectedAccountId('');
    setMetadata(INITIAL_METADATA);
    setMovements([]);
    setFinalResult(null);
    setError(null);
  }, []);

  return {
    file,
    isProcessing,
    step,
    selectedAccountId,
    metadata,
    movements,
    summary,
    finalResult,
    error,
    accounts,
    handleFileSelect,
    setSelectedAccountId: handleAccountChange,
    applyFilter,
    toggleSelection,
    proceedToConfirm,
    cancelConfirm,
    confirmImport,
    reset,
  };
}
