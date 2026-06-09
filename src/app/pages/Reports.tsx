import { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router';
import { useData } from '../context';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { BarChart3, PieChart, ChevronLeft, ChevronRight } from 'lucide-react';
import { FinancialSummary } from '../../components';

export function Reports() {
  const { transactions } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        setCurrentDate(prev => addMonths(prev, 1));
      } else {
        setCurrentDate(prev => subMonths(prev, 1));
      }
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => addMonths(prev, 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [transactions, monthStart, monthEnd]);

  const totals = useMemo(() => {
    return monthTransactions.reduce((acc, t) => {
      if (t.type === 'entrada') {
        acc.income += t.amount;
      } else if (t.type === 'salida') {
        acc.expenses += t.amount;
      } else {
        acc.transfers += t.amount;
      }
      return acc;
    }, { income: 0, expenses: 0, transfers: 0 });
  }, [monthTransactions]);

  const balance = totals.income - totals.expenses;

  return (
    <div 
      className="flex flex-col h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Month Header - Compact */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={handlePreviousMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-center">
            <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
              01
            </span>
            <span className="text-2xl font-bold uppercase tracking-wide">
              {format(currentDate, 'MMMM', { locale: es })}
            </span>
            <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
              {getDaysInMonth(currentDate)}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          {format(currentDate, 'yyyy', { locale: es })}
        </p>
      </div>

      {/* Summary Cards - Compact Grid */}
      <FinancialSummary
        data={{
          income: totals.income,
          expenses: totals.expenses,
          transfers: totals.transfers,
        }}
        startDate={monthStart}
        endDate={monthEnd}
      />

      {/* Report Options */}
      <div className="flex-1 overflow-auto px-4 pb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Reportes
        </h3>
        
        <div className="space-y-3">
          <Link
            to={`/reports/by-account?month=${format(currentDate, 'yyyy-MM')}`}
            className="block p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold">Reporte Detalle</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Ver desglose completo de transacciones
                </p>
              </div>
            </div>
          </Link>

          <Link
            to={`/reports/charts?month=${format(currentDate, 'yyyy-MM')}`}
            className="block p-5 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg bg-purple-100 dark:bg-purple-950 flex items-center justify-center">
                <PieChart className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-lg font-semibold">Reporte Gráfico</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  Visualizar con gráficos (tortas, líneas)
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}