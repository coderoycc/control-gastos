import { Download, Upload, AlertTriangle, Check, Database, FileText, Lock } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp';
import { useConfigData } from '../hooks/useConfigData';

export function DataSection() {
  const {
    exporting,
    importing,
    importError,
    importSuccess,
    exportError,
    hasPin,
    showPinModal,
    importPin,
    setImportPin,
    handleExport,
    handleImport,
    handleImportWithPin,
    handleImportWithoutPin,
    cancelImport,
  } = useConfigData();

  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      <div className="p-4 rounded-xl border border-blue-100 dark:border-blue-950/30 bg-gradient-to-r from-blue-50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/10 flex gap-3 shadow-sm">
        <Database className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-200">
            Formato de Copia de Seguridad (.dat)
          </h4>
          <p className="text-xs text-blue-700 dark:text-blue-300/80 mt-1 leading-relaxed">
            Este archivo contiene una versión codificada de todos tus registros
            (transacciones, cuentas, etiquetas y límites). Sirve como un respaldo
            seguro de tu información financiera y puede ser utilizado para
            transferir tus datos a otros navegadores o dispositivos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Export Card */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-500" />
              Exportar Datos
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Guarda un archivo de respaldo con tu estado actual en tu dispositivo.
            </p>
          </div>

          {!hasPin && (
            <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-950 bg-amber-50/50 dark:bg-amber-950/10 flex gap-2">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal font-medium">
                <strong>PIN requerido.</strong> Para exportar tus datos cifrados,
                primero debes configurar un PIN de seguridad en la pestaña
                "Seguridad".
              </p>
            </div>
          )}

          {exportError && (
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50 dark:bg-red-950/10 flex items-center gap-2 text-red-800 dark:text-red-300 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
              <span>{exportError}</span>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all font-medium text-sm disabled:opacity-50"
          >
            {exporting ? (
              <>Generando archivo...</>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Respaldar Datos (.dat)
              </>
            )}
          </button>
        </div>

        {/* Import Card */}
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Upload className="w-4 h-4 text-orange-500" />
              Importar Datos
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Restaura tu información a partir de un archivo .dat generado previamente.
            </p>
          </div>

          <div className="p-3 rounded-lg border border-amber-200 dark:border-amber-950 bg-amber-50/50 dark:bg-amber-950/10 flex gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-normal font-medium">
              <strong>¡Atención!</strong> Importar una copia de seguridad
              sobrescribirá de forma permanente todos tus datos actuales de
              transacciones, cuentas, límites y etiquetas. Se recomienda exportar
              un respaldo primero.
            </p>
          </div>

          <div className="relative">
            <input
              type="file"
              accept=".dat"
              id="backup-upload"
              onChange={handleImport}
              className="hidden"
              disabled={importing}
            />
            <label
              htmlFor="backup-upload"
              className={`w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-400 transition-all cursor-pointer text-center ${
                importing ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <FileText className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                  {importing ? 'Importando datos...' : 'Selecciona un archivo .dat'}
                </p>
                <p className="text-[10px] text-gray-400 dark:text-gray-500">
                  Haz clic para buscar en tu dispositivo
                </p>
              </div>
            </label>
          </div>

          {importSuccess && (
            <div className="p-3 rounded-lg border border-green-200 dark:border-green-950/30 bg-green-50 dark:bg-green-950/10 flex items-center gap-2 text-green-800 dark:text-green-300 text-xs font-medium">
              <Check className="w-4 h-4 text-green-600 dark:text-green-500 flex-shrink-0" />
              <span>¡Datos importados con éxito!</span>
            </div>
          )}

          {importError && (
            <div className="p-3 rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50 dark:bg-red-950/10 flex items-center gap-2 text-red-800 dark:text-red-300 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-500 flex-shrink-0" />
              <span>Error: {importError}</span>
            </div>
          )}
        </div>
      </div>

      {/* PIN Modal for Import */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  PIN de descifrado
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ingresa el PIN con el que se cifró el archivo
                </p>
              </div>
            </div>

            <div className="flex justify-center">
              <InputOTP
                maxLength={4}
                value={importPin}
                onChange={(value) => setImportPin(value)}
                pattern="^[0-9]+$"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <div className="flex gap-2">
              <button
                onClick={cancelImport}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportWithPin}
                disabled={importing}
                className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all font-medium text-sm disabled:opacity-50"
              >
                {importing ? 'Importando...' : 'Descifrar e Importar'}
              </button>
            </div>

            <button
              onClick={handleImportWithoutPin}
              disabled={importing}
              className="w-full text-center text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              Importar sin PIN (usar clave por defecto)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
