import { useState, useEffect } from "react";
import { usePWAInstall } from "../hooks/usePWAInstall";
import { Download, Smartphone, X, Share, Plus, ExternalLink, Sparkles } from "lucide-react";
import { Button } from "./ui/button";

export function PWAInstallBanner() {
  const {
    isStandalone,
    isInstalled,
    isDismissed,
    platformInfo,
    showInstallPrompt,
    installApp,
    dismissBanner,
    openApp,
  } = usePWAInstall();

  const [isVisible, setIsVisible] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    if (!isStandalone && !isDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500); // Retardo de 1.5s para no saturar al cargar
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isStandalone, isDismissed]);

  if (!isVisible) return null;

  const handleInstallClick = async () => {
    if (showInstallPrompt) {
      const success = await installApp();
      if (success) {
        setIsVisible(false);
      }
    } else if (platformInfo.isIOS) {
      setShowIOSInstructions(true);
    } else {
      setShowIOSInstructions(true); 
    }
  };

  const handleOpenAppClick = () => {
    openApp();
    setIsVisible(false);
  };

  return (
    <>
      <div
        className={`fixed bottom-16 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 transition-all duration-300 transform ${
          isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
        }`}
      >
        <div className="relative flex items-center justify-between gap-2.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-2 pr-7 shadow-md">
          <div className="flex items-center gap-2 min-w-0">
            <Smartphone className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">
              {isInstalled ? "Control de Gastos instalado" : "Instalar aplicación"}
            </span>
          </div>

          <div className="flex-shrink-0">
            {isInstalled ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleOpenAppClick}
                className="h-7 px-2.5 text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center gap-1 shadow-sm"
              >
                Abrir
                <ExternalLink className="w-3 h-3" />
              </Button>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={handleInstallClick}
                className="h-7 px-2.5 text-[11px] font-medium bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center gap-1 shadow-sm"
              >
                Instalar
                <Download className="w-3 h-3" />
              </Button>
            )}
          </div>

          <button
            onClick={() => {
              setIsVisible(false);
              dismissBanner();
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/50 p-4">
          <div className="relative w-full max-w-xs overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-5 shadow-lg">
            <button
              onClick={() => setShowIOSInstructions(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full"
              aria-label="Cerrar instrucciones"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center">
              <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-50 flex items-center justify-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-blue-500" />
                Cómo instalar la aplicación
              </h3>
            </div>

            {platformInfo.isIOS ? (
              <div className="mt-4 space-y-2.5 text-[11px] text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    1
                  </span>
                  <p className="leading-relaxed">
                    Toca el botón <strong>Compartir</strong>{" "}
                    <Share className="inline-block w-3 h-3 text-blue-500" /> en Safari.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    2
                  </span>
                  <p className="leading-relaxed">
                    Selecciona <strong>Añadir a la pantalla de inicio</strong>{" "}
                    <Plus className="inline-block w-3 h-3 border border-gray-300 dark:border-gray-700 rounded-sm bg-gray-50 dark:bg-gray-800" />.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    3
                  </span>
                  <p className="leading-relaxed">
                    Presiona <strong>Añadir</strong> en la esquina superior derecha.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-[11px] text-gray-600 dark:text-gray-300">
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    1
                  </span>
                  <p className="leading-relaxed">
                    Toca el menú de <strong>tres puntos</strong> en tu navegador.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="flex items-center justify-center w-4 h-4 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold shrink-0">
                    2
                  </span>
                  <p className="leading-relaxed">
                    Selecciona <strong>Instalar</strong> o <strong>Añadir a pantalla de inicio</strong>.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4">
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowIOSInstructions(false)}
                className="w-full h-8 text-xs bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                Entendido
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
