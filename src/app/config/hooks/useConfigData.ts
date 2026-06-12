import { useState, useCallback } from 'react';
import { useData } from '../../context';
import { encodeData, decodeData } from '../utils/encryption';
import { sha256 } from '../utils/hash';

export function useConfigData() {
  const { accounts, labels, transactions, spendingLimits, importBackup, userSettings } = useData();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [importPin, setImportPin] = useState('');
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const hasPin = !!userSettings?.pin;

  const handleExport = useCallback(() => {
    try {
      setExportError(null);

      if (!hasPin) {
        setExportError('Debes configurar un PIN de seguridad en la pestaña "Seguridad" antes de exportar.');
        return;
      }

      setExporting(true);
      const backupObj = {
        version: 1,
        app: 'control-gastos',
        exportedAt: new Date().toISOString(),
        accounts,
        labels,
        transactions,
        spendingLimits,
      };

      const encoded = encodeData(backupObj, userSettings.pin);
      const blob = new Blob([encoded], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_control_gastos_${new Date().toISOString().slice(0, 10)}.dat`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar datos:', error);
      setExportError('Hubo un error al exportar los datos.');
    } finally {
      setExporting(false);
    }
  }, [accounts, labels, transactions, spendingLimits, hasPin, userSettings?.pin]);

  const processImport = useCallback(
    async (file: File, pin?: string) => {
      setImportError(null);
      setImportSuccess(false);
      setImporting(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) throw new Error('El archivo está vacío');

          const data = decodeData(text.trim(), pin) as Record<string, unknown>;

          if (!data || typeof data !== 'object') {
            throw new Error('Formato de datos no es un objeto válido');
          }
          if (data.app !== 'control-gastos') {
            throw new Error('El PIN es incorrecto o el archivo no corresponde a esta aplicación');
          }
          if (
            !Array.isArray(data.accounts) ||
            !Array.isArray(data.labels) ||
            !Array.isArray(data.transactions) ||
            !Array.isArray(data.spendingLimits)
          ) {
            throw new Error('El PIN es incorrecto o el archivo no tiene la estructura requerida');
          }

          await importBackup({
            accounts: data.accounts,
            labels: data.labels,
            transactions: data.transactions,
            spendingLimits: data.spendingLimits,
          });

          setImportSuccess(true);
        } catch (error: any) {
          console.error('Error al importar datos:', error);
          const msg = error.message || '';
          const isPinError =
            error instanceof SyntaxError ||
            msg.includes('PIN') ||
            msg.includes('JSON') ||
            msg.includes('token') ||
            msg.includes('parse') ||
            msg.includes('invalid') ||
            msg.includes('Inválido');
          setImportError(isPinError
            ? 'Imposible decodificar. PIN inválido o archivo dañado.'
            : msg || 'El archivo no es válido o está dañado.');
        } finally {
          setImporting(false);
          setPendingFile(null);
          setImportPin('');
        }
      };

      reader.onerror = () => {
        setImportError('Error al leer el archivo.');
        setImporting(false);
        setPendingFile(null);
      };

      reader.readAsText(file);
    },
    [importBackup]
  );

  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      e.target.value = '';

      setPendingFile(file);
      setShowPinModal(true);
      setImportPin('');
      setImportError(null);
      setImportSuccess(false);
    },
    []
  );

  const handleImportWithPin = useCallback(async () => {
    if (!pendingFile) return;
    const hashedPin = await sha256(importPin);
    processImport(pendingFile, hashedPin);
    setShowPinModal(false);
  }, [pendingFile, importPin, processImport]);

  const handleImportWithoutPin = useCallback(() => {
    if (!pendingFile) return;
    processImport(pendingFile, undefined);
    setShowPinModal(false);
  }, [pendingFile, processImport]);

  const cancelImport = useCallback(() => {
    setShowPinModal(false);
    setPendingFile(null);
    setImportPin('');
  }, []);

  return {
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
    setImportError,
    setImportSuccess,
  };
}
