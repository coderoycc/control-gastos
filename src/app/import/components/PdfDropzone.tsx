// src/app/import/components/PdfDropzone.tsx
import React, { useRef, useState } from 'react';
import { Upload, FileText, Loader2, AlertCircle } from 'lucide-react';

interface PdfDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
  error?: string | null;
}

export function PdfDropzone({ onFileSelect, isProcessing, error }: PdfDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onFileSelect(file);
      } else {
        alert('Por favor selecciona un archivo PDF válido.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        onFileSelect(file);
      } else {
        alert('Por favor selecciona un archivo PDF válido.');
      }
    }
  };

  const handleClick = () => {
    if (!isProcessing && inputRef.current) {
      inputRef.current.value = '';
      inputRef.current.click();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${
          isDragOver
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
            : 'border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/10'
        } ${isProcessing ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={handleFileInputChange}
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="font-medium text-gray-800 dark:text-gray-200 text-base sm:text-lg">
              Extrayendo y procesando movimientos del PDF...
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Analizando texto, fechas, saldos y montos directamente en tu navegador.
            </p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-sm">
              <Upload className="w-8 h-8" />
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base sm:text-lg">
                Sube o arrastra tu extracto bancario en PDF
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Compatible con extractos digitales de bancos bolivianos (BNB, BCP, Mercantil Santa Cruz, Banco Unión, Ganadero, etc.).
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm transition-colors mt-2">
              <FileText className="w-4 h-4" />
              <span>Seleccionar archivo PDF</span>
            </div>

            <p className="text-xs text-gray-400 dark:text-gray-500">
              Procesamiento 100% privado y seguro en tu dispositivo. Ningún dato sale de tu navegador.
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
          <div className="flex-1">
            <p className="font-medium">Error al procesar el archivo</p>
            <p className="text-xs sm:text-sm mt-0.5 text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
