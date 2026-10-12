import { useMemo } from 'react';
import { Link } from 'react-router';
import { format } from 'date-fns';
import { TrendingUp, ShoppingBag, Plus, ArrowDownCircle } from 'lucide-react';
import { useData } from '../../context';
import type { Transaction } from '../../context/types';

interface SalesPaceCardProps {
  currentDate: Date;
}

export function SalesPaceCard({ currentDate }: SalesPaceCardProps) {
  const { transactions } = useData();

  const todayStr = useMemo(() => {
    const now = new Date();
    return format(now, 'yyyy-MM-dd');
  }, []);

  const currentMonthStr = useMemo(() => {
    return format(currentDate, 'yyyy-MM');
  }, [currentDate]);

  // Cálculos de ventas de hoy y del mes
  const { todaySalesTotal, todaySalesCount, monthSalesTotal, monthSalesCount } = useMemo(() => {
    let todayTotal = 0;
    let todayCount = 0;
    let monthTotal = 0;
    let monthCount = 0;

    for (const t of transactions) {
      if (t.type === 'entrada') {
        if (t.date === todayStr) {
          todayTotal += t.amount;
          todayCount++;
        }
        if (t.date.startsWith(currentMonthStr)) {
          monthTotal += t.amount;
          monthCount++;
        }
      }
    }

    return {
      todaySalesTotal: todayTotal,
      todaySalesCount: todayCount,
      monthSalesTotal: monthTotal,
      monthSalesCount: monthCount,
    };
  }, [transactions, todayStr, currentMonthStr]);

  return (
    <div className="mx-4 mb-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800 shadow-xs">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          <span>Ritmo de Ventas</span>
        </div>

        {/* Botones de acción rápida: + Venta y + Gasto */}
        <div className="flex items-center gap-1.5">
          <Link
            to="/add?type=entrada"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
            title="Registrar una nueva venta"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Venta</span>
          </Link>
          <Link
            to="/add?type=salida"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 active:scale-95 text-gray-700 dark:text-gray-300 text-xs font-medium transition-all"
            title="Registrar un gasto"
          >
            <span>+ Gasto</span>
          </Link>
        </div>
      </div>

      {/* Métricas: Hoy vs Este Mes */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100/80 dark:border-emerald-900/40">
          <p className="text-[10px] uppercase tracking-wide font-medium text-emerald-700 dark:text-emerald-400">
            Vendido Hoy
          </p>
          <p className="text-base font-bold text-emerald-700 dark:text-emerald-300">
            ${todaySalesTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/70">
            {todaySalesCount === 0
              ? 'Aún sin ventas hoy'
              : `${todaySalesCount} ${todaySalesCount === 1 ? 'venta' : 'ventas'}`}
          </p>
        </div>

        <div className="p-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-100/80 dark:border-blue-900/40">
          <p className="text-[10px] uppercase tracking-wide font-medium text-blue-700 dark:text-blue-400">
            Vendido en el Mes
          </p>
          <p className="text-base font-bold text-blue-700 dark:text-blue-300">
            ${monthSalesTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-blue-600/80 dark:text-blue-400/70">
            {monthSalesCount === 0
              ? '0 ventas registradas'
              : `${monthSalesCount} ${monthSalesCount === 1 ? 'venta acumulada' : 'ventas acumuladas'}`}
          </p>
        </div>
      </div>
    </div>
  );
}
