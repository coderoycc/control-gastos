import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { CalendarDays, List } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Sector } from 'recharts';
import { CategoryChartItem, GroupDimension, FilterType, formatCurrency, CHART_COLORS } from '../../utils/chartUtils';
import { useData } from '../../../context';
import { BottomSheet } from '../../../../components';
import { CalendarTransactionList } from '../CalendarTransactionList';

interface PieChartViewProps {
  categoryData: CategoryChartItem[];
  totalSum: number;
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
  currentDate: Date;
  dimension: GroupDimension;
  filterType: FilterType;
}

function renderActiveShape(props: any) {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 14}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      stroke="white"
      strokeWidth={2.5}
      style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }}
    />
  );
}

export function PieChartView({
  categoryData,
  totalSum,
  activeIndex,
  onActiveIndexChange,
  currentDate,
  dimension,
  filterType,
}: PieChartViewProps) {
  const navigate = useNavigate();
  const monthParam = format(currentDate, 'yyyy-MM');
  const { transactions } = useData();

  const [isListOpen, setIsListOpen] = useState(false);

  const listTransactions = useMemo(() => {
    if (activeIndex === null) return [];
    const item = categoryData[activeIndex];
    if (!item) return [];

    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthStartTime = monthStart.getTime();
    const monthEndTime = monthEnd.getTime();

    return transactions.filter(tx => {
      const txDate = parseISO(tx.date);
      const txTime = txDate.getTime();
      if (txTime < monthStartTime || txTime > monthEndTime) return false;

      if (dimension === 'tags' && item.id) {
        if (item.id === 'no-tag' || item.id === '__none__') {
          if (tx.labels && tx.labels.length > 0) return false;
        } else if (!tx.labels?.includes(item.id)) {
          return false;
        }
      } else if (dimension === 'accounts' && item.id) {
        if (tx.accountId !== item.id && tx.toAccountId !== item.id) return false;
      }

      if (filterType !== 'all' && tx.type !== filterType) return false;

      return true;
    });
  }, [transactions, activeIndex, categoryData, currentDate, dimension, filterType]);

  const listIncome = useMemo(
    () => listTransactions.filter(tx => tx.type === 'entrada').reduce((sum, tx) => sum + tx.amount, 0),
    [listTransactions],
  );
  const listExpenses = useMemo(
    () => listTransactions.filter(tx => tx.type === 'salida').reduce((sum, tx) => sum + tx.amount, 0),
    [listTransactions],
  );

  const handleViewCalendar = () => {
    if (activeIndex === null) return;
    const item = categoryData[activeIndex];
    if (!item) return;

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

  const activeItem = activeIndex !== null ? categoryData[activeIndex] : null;

  return (
    <div>
      <div className="h-56 w-full" style={{ touchAction: 'none' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius="82%"
              paddingAngle={2}
              dataKey="value"
              activeIndex={activeIndex ?? undefined}
              activeShape={renderActiveShape}
              onClick={(_, index) => onActiveIndexChange(index === activeIndex ? null : index)}
            >
              {categoryData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Botones "Ver listado" y "Ver en calendario" — aparecen al seleccionar una categoría */}
      {activeItem && (
        <div className="mt-2 mb-1 flex gap-2">
          <button
            onClick={() => setIsListOpen(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: `${activeItem.color || '#6366f1'}18`,
              color: activeItem.color || '#6366f1',
              border: `1.5px solid ${activeItem.color || '#6366f1'}40`,
            }}
          >
            <List className="w-3.5 h-3.5" />
            Ver listado
          </button>
          <button
            onClick={handleViewCalendar}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 active:scale-95"
            style={{
              backgroundColor: `${activeItem.color || '#6366f1'}18`,
              color: activeItem.color || '#6366f1',
              border: `1.5px solid ${activeItem.color || '#6366f1'}40`,
            }}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Ver en calendario
          </button>
        </div>
      )}

      {/* Leyenda interactiva */}
      <div className="mt-3 space-y-1">
        {categoryData.map((item, idx) => {
          const isActive = activeIndex === idx;
          const pct = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
          const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
          return (
            <button
              key={idx}
              onClick={() => onActiveIndexChange(isActive ? null : idx)}
              className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-gray-100 dark:bg-gray-800 ring-2 ring-offset-1 ring-gray-300 dark:ring-gray-600'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 active:bg-gray-100 dark:active:bg-gray-800'
              }`}
            >
              <span
                className={`rounded-full flex-shrink-0 transition-all duration-200 ${
                  isActive ? 'w-3.5 h-3.5 ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500' : 'w-2.5 h-2.5'
                }`}
                style={{ backgroundColor: color }}
              />
              <span
                className={`flex-1 text-left text-xs truncate transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-gray-900 dark:text-white'
                    : 'font-medium text-gray-500 dark:text-gray-400'
                }`}
              >
                {item.name}
              </span>
              <span
                className={`text-xs tabular-nums transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-gray-900 dark:text-white'
                    : 'font-semibold text-gray-600 dark:text-gray-300'
                }`}
              >
                {formatCurrency(item.value)}
              </span>
              <span
                className={`text-xs tabular-nums min-w-[3rem] text-right transition-all duration-200 ${
                  isActive
                    ? 'font-bold text-gray-700 dark:text-gray-200'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {pct.toFixed(1)}%
              </span>
            </button>
          );
        })}
      </div>

      {activeItem && (
        <BottomSheet
          isOpen={isListOpen}
          onClose={() => setIsListOpen(false)}
          title={`Transacciones de "${activeItem.name}"`}
        >
          <CalendarTransactionList
            day={currentDate}
            transactions={listTransactions}
            typeParam={filterType !== 'all' ? filterType : null}
            income={listIncome}
            expenses={listExpenses}
          />
        </BottomSheet>
      )}
    </div>
  );
}
