import { useState } from 'react';
import { Shield, Lock, Check, Trash2, Pencil, X, Smartphone } from 'lucide-react';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../../../components/ui/input-otp';
import { Switch } from '../../../components/ui/switch';
import { useData } from '../../context';
import { sha256 } from '../utils/hash';

export function SecuritySection() {
  const { userSettings, saveUserSettings, deleteUserSettings } = useData();
  const hasExistingPin = !!userSettings?.pin;

  const [editing, setEditing] = useState(false);
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [name, setName] = useState(userSettings?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid = pin.length === 4 && confirmPin.length === 4 && pin === confirmPin;

  const handleToggleLockApp = async (checked: boolean) => {
    if (!userSettings) return;
    await saveUserSettings({
      name: userSettings.name,
      pin: userSettings.pin,
      lockApp: checked,
    });
  };

  const handleSave = async () => {
    if (!isValid || saving) return;

    setError(null);
    setSaving(true);
    try {
      const hashedPin = await sha256(pin);
      await saveUserSettings({ name, pin: hashedPin, lockApp: false });
      setSaved(true);
      setEditing(false);
      setPin('');
      setConfirmPin('');
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('[SecuritySection] Error guardando PIN:', err);
      setError('Error al guardar el PIN.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    try {
      await deleteUserSettings();
      setEditing(false);
      setPin('');
      setConfirmPin('');
      setName('');
    } catch (err) {
      console.error('[SecuritySection] Error eliminando PIN:', err);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setPin('');
    setConfirmPin('');
    setError(null);
  };

  return (
    <div className="flex-1 overflow-auto p-4 space-y-6">
      {/* Banner informativo */}
      <div className="p-4 rounded-xl border border-amber-100 dark:border-amber-950/30 bg-gradient-to-r from-amber-50 to-orange-50/50 dark:from-amber-950/20 dark:to-orange-950/10 flex gap-3 shadow-sm">
        <Shield className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="font-semibold text-sm text-amber-900 dark:text-amber-200">
            Seguridad de tus datos
          </h4>
          <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1 leading-relaxed">
            El PIN que configures se utilizará para proteger tus datos. Para <b>importar/exportar</b> tus datos y para <b>bloquear el acceso</b> a la aplicación.
          </p>
        </div>
      </div>

      {/* Configuración del PIN */}
      <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <Lock className="w-4 h-4 text-blue-500" />
            PIN de Seguridad
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {hasExistingPin 
                ? 'Actualiza tu PIN de seguridad.'
                : 'Configura un PIN de 4 dígitos para proteger tus datos.'}
          </p>
        </div>

        {/* Nombre (opcional) */}
        <div className="space-y-1.5">
          <label
            htmlFor="pin-name"
            className="text-xs font-medium text-gray-600 dark:text-gray-400"
          >
            Nombre (opcional)
          </label>
          <input
            id="pin-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: John Duglas"
            disabled={hasExistingPin && !editing}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:focus:ring-blue-400/40 dark:focus:border-blue-400 transition-colors disabled:opacity-60"
          />
        </div>

        {/* PIN display / input */}
        {hasExistingPin && !editing ? (
          /* PIN configurado - mostrar enmascarado */
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              PIN configurado
            </label>
            <div className="flex justify-center py-2">
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex h-9 w-9 items-center justify-center border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-md"
                  >
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-500">*</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Modo edición - inputs para PIN */
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {hasExistingPin ? 'Nuevo PIN de 4 dígitos' : 'PIN de 4 dígitos'}
              </label>
              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={4}
                  value={pin}
                  onChange={(value) => { setPin(value); setError(null); }}
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
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Confirmar PIN
              </label>
              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={4}
                  value={confirmPin}
                  onChange={(value) => { setConfirmPin(value); setError(null); }}
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
              {confirmPin.length === 4 && pin !== confirmPin && (
                <p className="text-[11px] text-red-500 dark:text-red-400 text-center">
                  Los PINs no coinciden
                </p>
              )}
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 rounded-lg border border-red-200 dark:border-red-950/30 bg-red-50 dark:bg-red-950/10 flex items-center gap-2 text-red-800 dark:text-red-300 text-xs font-medium">
            <span>{error}</span>
          </div>
        )}

        {/* Botones de acción */}
        {hasExistingPin && !editing ? (
          /* Modo visualización - solo botón editar y eliminar */
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all font-medium text-sm"
            >
              <Pencil className="w-4 h-4" />
              Cambiar PIN
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 active:scale-[0.98] transition-all font-medium text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Eliminar
            </button>
          </div>
        ) : hasExistingPin ? (
          /* Modo edición con PIN existente - guardar y cancelar */
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>Guardando...</>
              ) : saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Guardado
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Actualizar PIN
                </>
              )}
            </button>
          </div>
        ) : (
          /* Nuevo PIN - solo guardar */
          <button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 active:scale-[0.98] transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>Guardando...</>
            ) : saved ? (
              <>
                <Check className="w-4 h-4" />
                Guardado
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Guardar PIN
              </>
            )}
          </button>
        )}
      </div>

      {/* Bloquear APP - solo se muestra si existe PIN */}
      {hasExistingPin && (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-purple-500" />
              <div>
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                  Bloquear APP
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Solicita el PIN al abrir la aplicación
                </p>
              </div>
            </div>
            <Switch
              checked={userSettings?.lockApp ?? false}
              onCheckedChange={handleToggleLockApp}
            />
          </div>
        </div>
      )}
    </div>
  );
}
