export type ChartType = 'pie' | 'bar' | 'line';
export type GroupDimension = 'tags' | 'accounts' | 'date' | 'type';
export type FilterType = 'all' | 'entrada' | 'salida';
export type ViewMode = 'pie' | 'lines' | 'summary';

export const CHART_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Esmeralda / Green
  '#f59e0b', // Ámbar / Orange-Yellow
  '#ef4444', // Rojo / Red
  '#3b82f6', // Azul / Blue
  '#8b5cf6', // Violeta / Purple
  '#ec4899', // Rosa / Pink
  '#14b8a6', // Teal
  '#f97316', // Naranja
  '#06b6d4', // Cian
];

export interface CategoryChartItem {
  id?: string;
  name: string;
  value: number;
  color?: string;
}

export interface DateChartItem {
  name: string;
  fullDate: string;
  Ingresos: number;
  Gastos: number;
  Neto: number;
}

export function formatCurrency(val: number): string {
  return `$${val.toLocaleString()}`;
}

export function renderPieLabel({ name, percent }: { name: string; percent: number }): string {
  return `${name} (${(percent * 100).toFixed(0)}%)`;
}
