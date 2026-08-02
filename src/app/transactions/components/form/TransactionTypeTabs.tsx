import { TransactionType } from "../../../context";
import { TRANSACTION_TYPES } from "../../hooks/useTransactionForm";

interface TransactionTypeTabsProps {
  type: TransactionType;
  onChange: (type: TransactionType) => void;
}

export function TransactionTypeTabs({ type, onChange }: TransactionTypeTabsProps) {
  return (
    <div>
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {TRANSACTION_TYPES.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => onChange(t)}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              type === t
                ? t === "entrada"
                  ? "text-green-600 dark:text-green-400 border-b-2 border-green-600 dark:border-green-400"
                  : t === "salida"
                    ? "text-red-600 dark:text-red-400 border-b-2 border-red-600 dark:border-red-400"
                    : "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {t === "entrada"
              ? "Entrada"
              : t === "salida"
                ? "Salida"
                : "Transferencia"}
          </button>
        ))}
      </div>
    </div>
  );
}
