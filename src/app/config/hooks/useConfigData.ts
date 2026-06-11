import { useState, useCallback } from 'react';
import { useData } from '../../context';
import { encodeData, decodeData } from '../utils/encryption';

export function useConfigData() {
  const { accounts, labels, transactions, spendingLimits, importBackup } = useData();

  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleExport = useCallback(() => {
    try {
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

      const encoded = encodeData(backupObj);
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
      alert('Hubo un error al exportar los datos.');
    } finally {
      setExporting(false);
    }
  }, [accounts, labels, transactions, spendingLimits]);

  const handleImport = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setImportError(null);
      setImportSuccess(false);
      setImporting(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          if (!text) throw new Error('El archivo está vacío');

          const data = decodeData(text.trim()) as Record<string, unknown>;

          if (!data || typeof data !== 'object') {
            throw new Error('Formato de datos no es un objeto válido');
          }
          if (data.app !== 'control-gastos') {
            throw new Error('El archivo no corresponde a esta aplicación');
          }
          if (
            !Array.isArray(data.accounts) ||
            !Array.isArray(data.labels) ||
            !Array.isArray(data.transactions) ||
            !Array.isArray(data.spendingLimits)
          ) {
            throw new Error('El archivo no tiene la estructura de datos requerida');
          }

          await importBackup({
            accounts: data.accounts,
            labels: data.labels,
            transactions: data.transactions,
            spendingLimits: data.spendingLimits,
          });

          setImportSuccess(true);
          e.target.value = '';
        } catch (error: any) {
          console.error('Error al importar datos:', error);
          setImportError(error.message || 'El archivo no es válido o está dañado.');
        } finally {
          setImporting(false);
        }
      };

      reader.onerror = () => {
        setImportError('Error al leer el archivo.');
        setImporting(false);
      };

      reader.readAsText(file);
    },
    [importBackup]
  );

  return {
    exporting,
    importing,
    importError,
    importSuccess,
    handleExport,
    handleImport,
    setImportError,
    setImportSuccess,
  };
}
