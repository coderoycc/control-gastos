import { TrendingUp, TrendingDown, ArrowLeftRight, Wallet, RefreshCw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFinancialSummary } from '../hooks/useFinancialSummary';


export interface FinancialSummaryData {
  income: number;
  expenses: number;
  transfers?: number;
}

export interface FinancialSummaryProps {
  data?: FinancialSummaryData;
  startDate?: Date;
  endDate?: Date;
  periodLabel?: string;
}
interface MetricCardProps {
  label: string;
  value: string;
  subtext?: string;
  colorScheme: 'green' | 'red' | 'blue' | 'orange' | 'purple' | 'gray';
  icon: React.ReactNode;
}

const COLOR_MAP: Record<MetricCardProps['colorScheme'], {
  card: string;
  label: string;
  iconBg: string;
  value: string;
}> = {
  green:  { card: 'bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950/60 dark:to-emerald-900/50 border-green-200/70 dark:border-green-800/50',  label: 'text-green-700/70 dark:text-green-400/70',   iconBg: 'bg-green-200 dark:bg-green-800/80',   value: 'text-green-600 dark:text-green-400'   },
  red:    { card: 'bg-gradient-to-br from-red-50 to-rose-100 dark:from-red-950/60 dark:to-rose-900/50 border-red-200/70 dark:border-red-800/50',                label: 'text-red-700/70 dark:text-red-400/70',     iconBg: 'bg-red-200 dark:bg-red-800/80',       value: 'text-red-600 dark:text-red-400'       },
  blue:   { card: 'bg-gradient-to-br from-blue-50 to-sky-100 dark:from-blue-950/60 dark:to-sky-900/50 border-blue-200/70 dark:border-blue-800/50',             label: 'text-blue-700/70 dark:text-blue-400/70',   iconBg: 'bg-blue-200 dark:bg-blue-800/80',     value: 'text-blue-600 dark:text-blue-400'     },
  orange: { card: 'bg-gradient-to-br from-orange-50 to-amber-100 dark:from-orange-950/60 dark:to-amber-900/50 border-orange-200/70 dark:border-orange-800/50', label: 'text-orange-700/70 dark:text-orange-400/70', iconBg: 'bg-orange-200 dark:bg-orange-800/80', value: 'text-orange-600 dark:text-orange-400' },
  purple: { card: 'bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950/60 dark:to-violet-900/50 border-purple-200/70 dark:border-purple-800/50',label: 'text-purple-700/70 dark:text-purple-400/70', iconBg: 'bg-purple-200 dark:bg-purple-800/80', value: 'text-purple-600 dark:text-purple-400' },
  gray:   { card: 'bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900/60 dark:to-gray-800/50 border-gray-200/70 dark:border-gray-700/50',         label: 'text-gray-500/70 dark:text-gray-400/70',   iconBg: 'bg-gray-200 dark:bg-gray-700/80',     value: 'text-gray-700 dark:text-gray-300'     },
};

function MetricCard({ label, value, subtext, colorScheme, icon }: MetricCardProps) {
  const c = COLOR_MAP[colorScheme];
  return (
    <div className={`rounded-xl p-3 border ${c.card}`}>
      <div className="flex items-center justify-between mb-1">
        <span className={`text-[10px] font-semibold uppercase tracking-wide ${c.label}`}>{label}</span>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${c.iconBg}`}>
          {icon}
        </div>
      </div>
      <p className={`text-lg font-bold leading-none ${c.value}`}>{value}</p>
      {subtext && (
        <p className={`text-[9px] mt-1 font-medium ${c.label}`}>{subtext}</p>
      )}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="px-3 py-3">
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl p-3 border border-gray-200/60 dark:border-gray-700/40 bg-gray-50 dark:bg-gray-900/40 animate-pulse">
            <div className="flex items-center justify-between mb-2">
              <div className="h-2 w-12 rounded bg-gray-200 dark:bg-gray-700" />
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        ))}
      </div>
    </div>
  );
}


export function FinancialSummary({ data: dataProp, startDate, endDate, periodLabel }: FinancialSummaryProps) {
  const isAutonomous = dataProp === undefined;
  const { data: fetchedData, loading, error, refetch } = useFinancialSummary(
    isAutonomous ? (startDate ?? null) : null,
    isAutonomous ? (endDate ?? null) : null,
  );

  // Resuelve los datos finales
  const resolvedData: FinancialSummaryData | null = dataProp ?? (fetchedData
    ? { income: fetchedData.income, expenses: fetchedData.expenses, transfers: fetchedData.transfers }
    : null);

  // --- Estado de carga (solo modo autónomo) ---
  if (isAutonomous && loading) return <SummarySkeleton />;

  // --- Estado de error (solo modo autónomo) ---
  if (isAutonomous && error) {
    return (
      <div className="px-3 py-4 flex flex-col items-center gap-2 text-center">
        <AlertCircle className="w-6 h-6 text-red-400" />
        <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        <button
          onClick={refetch}
          className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
        >
          <RefreshCw className="w-3 h-3" /> Reintentar
        </button>
      </div>
    );
  }

  // --- Sin datos aún ---
  if (!resolvedData) return null;

  const { income, expenses, transfers } = resolvedData;
  const balance     = income - expenses;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;
  const isPositive  = balance >= 0;

  const dateRange = startDate && endDate
    ? `${format(startDate, 'd MMM', { locale: es })} – ${format(endDate, 'd MMM yyyy', { locale: es })}`
    : periodLabel ?? null;

  return (
    <div className="px-3 py-3">
      {/* Grid 2 columnas */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Ingresos"
          value={`$${income.toLocaleString()}`}
          colorScheme="green"
          icon={<TrendingUp className="w-3 h-3 text-green-700 dark:text-green-300" />}
        />

        <MetricCard
          label="Gastos"
          value={`$${expenses.toLocaleString()}`}
          colorScheme="red"
          icon={<TrendingDown className="w-3 h-3 text-red-700 dark:text-red-300" />}
        />

        <MetricCard
          label="Balance"
          value={`${isPositive ? '+' : ''}$${balance.toLocaleString()}`}
          subtext={income > 0 ? (isPositive ? `${savingsRate}% ahorro` : 'déficit') : undefined}
          colorScheme={isPositive ? 'blue' : 'orange'}
          icon={<Wallet className={`w-3 h-3 ${isPositive ? 'text-blue-700 dark:text-blue-300' : 'text-orange-700 dark:text-orange-300'}`} />}
        />

        {transfers !== undefined ? (
          <MetricCard
            label="Transfer."
            value={`$${transfers.toLocaleString()}`}
            colorScheme="purple"
            icon={<ArrowLeftRight className="w-3 h-3 text-purple-700 dark:text-purple-300" />}
          />
        ) : income > 0 ? (
          <MetricCard
            label="Consumido"
            value={`${Math.round((expenses / income) * 100)}%`}
            subtext="de los ingresos"
            colorScheme="gray"
            icon={<TrendingDown className="w-3 h-3 text-gray-500 dark:text-gray-400" />}
          />
        ) : null}
      </div>
    </div>
  );
}
