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
  AlertCircle,
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
  Line,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReportCharts } from '../hooks/useReportCharts';
import { formatCurrency, renderPieLabel, CHART_COLORS } from '../utils/chartUtils';

export function ChartView() {
  const {
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
  } = useReportCharts();

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* SELECTOR DE MESES — swipe + flechas */}
      <div
        ref={headerRef}
        className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between"
        style={{ touchAction: 'pan-y' }}
      >
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
        {/* RESUMEN RÁPIDO — swipeable */}
        <div
          ref={summaryRef}
          className="grid grid-cols-2 gap-3"
          style={{ touchAction: 'pan-y' }}
        >
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

        {/* SELECTOR DE DIMENSIÓN DE AGRUPACIÓN */}
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

        {/* SELECTOR DE FILTRO DE TRANSACCIONES */}
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
        <div
          ref={chartRef}
          className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col gap-4"
          style={{ touchAction: 'pan-y' }}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
              {dimension === 'tags' &&
                `Distribución por Etiquetas (${filterType === 'salida' ? 'Gastos' : filterType === 'entrada' ? 'Ingresos' : 'Todos'})`}
              {dimension === 'accounts' &&
                `Distribución por Cuentas (${filterType === 'salida' ? 'Gastos' : filterType === 'entrada' ? 'Ingresos' : 'Todos'})`}
              {dimension === 'date' && 'Evolución de Ingresos y Gastos'}
              {dimension === 'type' && 'Comparativa de Flujos'}
            </h3>

            {/* SELECTOR DE TIPO DE GRÁFICO */}
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
          <div
            className="h-64 sm:h-80 w-full flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
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
                {chartType === 'pie' && dimension !== 'date' ? (
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={dimension === 'type' ? 45 : 0}
                      outerRadius="75%"
                      paddingAngle={3}
                      dataKey="value"
                      labelLine={false}
                      label={renderPieLabel}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      trigger="click"
                      formatter={(value: number) => [formatCurrency(value), 'Monto']}
                      contentStyle={{
                        backgroundColor: 'rgba(31, 41, 55, 0.95)',
                        borderColor: '#374151',
                        borderRadius: '0.75rem',
                        color: '#f9fafb',
                      }}
                    />
                  </PieChart>
                ) : chartType === 'bar' ? (
                  dimension === 'date' ? (
                    <BarChart data={dateData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip
                        trigger="click"
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
                          color: '#f9fafb',
                        }}
                      />
                      <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                      <Bar dataKey="Ingresos" fill="#10b981" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="Gastos" fill="#ef4444" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  ) : (
                    <BarChart data={categoryData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" fontSize={10} tickLine={false} />
                      <YAxis fontSize={10} tickLine={false} />
                      <Tooltip
                        trigger="click"
                        formatter={(value: number) => [formatCurrency(value), 'Monto']}
                        contentStyle={{
                          backgroundColor: 'rgba(31, 41, 55, 0.95)',
                          borderColor: '#374151',
                          borderRadius: '0.75rem',
                          color: '#f9fafb',
                        }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {categoryData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  )
                ) : dimension === 'date' ? (
                  <LineChart data={dateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} />
                    <YAxis fontSize={10} tickLine={false} />
                    <Tooltip
                      trigger="click"
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
                        color: '#f9fafb',
                      }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Line type="monotone" dataKey="Ingresos" stroke="#10b981" strokeWidth={2.5} dot={{ r: 1 }} activeDot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Gastos" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 1 }} activeDot={{ r: 4 }} />
                  </LineChart>
                ) : (
                  <LineChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                    <XAxis dataKey="name" fontSize={10} tickLine={false} />
                    <YAxis fontSize={10} tickLine={false} />
                    <Tooltip
                      trigger="click"
                      formatter={(value: number) => [formatCurrency(value), 'Monto']}
                      contentStyle={{
                        backgroundColor: 'rgba(31, 41, 55, 0.95)',
                        borderColor: '#374151',
                        borderRadius: '0.75rem',
                        color: '#f9fafb',
                      }}
                    />
                    <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
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
                const totalSum = categoryData.reduce((acc, curr) => acc + curr.value, 0);
                const percent = totalSum > 0 ? (item.value / totalSum) * 100 : 0;

                return (
                  <div
                    key={idx}
                    className="p-3 flex items-center justify-between hover:bg-gray-50/80 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm font-semibold truncate max-w-[140px] sm:max-w-xs">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        {formatCurrency(item.value)}
                      </span>
                      <span className="text-2xs text-gray-400 block font-medium">
                        {percent.toFixed(1)}%
                      </span>
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
