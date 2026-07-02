import { useState, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Tag as TagIcon,
  CreditCard as CardIcon,
  MoreVertical,
  PieChart as PieChartIcon,
  AlignLeft as LinesIcon,
  BarChart2 as SummaryIcon,
  AlertCircle,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReportCharts } from '../hooks/useReportCharts';
import { formatCurrency, CHART_COLORS } from '../utils/chartUtils';

type ViewMode = 'pie' | 'lines' | 'summary';

function CustomPieLabel({
  cx, cy, midAngle, innerRadius, outerRadius, percent, name,
}: {
  cx: number; cy: number; midAngle: number;
  innerRadius: number; outerRadius: number;
  percent: number; name: string;
}) {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  const shortName = name.length > 10 ? name.slice(0, 9) + '…' : name;
  return (
    <text
      x={x} y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 10, fontWeight: 700, pointerEvents: 'none' }}
    >
      {shortName}
    </text>
  );
}

export function ChartView() {
  const {
    headerRef,
    summaryRef,
    currentDate,
    dimension,
    filterType,
    categoryData,
    totals,
    hasData,
    setFilterType,
    handleDimensionChange,
    handlePreviousMonth,
    handleNextMonth,
  } = useReportCharts();

  const [viewMode, setViewMode] = useState<ViewMode>('pie');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const totalSum = categoryData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">

      {/* ── SELECTOR DE MES (con swipe horizontal) ──────────────────── */}
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

        <span className="text-sm font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </span>

        <button
          onClick={handleNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800 transition-colors"
          aria-label="Mes siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* ── CONTENIDO ────────────────────────────────────────────────── */}
      <div
        ref={summaryRef}
        className="flex-1 overflow-auto p-4 space-y-3"
        style={{ touchAction: 'pan-y' }}
      >

        {/* ── MENÚ PRINCIPAL: Etiquetas / Cuentas ─────────────────── */}
        <div className="bg-white dark:bg-gray-900 p-1 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm flex gap-1">
          <button
            onClick={() => handleDimensionChange('tags')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              dimension === 'tags'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <TagIcon className="w-3.5 h-3.5" />
            Etiquetas
          </button>
          <button
            onClick={() => handleDimensionChange('accounts')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
              dimension === 'accounts'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <CardIcon className="w-3.5 h-3.5" />
            Cuentas
          </button>
        </div>

        {/* ── SUB-MENÚ: Salida / Entrada ───────────────────────────── */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('salida')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-200 ${
              filterType === 'salida'
                ? 'bg-rose-500 border-rose-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-rose-300 dark:hover:border-rose-700'
            }`}
          >
            <ArrowDownCircle className="w-3.5 h-3.5" />
            Salida
          </button>
          <button
            onClick={() => setFilterType('entrada')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all duration-200 ${
              filterType === 'entrada'
                ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            Entrada
          </button>
        </div>

        {/* ── CARD PRINCIPAL ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Cabecera */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                {dimension === 'tags' ? 'Por Etiquetas' : 'Por Cuentas'}
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {filterType === 'salida' ? 'Gastos · Salidas' : 'Ingresos · Entradas'}
              </p>
            </div>

            {/* Menú 3 puntos */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(prev => !prev)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Opciones de visualización"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                  {(
                    [
                      { mode: 'pie' as ViewMode, label: 'Gráfico', Icon: PieChartIcon },
                      { mode: 'lines' as ViewMode, label: 'Líneas', Icon: LinesIcon },
                      { mode: 'summary' as ViewMode, label: 'Resumen', Icon: SummaryIcon },
                    ] as { mode: ViewMode; label: string; Icon: React.ElementType }[]
                  ).map(({ mode, label, Icon }) => (
                    <button
                      key={mode}
                      onClick={() => { setViewMode(mode); setMenuOpen(false); }}
                      className={`w-full px-4 py-2.5 flex items-center gap-3 text-xs font-semibold transition-colors ${
                        viewMode === mode
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                      {viewMode === mode && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-purple-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100 dark:border-gray-800 mx-4" />

          {/* Cuerpo */}
          <div className="p-4">
            {!hasData ? (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
                <AlertCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 animate-pulse" />
                <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Sin transacciones</p>
                <p className="text-xs text-gray-400 max-w-[210px]">
                  No hay {filterType === 'salida' ? 'gastos' : 'ingresos'} registrados en este mes.
                </p>
              </div>
            ) : viewMode === 'pie' ? (
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
                        labelLine={false}
                        label={CustomPieLabel as any}
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
                          backgroundColor: 'rgba(17, 24, 39, 0.97)',
                          borderColor: '#374151',
                          borderRadius: '0.75rem',
                          color: '#f9fafb',
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Leyenda */}
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
                  {categoryData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: item.color || CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate max-w-[80px]">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : viewMode === 'lines' ? (
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">
                  Top {dimension === 'tags' ? 'categorías' : 'cuentas'} de {filterType === 'salida' ? 'gasto' : 'ingreso'}
                </p>
                {categoryData.map((item, idx) => {
                  const pct = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
                  const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
                  return (
                    <div key={idx} className="py-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[55%]">
                          {item.name}
                        </span>
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
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-3">
                  Resumen de {filterType === 'salida' ? 'gastos' : 'ingresos'}
                </p>

                {/* Total general */}
                <div className={`rounded-xl px-4 py-3 flex items-center justify-between mb-3 ${
                  filterType === 'salida'
                    ? 'bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50'
                    : 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50'
                }`}>
                  <span className={`text-xs font-bold uppercase tracking-wide ${
                    filterType === 'salida'
                      ? 'text-rose-500 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    Total {filterType === 'salida' ? 'gastos' : 'ingresos'}
                  </span>
                  <span className={`text-lg font-extrabold ${
                    filterType === 'salida'
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {formatCurrency(totalSum)}
                  </span>
                </div>

                {/* Desglose por ítem */}
                <div className="divide-y divide-gray-100 dark:divide-gray-800 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  {categoryData.map((item, idx) => {
                    const pct = totalSum > 0 ? (item.value / totalSum) * 100 : 0;
                    const color = item.color || CHART_COLORS[idx % CHART_COLORS.length];
                    return (
                      <div
                        key={idx}
                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
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
                      </div>
                    );
                  })}
                </div>

                {/* Contraste y ahorro del mes */}
                {(() => {
                  const income  = totals.income;
                  const expense = totals.expenses;
                  const savings = income - expense;
                  const isSalida = filterType === 'salida';
                  const contrasteLabel = isSalida ? 'Total ingresos' : 'Total gastos';
                  const contrasteVal   = isSalida ? income : expense;
                  const savingsPositive = savings >= 0;
                  return (
                    <div className="mt-3 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                      {/* Fila contraste */}
                      <div className="px-4 py-3 flex items-center justify-between bg-gray-50 dark:bg-gray-800/40">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                          {contrasteLabel} (mes)
                        </span>
                        <span className={`text-sm font-bold ${
                          isSalida
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-500 dark:text-rose-400'
                        }`}>
                          {formatCurrency(contrasteVal)}
                        </span>
                      </div>

                      {/* Separador */}
                      <div className="border-t border-gray-100 dark:border-gray-700" />

                      {/* Fila ahorro */}
                      <div className={`px-4 py-3 flex items-center justify-between ${
                        savingsPositive
                          ? 'bg-emerald-50 dark:bg-emerald-950/30'
                          : 'bg-rose-50 dark:bg-rose-950/30'
                      }`}>
                        <div>
                          <span className={`text-xs font-bold uppercase tracking-wide ${
                            savingsPositive
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-500 dark:text-rose-400'
                          }`}>
                            {savingsPositive ? '💰 Ahorro' : '⚠️ Déficit'}
                          </span>
                          <p className="text-2xs text-gray-400 mt-0.5">
                            {savingsPositive
                              ? 'Ingresos superiores a gastos'
                              : 'Gastos superiores a ingresos'}
                          </p>
                        </div>
                        <span className={`text-lg font-extrabold ${
                          savingsPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {formatCurrency(Math.abs(savings))}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
