import { useState } from 'react';
import { useReportCharts } from '../hooks/useReportCharts';
import { ViewMode } from '../utils/chartUtils';
import { MonthSelector } from './chart/MonthSelector';
import { DimensionSelector } from './chart/DimensionSelector';
import { TypeFilterSelector } from './chart/TypeFilterSelector';
import { ViewModeDropdown } from './chart/ViewModeDropdown';
import { EmptyChartState } from './chart/EmptyChartState';
import { PieChartView } from './chart/PieChartView';
import { LinesChartView } from './chart/LinesChartView';
import { SummaryChartView } from './chart/SummaryChartView';

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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const totalSum = categoryData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* ── SELECTOR DE MES (con swipe horizontal) ──────────────────── */}
      <MonthSelector
        headerRef={headerRef}
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
      />

      {/* ── CONTENIDO ────────────────────────────────────────────────── */}
      <div
        ref={summaryRef}
        className="flex-1 overflow-auto p-4 space-y-3"
        style={{ touchAction: 'pan-y' }}
      >
        {/* ── MENÚ PRINCIPAL: Etiquetas / Cuentas ─────────────────── */}
        <DimensionSelector
          dimension={dimension}
          onDimensionChange={handleDimensionChange}
        />

        {/* ── SUB-MENÚ: Salida / Entrada ───────────────────────────── */}
        <TypeFilterSelector
          filterType={filterType}
          onFilterTypeChange={setFilterType}
        />

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
            <ViewModeDropdown
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Separador */}
          <div className="border-t border-gray-100 dark:border-gray-800 mx-4" />

          {/* Cuerpo */}
          <div className="p-4">
            {!hasData ? (
              <EmptyChartState filterType={filterType} />
            ) : viewMode === 'pie' ? (
              <PieChartView
                categoryData={categoryData}
                totalSum={totalSum}
                activeIndex={activeIndex}
                onActiveIndexChange={setActiveIndex}
                currentDate={currentDate}
                dimension={dimension}
                filterType={filterType}
              />
            ) : viewMode === 'lines' ? (
              <LinesChartView
                categoryData={categoryData}
                totalSum={totalSum}
                dimension={dimension}
                filterType={filterType}
                currentDate={currentDate}
              />
            ) : (
              <SummaryChartView
                categoryData={categoryData}
                totalSum={totalSum}
                filterType={filterType}
                totals={totals}
                currentDate={currentDate}
                dimension={dimension}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
