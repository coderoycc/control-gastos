import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useData } from '../context/DataContext';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Tag } from 'lucide-react';

export function ReportByLabel() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { transactions, labels } = useData();
  
  const monthParam = searchParams.get('month');
  const currentDate = monthParam ? new Date(monthParam + '-01') : new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [transactions, monthStart, monthEnd]);

  const labelStats = useMemo(() => {
    const stats = new Map<string, { 
      name: string; 
      color: string; 
      amount: number; 
      count: number;
      byType: { income: number; expense: number; transfers: number };
    }>();
    
    monthTransactions.forEach(t => {
      t.labels.forEach(labelId => {
        const label = labels.find(l => l.id === labelId);
        if (label) {
          const current = stats.get(labelId) || { 
            name: label.name, 
            color: label.color, 
            amount: 0, 
            count: 0,
            byType: { income: 0, expense: 0, transfers: 0 }
          };
          
          if (t.type === 'entrada') {
            current.byType.income += t.amount;
          } else if (t.type === 'salida') {
            current.byType.expense += t.amount;
          } else {
            current.byType.transfers += t.amount;
          }
          
          stats.set(labelId, {
            ...current,
            amount: current.amount + t.amount,
            count: current.count + 1
          });
        }
      });
    });

    return Array.from(stats.values()).sort((a, b) => b.amount - a.amount);
  }, [monthTransactions, labels]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/reports')}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="font-medium">Reporte por Etiqueta</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {labelStats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <Tag className="w-12 h-12 mb-3 opacity-50" />
            <p>No hay transacciones este mes</p>
          </div>
        ) : (
          <div className="space-y-3">
            {labelStats.map((stat, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: stat.color }}
                    >
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium">{stat.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {stat.count} {stat.count === 1 ? 'transacción' : 'transacciones'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                    <p className="font-bold">
                      ${stat.amount.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {stat.byType.income > 0 && (
                    <div className="p-2 rounded bg-green-50 dark:bg-green-950/20">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Ingresos</p>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${stat.byType.income.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {stat.byType.expense > 0 && (
                    <div className="p-2 rounded bg-red-50 dark:bg-red-950/20">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Gastos</p>
                      <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                        ${stat.byType.expense.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {stat.byType.transfers > 0 && (
                    <div className="p-2 rounded bg-blue-50 dark:bg-blue-950/20">
                      <p className="text-xs text-gray-600 dark:text-gray-400">Transfer.</p>
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        ${stat.byType.transfers.toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
