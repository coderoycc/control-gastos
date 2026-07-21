import { AlertCircle } from 'lucide-react';
import { FilterType } from '../../utils/chartUtils';

interface EmptyChartStateProps {
  filterType: FilterType;
}

export function EmptyChartState({ filterType }: EmptyChartStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
      <AlertCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 animate-pulse" />
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Sin transacciones</p>
      <p className="text-xs text-gray-400 max-w-[210px]">
        No hay {filterType === 'salida' ? 'gastos' : 'ingresos'} registrados en este mes.
      </p>
    </div>
  );
}
