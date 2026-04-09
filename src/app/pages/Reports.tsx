import { useMemo, useState, useRef } from 'react';
import { Link } from 'react-router';
import { useData } from '../context';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { TrendingUp, TrendingDown, BarChart3, PieChart, ChevronLeft, ChevronRight } from 'lucide-react';

export function Reports() {
  const { transactions } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Touch/swipe handling
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
        // Swipe left - next month
        setCurrentDate(prev => addMonths(prev, 1));
      } else {
        // Swipe right - previous month
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

      {/* Summary Cards - Large Numbers */}
      <div className="px-4 py-4 space-y-3">
        {/* Income Card */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-green-700 dark:text-green-300 mb-1">Ingresos</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${totals.income.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-700 dark:text-green-300" />
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border border-red-200 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300 mb-1">Gastos</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                ${totals.expenses.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-700 dark:text-red-300" />
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`p-4 rounded-lg ${
          balance >= 0 
            ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border border-blue-200 dark:border-blue-800'
            : 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border border-orange-200 dark:border-orange-800'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className={`text-sm mb-1 ${
                balance >= 0
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-orange-700 dark:text-orange-300'
              }`}>Balance</p>
              <p className={`text-3xl font-bold ${
                balance >= 0 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-orange-600 dark:text-orange-400'
              }`}>
                ${balance.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              balance >= 0
                ? 'bg-blue-200 dark:bg-blue-800'
                : 'bg-orange-200 dark:bg-orange-800'
            }`}>
              {balance >= 0 ? (
                <TrendingUp className="w-6 h-6 text-blue-700 dark:text-blue-300" />
              ) : (
                <TrendingDown className="w-6 h-6 text-orange-700 dark:text-orange-300" />
              )}
            </div>
          </div>
        </div>
      </div>

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