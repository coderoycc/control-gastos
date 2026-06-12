import { useState, useEffect, useCallback } from 'react';
import { useData } from '../../context';
import { sha256 } from '../utils/hash';

/**
 * Hook que gestiona el bloqueo de la aplicación.
 * - Al iniciar: bloquea si lockApp está habilitado.
 * - Al volver de segundo plano (visibilitychange): bloquea de nuevo.
 */
export function useAppLock() {
  const { userSettings } = useData();
  const lockEnabled = !!userSettings?.lockApp && !!userSettings?.pin;

  const [isLocked, setIsLocked] = useState(lockEnabled);
  const [error, setError] = useState<string | null>(null);

  // Bloquear cuando la app vuelve a primer plano
  useEffect(() => {
    if (!lockEnabled) return;

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        setIsLocked(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [lockEnabled]);

  // Si se deshabilita el lock, desbloquear
  useEffect(() => {
    if (!lockEnabled) {
      setIsLocked(false);
    }
  }, [lockEnabled]);

  const unlock = useCallback(
    async (pin: string) => {
      if (!userSettings?.pin) return false;

      const hashed = await sha256(pin);
      if (hashed === userSettings.pin) {
        setIsLocked(false);
        setError(null);
        return true;
      } else {
        setError('PIN incorrecto');
        return false;
      }
    },
    [userSettings?.pin],
  );

  const lock = useCallback(() => {
    if (lockEnabled) {
      setIsLocked(true);
    }
  }, [lockEnabled]);

  return {
    isLocked,
    lockEnabled,
    error,
    unlock,
    lock,
    clearError: () => setError(null),
  };
}
