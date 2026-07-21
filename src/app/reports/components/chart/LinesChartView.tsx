import { useNavigate } from 'react-router';
import { format } from 'date-fns';
import { CategoryChartItem, GroupDimension, FilterType, formatCurrency, CHART_COLORS } from '../../utils/chartUtils';

interface LinesChartViewProps {
  categoryData: CategoryChartItem[];
  totalSum: number;
  dimension: GroupDimension;
  filterType: FilterType;
  currentDate: Date;
}

export function LinesChartView({
  categoryData,
  totalSum,
  dimension,
  filterType,
  currentDate,
}: LinesChartViewProps) {
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

  return (
    <div className="space-y-1">
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">
        Top {dimension === 'tags' ? 'categorías' : 'cuentas'} de {filterType === 'salida' ? 'gasto' : 'ingreso'}
      </p>
      {categoryData.map((item, idx) => {
        const pct = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
        const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
        return (
          <button
            key={idx}
            onClick={() => handleItemClick(item)}
            className="w-full py-2 text-left rounded-xl px-2 -mx-2 transition-all duration-150 hover:bg-gray-50 dark:hover:bg-gray-800/50 active:scale-[0.98] active:bg-gray-100 dark:active:bg-gray-800"
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[55%]">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {formatCurrency(item.value)}
              </span>
            </div>
            <div className="relative h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.max(pct, 1)}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
