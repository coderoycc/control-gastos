// src/pages/ImportTransactions.tsx
import { useNavigate } from 'react-router';
import { ArrowLeft, UploadCloud } from 'lucide-react';
import {
  useImportStatement,
  PdfDropzone,
  StatementMetadataCard,
  AccountSelector,
  FilterToolbar,
  MovementsTable,
  ImportTotalsSummary,
  ImportConfirmModal,
  ImportResultCard,
} from '../app/import';

export function ImportTransactions() {
  const navigate = useNavigate();

  const {
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
    setSelectedAccountId,
    applyFilter,
    toggleSelection,
    proceedToConfirm,
    cancelConfirm,
    confirmImport,
    reset,
  } = useImportStatement();

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="flex flex-col min-h-full bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-12">
      {/* Cabecera Principal */}
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (step === 'review') {
                  if (confirm('¿Deseas salir del asistente de importación? Los datos procesados se descartarán.')) {
                    navigate('/');
                  }
                } else {
                  navigate('/');
                }
              }}
              className="p-1.5 -ml-1.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h1 className="text-base sm:text-lg font-bold">Importar extracto bancario PDF</h1>
            </div>
          </div>

          {step === 'review' && (
            <button
              type="button"
              onClick={reset}
              className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </header>

      {/* Contenido según el paso del flujo */}
      <main className="max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center py-6 sm:py-10">
            <PdfDropzone
              onFileSelect={handleFileSelect}
              isProcessing={isProcessing}
              error={error}
            />
          </div>
        )}

        {(step === 'review' || step === 'confirm') && (
          <div className="flex flex-col gap-5">
            {/* Metadatos extraídos del PDF */}
            <StatementMetadataCard
              metadata={metadata}
              fileName={file?.name}
              totalMovements={movements.length}
            />

            {/* Selector de cuenta de la aplicación */}
            <AccountSelector
              accounts={accounts}
              selectedAccountId={selectedAccountId}
              onSelectAccount={setSelectedAccountId}
              error={!selectedAccountId && error ? error : null}
            />

            {/* Barra de filtros rápidos */}
            <FilterToolbar
              onApplyFilter={applyFilter}
              totalMovements={movements.length}
              selectedCount={summary.seleccionados}
              entradasCount={movements.filter((m) => m.importable && m.monto > 0).length}
              salidasCount={movements.filter((m) => m.importable && m.monto < 0).length}
              duplicadosCount={summary.duplicados}
            />

            {/* Tabla de movimientos detectados */}
            <MovementsTable
              movements={movements}
              onToggleSelection={toggleSelection}
            />

            {/* Resumen flotante de totales y confirmación */}
            <ImportTotalsSummary
              summary={summary}
              onProceed={proceedToConfirm}
              disabled={!selectedAccountId || summary.seleccionados === 0}
              isProcessing={isProcessing}
            />

            {/* Modal de confirmación previa al guardado */}
            <ImportConfirmModal
              isOpen={step === 'confirm'}
              onClose={cancelConfirm}
              onConfirm={confirmImport}
              summary={summary}
              selectedAccount={selectedAccount}
              isProcessing={isProcessing}
              error={error}
            />
          </div>
        )}

        {step === 'completed' && finalResult && (
          <div className="py-6 sm:py-10">
            <ImportResultCard
              result={finalResult}
              onReset={reset}
              accountName={selectedAccount?.name}
            />
          </div>
        )}
      </main>
    </div>
  );
}
