import { useState, useMemo, useCallback, useEffect } from 'react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { useData } from '../../context';
import { useHorizontalSwipe } from '../../../hooks/useHorizontalSwipe';
import { useReportsDate } from '../context';
import type { ChartType, GroupDimension, FilterType, CategoryChartItem, DateChartItem } from '../utils/chartUtils';
import { CHART_COLORS } from '../utils/chartUtils';

export function useReportCharts() {
  const { transactions, accounts, labels } = useData();
  const {
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    resetToMonthView,
  } = useReportsDate();

  const [chartType, setChartType] = useState<ChartType>('pie');
  const [dimension, setDimension] = useState<GroupDimension>('tags');
  const [filterType, setFilterType] = useState<FilterType>('salida');

  useEffect(() => {
    resetToMonthView();
  }, [resetToMonthView]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const handlePreviousMonth = useCallback(() => {
    goToPreviousMonth();
  }, [goToPreviousMonth]);

  const handleNextMonth = useCallback(() => {
    goToNextMonth();
  }, [goToNextMonth]);

  const swipeHandlers = useMemo(
    () => ({
      onSwipeLeft: handleNextMonth,
      onSwipeRight: handlePreviousMonth,
    }),
    [handleNextMonth, handlePreviousMonth]
  );

  const headerRef = useHorizontalSwipe(swipeHandlers, { threshold: 50, delta: 20 });
  const summaryRef = useHorizontalSwipe(swipeHandlers, { threshold: 50, delta: 20 });
  const chartRef = useHorizontalSwipe(swipeHandlers, { threshold: 80, delta: 20 });

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [transactions, monthStart, monthEnd]);

  const totals = useMemo(() => {
    return monthTransactions.reduce(
      (acc, t) => {
        if (t.type === 'entrada') acc.income += t.amount;
        else if (t.type === 'salida') acc.expenses += t.amount;
        return acc;
      },
      { income: 0, expenses: 0 }
    );
  }, [monthTransactions]);

  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter(t => {
      if (filterType === 'all') return t.type !== 'transferencia';
      return t.type === filterType;
    });
  }, [monthTransactions, filterType]);

  const chartData = useMemo(() => {
    if (filteredTransactions.length === 0 && dimension !== 'date') {
      return [];
    }

    if (dimension === 'tags') {
      const tagMap = new Map<string, { name: string; value: number; color?: string }>();

      filteredTransactions.forEach(t => {
        if (t.labels && t.labels.length > 0) {
          t.labels.forEach(labelId => {
            const labelObj = labels.find(l => l.id === labelId);
            if (labelObj) {
              const current = tagMap.get(labelId) || {
                name: labelObj.name,
                value: 0,
                color: labelObj.color,
              };
              tagMap.set(labelId, { ...current, value: current.value + t.amount });
            }
          });
        } else {
          const labelId = 'no-tag';
          const current = tagMap.get(labelId) || {
            name: 'Sin etiqueta',
            value: 0,
            color: '#9ca3af',
          };
          tagMap.set(labelId, { ...current, value: current.value + t.amount });
        }
      });

      return Array.from(tagMap.entries())
        .sort(([, a], [, b]) => b.value - a.value)
        .map(([id, item], idx) => ({
          id,
          ...item,
          color: item.color || CHART_COLORS[idx % CHART_COLORS.length],
        }));
    } else if (dimension === 'accounts') {
      const accountMap = new Map<string, { name: string; value: number }>();

      filteredTransactions.forEach(t => {
        const accountObj = accounts.find(a => a.id === t.accountId);
        const name = accountObj ? accountObj.name : 'Cuenta Desconocida';
        const current = accountMap.get(t.accountId) || { name, value: 0 };
        accountMap.set(t.accountId, { ...current, value: current.value + t.amount });
      });

      return Array.from(accountMap.entries())
        .sort(([, a], [, b]) => b.value - a.value)
        .map(([id, item], idx) => ({
          id,
          ...item,
          color: CHART_COLORS[idx % CHART_COLORS.length],
        }));
    } else if (dimension === 'type') {
      const typeMap = {
        entrada: { name: 'Ingresos', value: 0, color: '#10b981' },
        salida: { name: 'Gastos', value: 0, color: '#ef4444' },
      };

      filteredTransactions.forEach(t => {
        if (t.type === 'entrada') {
          typeMap.entrada.value += t.amount;
        } else if (t.type === 'salida') {
          typeMap.salida.value += t.amount;
        }
      });

      return Object.values(typeMap).filter(item => item.value > 0);
    } else if (dimension === 'date') {
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      return daysInMonth.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayLabel = format(day, 'dd');

        const dayTransactions = monthTransactions.filter(t => t.date === dateStr);

        let ingresos = 0;
        let gastos = 0;

        dayTransactions.forEach(t => {
          if (t.type === 'entrada') ingresos += t.amount;
          else if (t.type === 'salida') gastos += t.amount;
        });

        return {
          name: dayLabel,
          fullDate: format(day, "dd 'de' MMMM", { locale: es }),
          Ingresos: ingresos,
          Gastos: gastos,
          Neto: ingresos - gastos,
        };
      });
    }

    return [];
  }, [filteredTransactions, dimension, labels, accounts, monthTransactions, monthStart, monthEnd]);

  const categoryData = useMemo<CategoryChartItem[]>(() => {
    return dimension !== 'date' ? (chartData as CategoryChartItem[]) : [];
  }, [chartData, dimension]);

  const dateData = useMemo<DateChartItem[]>(() => {
    return dimension === 'date' ? (chartData as DateChartItem[]) : [];
  }, [chartData, dimension]);

  const handleDimensionChange = useCallback(
    (newDimension: GroupDimension) => {
      setDimension(newDimension);
      if (newDimension === 'date') {
        setChartType('line');
      } else if (dimension === 'date') {
        setChartType('pie');
      }
    },
    [dimension]
  );

  const hasData = useMemo(() => {
    if (dimension === 'date') {
      return dateData.some(d => d.Ingresos > 0 || d.Gastos > 0);
    }
    return categoryData.length > 0;
  }, [categoryData, dateData, dimension]);

  return {
    headerRef,
    summaryRef,
    chartRef,
    currentDate,
    chartType,
    dimension,
    filterType,
    totals,
    categoryData,
    dateData,
    hasData,
    setChartType,
    setFilterType,
    handleDimensionChange,
    handlePreviousMonth,
    handleNextMonth,
  };
}
