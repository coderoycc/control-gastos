import { useState, useCallback, useRef } from "react";

interface SmartAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  onNegativeValue?: (originalValue: number) => void;
  autoFocus?: boolean;
  className?: string;
}

/**
 * Evalúa una expresión matemática simple con +, -, *
 * Devuelve null si la expresión es inválida o incompleta
 */
function evaluateExpression(expr: string): number | null {
  if (!expr || expr.trim() === "") return null;
  const sanitized = expr.replace(/\s/g, "");
  if (!/^[\d.+\-*]+$/.test(sanitized)) return null;

  // Necesita al menos un operador real para mostrar preview
  const hasOperator = /[+*]/.test(sanitized) || /\d-/.test(sanitized);
  if (!hasOperator) return null;

  // Expresión incompleta: termina en operador
  if (/[+\-*]$/.test(sanitized)) return null;

  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${sanitized})`)() as number;
    if (typeof result !== "number" || !isFinite(result)) return null;
    return result;
  } catch {
    return null;
  }
}

function formatResult(value: number): string {
  return parseFloat(value.toFixed(2)).toString();
}

/**
 * Input de monto con soporte de expresiones matemáticas (+, -, *).
 *
 * - type="text" + inputMode="decimal" + pattern="[0-9]*":
 *   Combinación recomendada por MDN para activar el teclado numérico
 *   en iOS y Android sin restricciones en los caracteres permitidos.
 * - Mientras hay una expresión activa, muestra el resultado flotado a la derecha.
 * - Al desenfocar, evalúa la expresión y reemplaza con el valor numérico.
 */
export function SmartAmountInput({
  value,
  onChange,
  onNegativeValue,
  autoFocus,
  className,
}: SmartAmountInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasOperator = /[+*]/.test(value) || /\d-/.test(value);
  const preview = isFocused && hasOperator ? evaluateExpression(value) : null;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Permitir solo: dígitos, punto decimal, +, -, *
      if (/^[\d.+\-*]*$/.test(raw)) {
        onChange(raw);
      }
    },
    [onChange],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const result = evaluateExpression(value);
    if (result !== null) {
      if (result < 0) {
        onNegativeValue?.(result);
        onChange(formatResult(Math.abs(result)));
      } else {
        onChange(formatResult(result));
      }
    }
  }, [value, onChange, onNegativeValue]);

  return (
    <div className="relative">
      {/*
       * type="text"           → permite caracteres +, -, *
       * inputMode="decimal"   → teclado numérico con decimal en iOS/Android
       * pattern="[0-9]*"      → fallback para iOS Safari < 12.2
       */}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        // pattern="[0-9]*"
        value={value}
        onChange={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        placeholder="0.00"
        autoFocus={autoFocus}
        className={className}
        required
      />

      {/* Preview del resultado de la expresión */}
      {preview !== null && (
        <span
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 font-mono pointer-events-none select-none"
          aria-hidden="true"
        >
          = {formatResult(preview)}
        </span>
      )}
    </div>
  );
}
