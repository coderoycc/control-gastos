import { TransactionType, Label } from "../../../context";
import { TagLabel } from "../../../../components";

interface LabelSelectorProps {
  type: TransactionType;
  filteredLabels: Label[];
  selectedLabels: string[];
  toggleLabel: (id: string) => void;
}

export function LabelSelector({
  type,
  filteredLabels,
  selectedLabels,
  toggleLabel,
}: LabelSelectorProps) {
  if (type === "transferencia") return null;

  return (
    <div>
      <label className="block text-xs mb-1.5 text-gray-700 dark:text-gray-300">
        Etiqueta
      </label>
      <div className="flex flex-wrap gap-1.5">
        {filteredLabels.map((label) => {
          const isSelected = selectedLabels.includes(label.id);
          return (
            <TagLabel
              key={label.id}
              name={label.name}
              color={label.color}
              size="md"
              selected={isSelected}
              onClick={() => toggleLabel(label.id)}
            />
          );
        })}
      </div>
      {filteredLabels.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          No hay etiquetas de{" "}
          {type === "entrada" ? "ingreso" : "egreso"}. Crea etiquetas en
          Configuración.
        </p>
      )}
    </div>
  );
}
