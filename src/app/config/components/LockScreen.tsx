import { useState } from 'react';
import { Lock } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp';
import { useAppLock } from '../hooks/useAppLock';

export function LockScreen() {
  const { isLocked, error, unlock, clearError } = useAppLock();
  const [pin, setPin] = useState('');
  const [verifying, setVerifying] = useState(false);

  if (!isLocked) return null;

  const handleChange = async (value: string) => {
    setPin(value);
    clearError();

    if (value.length === 4) {
      setVerifying(true);
      const success = await unlock(value);
      if (!success) {
        setPin('');
      }
      setVerifying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Icono */}
      <div className="mb-8 p-4 rounded-full bg-blue-600/20 border border-blue-500/30">
        <Lock className="w-10 h-10 text-blue-400" />
      </div>

      {/* Título */}
      <h1 className="text-xl font-semibold text-white mb-2">
        App bloqueada
      </h1>
      <p className="text-sm text-gray-400 mb-8">
        Ingresa tu PIN para desbloquear
      </p>

      {/* Input PIN */}
      <div className="mb-4">
        <InputOTP
          maxLength={4}
          value={pin}
          onChange={handleChange}
          disabled={verifying}
          pattern="^[0-9]+$"
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} className="h-12 w-12 text-lg bg-gray-800 border-gray-700 text-white" />
            <InputOTPSlot index={1} className="h-12 w-12 text-lg bg-gray-800 border-gray-700 text-white" />
            <InputOTPSlot index={2} className="h-12 w-12 text-lg bg-gray-800 border-gray-700 text-white" />
            <InputOTPSlot index={3} className="h-12 w-12 text-lg bg-gray-800 border-gray-700 text-white" />
          </InputOTPGroup>
        </InputOTP>
      </div>

      {/* Estado */}
      {verifying && (
        <p className="text-xs text-blue-400 animate-pulse">Verificando...</p>
      )}

      {error && (
        <p className="text-xs text-red-400 mt-2">{error}</p>
      )}
    </div>
  );
}
