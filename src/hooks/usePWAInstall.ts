import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem("pwa-install-dismissed") === "true";
  });
  const [platformInfo, setPlatformInfo] = useState({
    isIOS: false,
    isSafari: false,
    isFirefox: false,
    isChrome: false,
    isAndroid: false,
  });

  useEffect(() => {
    const checkStandalone = () => {
      const displayModeStandalone = window.matchMedia(
        "(display-mode: standalone)",
      ).matches;
      const navigatorStandalone = (navigator as any).standalone === true;
      setIsStandalone(displayModeStandalone || navigatorStandalone);
    };

    checkStandalone();

    const detectPlatform = () => {
      const ua = navigator.userAgent.toLowerCase();
      const isIOS = /iphone|ipad|ipod/.test(ua);
      // Safari puro no debe contener chrome o android en el userAgent
      const isSafari =
        isIOS &&
        /safari/.test(ua) &&
        !/crios|fxios|opios|twitter|fbios/i.test(ua);
      const isFirefox = /firefox|fxios/.test(ua);
      const isChrome = /chrome|crios/.test(ua) && !/edge|edg/.test(ua);
      const isAndroid = /android/.test(ua);

      setPlatformInfo({ isIOS, isSafari, isFirefox, isChrome, isAndroid });
    };

    detectPlatform();

    const checkInstalledApps = async () => {
      if ("getInstalledRelatedApps" in navigator) {
        try {
          const relatedApps = await (
            navigator as any
          ).getInstalledRelatedApps();
          if (relatedApps && relatedApps.length > 0) {
            setIsInstalled(true);
          }
        } catch (error) {
          console.warn("No se pudo verificar si la app está instalada:", error);
        }
      }
    };

    checkInstalledApps();

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      localStorage.setItem("pwa-install-dismissed", "true");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn("El prompt de instalación no está disponible todavía.");
      return false;
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (error) {
      console.error("Error al intentar instalar la PWA:", error);
    }
    return false;
  };

  const dismissBanner = () => {
    localStorage.setItem("pwa-install-dismissed", "true");
    setIsDismissed(true);
  };

  const resetDismiss = () => {
    localStorage.removeItem("pwa-install-dismissed");
    setIsDismissed(false);
  };

  const openApp = () => {
    window.open("/", "_blank");
  };

  return {
    isStandalone,
    isInstalled,
    isDismissed,
    platformInfo,
    showInstallPrompt: !!deferredPrompt,
    installApp,
    dismissBanner,
    resetDismiss,
    openApp,
  };
}
