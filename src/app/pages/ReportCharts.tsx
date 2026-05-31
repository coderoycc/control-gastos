import { useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useData } from '../context';
import {
  format,
  parseISO,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  eachDayOfInterval,
  addMonths,
  subMonths,
  getDaysInMonth
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  PieChart as PieIcon,
  BarChart3 as BarIcon,
  TrendingUp as LineIcon,
  Tag as TagIcon,
  CreditCard as CardIcon,
  Calendar as CalendarIcon,
  Activity as TypeIcon,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

type ChartType = 'pie' | 'bar' | 'line';
type GroupDimension = 'tags' | 'accounts' | 'date' | 'type';
type FilterType = 'all' | 'entrada' | 'salida';

// Paleta de colores vibrantes y estéticos para el gráfico
const CHART_COLORS = [
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

export function ReportCharts() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { transactions, accounts, labels } = useData();

  // Estados de visualización del reporte
  const [chartType, setChartType] = useState<ChartType>('pie');
  const [dimension, setDimension] = useState<GroupDimension>('tags');
  const [filterType, setFilterType] = useState<FilterType>('salida'); // por defecto "gastos" ya que es lo más común de analizar

  // Obtener fecha actual desde URL o del día
  const monthParam = searchParams.get('month');
  const currentDate = useMemo(() => {
    return monthParam ? new Date(monthParam + '-01') : new Date();
  }, [monthParam]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Navegación de meses
  const handlePreviousMonth = () => {
    const prevMonth = subMonths(currentDate, 1);
    setSearchParams({ month: format(prevMonth, 'yyyy-MM') });
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentDate, 1);
    setSearchParams({ month: format(nextMonth, 'yyyy-MM') });
  };

  // Touch/swipe para cambiar de mes
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
        handleNextMonth();
      } else {
        handlePreviousMonth();
      }
    }
  };

  // 1. Filtrar transacciones por el mes actual
  const monthTransactions = useMemo(() => {
    return transactions.filter(t => {
      const date = parseISO(t.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [transactions, monthStart, monthEnd]);

  // Totales rápidos para tarjetas de resumen
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

  // 2. Filtrar transacciones por Tipo seleccionado (entrada / salida / todos)
  const filteredTransactions = useMemo(() => {
    return monthTransactions.filter(t => {
      if (filterType === 'all') return t.type !== 'transferencia'; // omitir transferencias en suma de flujos generales
      return t.type === filterType;
    });
  }, [monthTransactions, filterType]);

  // 3. Procesar datos para los gráficos según la dimensión seleccionada
  const chartData = useMemo(() => {
    if (filteredTransactions.length === 0 && dimension !== 'date') {
      return [];
    }

    if (dimension === 'tags') {
      // Agrupar por etiquetas
      const tagMap = new Map<string, { name: string; value: number; color?: string }>();
      
      filteredTransactions.forEach(t => {
        if (t.labels && t.labels.length > 0) {
          t.labels.forEach(labelId => {
            const labelObj = labels.find(l => l.id === labelId);
            if (labelObj) {
              const current = tagMap.get(labelId) || { name: labelObj.name, value: 0, color: labelObj.color };
              tagMap.set(labelId, { ...current, value: current.value + t.amount });
            }
          });
        } else {
          // Sin etiqueta
          const labelId = 'no-tag';
          const current = tagMap.get(labelId) || { name: 'Sin etiqueta', value: 0, color: '#9ca3af' };
          tagMap.set(labelId, { ...current, value: current.value + t.amount });
        }
      });

      return Array.from(tagMap.values())
        .sort((a, b) => b.value - a.value)
        .map((item, idx) => ({
          ...item,
          // Si no tiene color definido, asignar de la paleta
          color: item.color || CHART_COLORS[idx % CHART_COLORS.length]
        }));

    } else if (dimension === 'accounts') {
      // Agrupar por cuentas
      const accountMap = new Map<string, { name: string; value: number }>();

      filteredTransactions.forEach(t => {
        const accountObj = accounts.find(a => a.id === t.accountId);
        const name = accountObj ? accountObj.name : 'Cuenta Desconocida';
        const current = accountMap.get(t.accountId) || { name, value: 0 };
        accountMap.set(t.accountId, { ...current, value: current.value + t.amount });
      });

      return Array.from(accountMap.values())
        .sort((a, b) => b.value - a.value)
        .map((item, idx) => ({
          ...item,
          color: CHART_COLORS[idx % CHART_COLORS.length]
        }));

    } else if (dimension === 'type') {
      // Agrupar por tipo (Entrada vs Salida)
      // Nota: Si el filtro de tipo es 'entrada' o 'salida', este gráfico será de una sola barra/torta.
      // Pero si está en 'all', mostrará la comparativa de ingresos vs gastos.
      const typeMap = {
        entrada: { name: 'Ingresos', value: 0, color: '#10b981' },
        salida: { name: 'Gastos', value: 0, color: '#ef4444' }
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
      // Evolución temporal (Evolución diaria en el mes)
      // Generar todos los días del mes para que el gráfico sea continuo y estético
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
      
      return daysInMonth.map(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        const dayLabel = format(day, 'dd');
        
        // Filtrar transacciones de este día
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
          'Ingresos': ingresos,
          'Gastos': gastos,
          'Neto': ingresos - gastos
        };
      });
    }

    return [];
  }, [filteredTransactions, dimension, labels, accounts, monthTransactions, monthStart, monthEnd]);

  // Interfaces de tipo claras para las agrupaciones
  interface CategoryChartItem {
    name: string;
    value: number;
    color?: string;
  }

  interface DateChartItem {
    name: string;
    fullDate: string;
    Ingresos: number;
    Gastos: number;
    Neto: number;
  }

  // Variables de datos tipadas específicamente para evitar errores de unión en el JSX
  const categoryData = useMemo<CategoryChartItem[]>(() => {
    return dimension !== 'date' ? (chartData as CategoryChartItem[]) : [];
  }, [chartData, dimension]);

  const dateData = useMemo<DateChartItem[]>(() => {
    return dimension === 'date' ? (chartData as DateChartItem[]) : [];
  }, [chartData, dimension]);

  // Si cambiamos de dimensión, forzar un tipo de gráfico recomendado si es necesario.
  // Por ejemplo, para evolución temporal ('date'), Pie Chart no tiene mucho sentido, así que forzamos 'line' o 'bar'.
  const handleDimensionChange = (newDimension: GroupDimension) => {
    setDimension(newDimension);
    if (newDimension === 'date') {
      setChartType('line');
    } else if (dimension === 'date') {
      setChartType('pie');
    }
  };

  const hasData = useMemo(() => {
    if (dimension === 'date') {
      // Hay datos si al menos un día tiene ingresos o gastos mayores a 0
      return dateData.some(d => d.Ingresos > 0 || d.Gastos > 0);
    }
    return categoryData.length > 0;
  }, [categoryData, dateData, dimension]);

  // Formateador de moneda en pesos
  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  // Renderizador personalizado de etiquetas de porcentaje en PieChart
  const renderPieLabel = ({ name, percent }: { name: string; percent: number }) => {
    return `${name} (${(percent * 100).toFixed(0)}%)`;
  };

  return (
    <div
      className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* SELECTOR DE MESES */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between">
        <button
          onClick={handlePreviousMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
          aria-label="Mes anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            {format(currentDate, 'MMMM yyyy', { locale: es })}
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* RESUMEN RÁPIDO */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-2xs text-gray-500 dark:text-gray-400 font-medium uppercase">Ingresos</p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totals.income)}
              </p>
            </div>
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-3">
            <div className="p-2 bg-rose-100 dark:bg-rose-950/50 rounded-lg">
              <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-2xs text-gray-500 dark:text-gray-400 font-medium uppercase">Gastos</p>
              <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(totals.expenses)}
              </p>
            </div>
          </div>
        </div>

        {/* SELECTOR DE DIMENSIÓN DE AGRUPACIÓN (TAGS, CUENTAS, ETC.) */}
        <div className="bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex gap-1">
          <button
            onClick={() => handleDimensionChange('tags')}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              dimension === 'tags'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" />
            <span>Etiquetas</span>
          </button>

          <button
            onClick={() => handleDimensionChange('accounts')}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              dimension === 'accounts'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <CardIcon className="w-3.5 h-3.5" />
            <span>Cuentas</span>
          </button>

          <button
            onClick={() => handleDimensionChange('date')}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              dimension === 'date'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Fechas</span>
          </button>

          <button
            onClick={() => handleDimensionChange('type')}
            className={`flex-1 py-2 px-1 rounded-lg text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all ${
              dimension === 'type'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            <span>Flujos</span>
          </button>
        </div>

        {/* SELECTOR DE FILTRO DE TRANSACCIONES (GASTOS, INGRESOS, TODOS) */}
        {dimension !== 'date' && dimension !== 'type' && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Mostrar:</span>
            <div className="flex bg-gray-200/60 dark:bg-gray-800/60 p-0.5 rounded-lg border border-gray-200/20 shadow-inner max-w-xs">
              <button
                onClick={() => setFilterType('salida')}
                className={`py-1 px-3 rounded-md text-xs font-semibold transition-all ${
                  filterType === 'salida'
                    ? 'bg-white dark:bg-gray-700 text-rose-600 dark:text-rose-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Gastos
              </button>
              <button
                onClick={() => setFilterType('entrada')}
                className={`py-1 px-3 rounded-md text-xs font-semibold transition-all ${
                  filterType === 'entrada'
                    ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Ingresos
              </button>
              <button
                onClick={() => setFilterType('all')}
                className={`py-1 px-3 rounded-md text-xs font-semibold transition-all ${
                  filterType === 'all'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Ambos
              </button>
            </div>
          </div>
        )}

        {/* SECTOR GRÁFICO PRINCIPAL */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {dimension === 'tags' && `Distribución por Etiquetas (${filterType === 'salida' ? 'Gastos' : filterType === 'entrada' ? 'Ingresos' : 'Todos'})`}
              {dimension === 'accounts' && `Distribución por Cuentas (${filterType === 'salida' ? 'Gastos' : filterType === 'entrada' ? 'Ingresos' : 'Todos'})`}
              {dimension === 'date' && 'Evolución de Ingresos y Gastos'}
              {dimension === 'type' && 'Comparativa de Flujos'}
            </h3>

            {/* SELECTOR DE TIPO DE GRÁFICO (PIE, BAR, LINE) */}
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-0.5 rounded-lg border border-gray-200/50 dark:border-gray-800">
              <button
                onClick={() => setChartType('pie')}
                disabled={dimension === 'date'}
                className={`p-1.5 rounded-md transition-all ${
                  chartType === 'pie'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                } ${dimension === 'date' ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Gráfico de Torta"
              >
                <PieIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setChartType('bar')}
                className={`p-1.5 rounded-md transition-all ${
                  chartType === 'bar'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                }`}
                title="Gráfico de Barras"
              >
                <BarIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => setChartType('line')}
                className={`p-1.5 rounded-md transition-all ${
                  chartType === 'line'
                    ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white'
                }`}
                title="Gráfico de Líneas"
              >
                <LineIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* RENDERIZADO DEL GRÁFICO */}
          <div className="h-64 sm:h-80 w-full flex items-center justify-center">
            {!hasData ? (
              <div className="flex flex-col items-center justify-center text-center p-6 text-gray-500 dark:text-gray-400">
                <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-600 mb-2.5 animate-pulse" />
                <p className="text-sm font-semibold">Sin transacciones registradas</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[220px]">
                  {dimension === 'date' 
                    ? 'No se registran movimientos para graficar en este mes.' 
                    : `No hay ${filterType === 'salida' ? 'gastos' : filterType === 'entrada' ? 'ingresos' : 'movimientos'} registrados para este análisis en este mes.`}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {/* 1. GRÁFICO DE TORTA */}
                {chartType === 'pie' && dimension !== 'date' ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={dimension === 'type' ? 45 : 0} // Dona para flujos
                      outerRadius="75%"
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Monto']}
                      contentStyle={{
                        backgroundColor: 'rgba(31, 41, 55, 0.95)',
                        borderColor: '#374151',
                        borderRadius: '0.75rem',
                        color: '#f9fafb'
                      }}
                    />
                  </PieChart>
                ) : // 2. GRÁFICO DE BARRAS
                chartType === 'bar' ? (
                  dimension === 'date' ? (
                    // Barras para evolución de tiempo
                    <BarChart data={dateData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip
                        labelFormatter={(label, items) => {
                          if (items && items[0]) {
                            return items[0].payload.fullDate;
                          }
                          return `Día ${label}`;
                        }}
                        formatter={(value: number) => [formatCurrency(value), '']}
                        contentStyle={{
                          backgroundColor: 'rgba(31, 41, 55, 0.95)',
                          borderColor: '#374151',
                          borderRadius: '0.75rem',
                          color: '#f9fafb'
                        }}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Gastos" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  ) : (
                    // Barras estándar (etiquetas, cuentas, flujos)
                    <BarChart data={categoryData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Monto']}
                        contentStyle={{
                          backgroundColor: 'rgba(31, 41, 55, 0.95)',
                          borderColor: '#374151',
                          borderRadius: '0.75rem',
                          color: '#f9fafb'
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  )
                ) : (
                  // 3. GRÁFICO DE LÍNEAS
                  dimension === 'date' ? (
                    // Línea para evolución diaria
                    <LineChart data={dateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip
                        labelFormatter={(label, items) => {
                          if (items && items[0]) {
                            return items[0].payload.fullDate;
                          }
                          return `Día ${label}`;
                        }}
                        formatter={(value: number) => [formatCurrency(value), '']}
                        contentStyle={{
                          backgroundColor: 'rgba(31, 41, 55, 0.95)',
                          borderColor: '#374151',
                          borderRadius: '0.75rem',
                          color: '#f9fafb'
                        }}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Line type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2.5} dot={{ r: 1 }} activeDot={{ r: 4 }} />
                      <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 1 }} activeDot={{ r: 4 }} />
                    </LineChart>
                  ) : (
                    // Línea estándar para categorías (ordenado por monto)
                    <LineChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Monto']}
                        contentStyle={{
                          backgroundColor: 'rgba(31, 41, 55, 0.95)',
                          borderColor: '#374151',
                          borderRadius: '0.75rem',
                          color: '#f9fafb'
                        }}
                      />
                      <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  )
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* DETALLE Y LEYENDA PREMIUM */}
        {hasData && dimension !== 'date' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Detalle Analítico</span>
              <span className="text-2xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                {categoryData.length} ítems
              </span>
            </div>
            
            <div className="divide-y divide-gray-150 dark:divide-gray-800/60 max-h-60 overflow-y-auto">
              {categoryData.map((item, idx) => {
                // Calcular porcentaje
                const totalSum = categoryData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
                
                return (
                  <div key={idx} className="p-3 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-semibold truncate max-w-[140px] sm:max-w-xs">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                      <span className="text-2xs text-gray-400 block font-medium">{percent.toFixed(1)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
