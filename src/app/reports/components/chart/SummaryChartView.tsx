import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { CategoryChartItem, FilterType, GroupDimension, formatCurrency, CHART_COLORS } from '../../utils/chartUtils';

interface SummaryChartViewProps {
  categoryData: CategoryChartItem[];
  totalSum: number;
  filterType: FilterType;
  totals: {
    income: number;
    expenses: number;
  };
  currentDate: Date;
  dimension: GroupDimension;
}

export function SummaryChartView({
  categoryData,
  totalSum,
  filterType,
  totals,
  currentDate,
  dimension,
}: SummaryChartViewProps) {
  const navigate = useNavigate();
  const monthParam = format(currentDate, 'yyyy-MM');

  const handleItemClick = (item: CategoryChartItem) => {
    const params = new URLSearchParams({ month: monthParam });
    if (dimension === 'tags' && item.id) {
      params.set('tagId', item.id);
    } else if (dimension === 'accounts' && item.id) {
      params.set('accountId', item.id);
    }
    if (filterType !== 'all') {
      params.set('type', filterType);
      params.set('transactionType', filterType);
    }
    navigate(`/reports/calendar?${params.toString()}`);
  };

  const income = totals.income;
  const expense = totals.expenses;
  const savings = income - expense;
  const isSalida = filterType === 'salida';
  const contrasteLabel = isSalida ? 'Total ingresos' : 'Total gastos';
  const contrasteVal = isSalida ? income : expense;
  const savingsPositive = savings >= 0;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">
        Resumen de {filterType === 'salida' ? 'gastos' : 'ingresos'}
      </p>

      {/* Total general */}
      <div
        className={`rounded-xl px-4 py-3 flex items-center justify-between mb-3 ${
          filterType === 'salida'
            ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50'
            : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50'
        }`}
      >
        <span
          className={`text-xs font-bold uppercase tracking-wide ${
            filterType === 'salida'
              ? 'text-rose-500 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          Total {filterType === 'salida' ? 'gastos' : 'ingresos'}
        </span>
        <span
          className={`text-lg font-extrabold ${
            filterType === 'salida'
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {formatCurrency(totalSum)}
        </span>
      </div>

      {/* Desglose por ítem — cada fila es clickeable */}
      <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {categoryData.map((item, idx) => {
          const pct = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
          const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
          return (
            <button
              key={idx}
              onClick={() => handleItemClick(item)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/40 active:bg-gray-100 dark:active:bg-gray-800 active:scale-[0.99] transition-all duration-150 text-left"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[140px]">
                  {item.name}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(item.value)}
                </p>
                <p className="text-xs text-gray-400 font-medium">
                  {pct.toFixed(1)}%
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Contraste y ahorro del mes */}
      <div className="mt-3 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Fila contraste */}
        <div className="px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/40">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {contrasteLabel} (mes)
          </span>
          <span
            className={`text-sm font-bold ${
              isSalida
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-500 dark:text-rose-400'
            }`}
          >
            {formatCurrency(contrasteVal)}
          </span>
        </div>

        {/* Separador */}
        <div className="border-t border-gray-100 dark:border-gray-700" />

        {/* Fila ahorro */}
        <div
          className={`px-4 py-3 flex items-center justify-between ${
            savingsPositive
              ? 'bg-emerald-50 dark:bg-emerald-950/30'
              : 'bg-rose-50 dark:bg-rose-950/30'
          }`}
        >
          <div>
            <span
              className={`text-xs font-bold uppercase tracking-wide ${
                savingsPositive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-rose-500 dark:text-rose-400'
              }`}
            >
              {savingsPositive ? '💰 Ahorro' : '⚠️ Déficit'}
            </span>
            <p className="text-2xs text-gray-400 mt-0.5">
              {savingsPositive
                ? 'Ingresos superiores a gastos'
                : 'Gastos superiores a ingresos'}
            </p>
          </div>
          <span
            className={`text-lg font-extrabold ${
              savingsPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(Math.abs(savings))}
          </span>
        </div>
      </div>
    </div>
  );
}
