// src/app/import/components/StatementMetadataCard.tsx
import { StatementMetadata } from '../types';
import { Building2, User, CreditCard, Calendar, FileText } from 'lucide-react';

interface StatementMetadataCardProps {
  metadata: StatementMetadata;
  fileName?: string;
  totalMovements: number;
}

export function StatementMetadataCard({
  metadata,
  fileName,
  totalMovements,
}: StatementMetadataCardProps) {
  const hasMetadata =
    metadata.titular ||
    metadata.cuenta ||
    metadata.bancoDetectado ||
    metadata.fechaDesde ||
    metadata.fechaHasta;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Información del Extracto</span>
          {fileName && (
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400 truncate max-w-[200px] sm:max-w-xs">
              ({fileName})
            </span>
          )}
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          {totalMovements} {totalMovements === 1 ? 'movimiento detectado' : 'movimientos detectados'}
        </span>
      </div>

      {hasMetadata ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs sm:text-sm">
          {metadata.bancoDetectado && (
            <div className="flex items-start gap-2">
              <Building2 className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Banco</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {metadata.bancoDetectado}
                </p>
              </div>
            </div>
          )}

          {metadata.titular && (
            <div className="flex items-start gap-2">
              <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Titular</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                  {metadata.titular}
                </p>
              </div>
            </div>
          )}

          {metadata.cuenta && (
            <div className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Nro. de Cuenta (PDF)</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 font-mono">
                  {metadata.cuenta}
                </p>
              </div>
            </div>
          )}

          {(metadata.fechaDesde || metadata.fechaHasta) && (
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Período</p>
                <p className="font-medium text-gray-800 dark:text-gray-200">
                  {metadata.fechaDesde || 'Inicio'} → {metadata.fechaHasta || 'Fin'}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400 pt-3">
          Documento procesado correctamente sin metadatos de cabecera explícitos.
        </p>
      )}
    </div>
  );
}
