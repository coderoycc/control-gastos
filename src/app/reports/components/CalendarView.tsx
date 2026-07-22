import { useSearchParams, useNavigate } from 'react-router';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  isSameDay,
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  ChevronDown,
  X,
} from 'lucide-react';
import { useCalendarTransactions } from '../hooks/useCalendarTransactions';
import { CalendarDayCell } from './CalendarDayCell';
import { CalendarTransactionList } from './CalendarTransactionList';
import { BottomSheet } from '../../../components';
import { useData } from '../../context';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../../../components/ui/dropdown-menu';

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export interface CalendarViewProps {
  transactionType?: 'entrada' | 'salida' | 'transferencia' | null;
  accountId?: string | null;
  tagId?: string | null;
  tagValue?: string | null;
  month?: string | null;
}

export function CalendarView(props: CalendarViewProps = {}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { accounts, labels } = useData();

  const monthParam = props.month ?? searchParams.get('month');
  const tagId = props.tagId ?? searchParams.get('tagId');
  const tagValue = props.tagValue ?? searchParams.get('tagValue');
  const accountId = props.accountId ?? searchParams.get('accountId');

  // Soporta tanto 'transactionType' como 'type'
  const rawType = props.transactionType ?? searchParams.get('transactionType') ?? searchParams.get('type');
  const typeParam = (rawType === 'entrada' || rawType === 'salida' || rawType === 'transferencia')
    ? (rawType as 'entrada' | 'salida' | 'transferencia')
    : null;

  // Resolver nombre de la cuenta (si existe accountId)
  const activeAccount = accountId ? accounts.find(a => a.id === accountId) : null;

  // Resolver nombre y color de la etiqueta (si existe tagId o tagValue)
  const isNoTag = tagId === 'no-tag' || tagId === '__none__';
  const activeTag = (tagId || tagValue)
    ? (isNoTag
        ? { id: 'no-tag', name: 'Sin etiqueta', color: '#9ca3af' }
        : labels.find(
            l => l.id === tagId || (tagValue && l.name.toLowerCase() === tagValue.toLowerCase())
          ) ?? (tagValue ? { id: 'custom', name: tagValue, color: '#6366f1' } : null))
    : null;

  const {
    currentMonth,
    goToPreviousMonth,
    goToNextMonth,
    transactionsByDay,
    selectedDay,
    setSelectedDay,
    dayTransactions,
    dayTotals,
  } = useCalendarTransactions(monthParam, {
    tagId: tagId || null,
    tagValue: tagValue || null,
    accountId: accountId || null,
    transactionType: typeParam || null,
  });

  // Generar las semanas del calendario
  const calendarDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(currentMonth), { weekStartsOn: 0 }),
  });

  const handleDayClick = (day: Date) => {
    const key = format(day, 'yyyy-MM-dd');
    if (transactionsByDay[key]?.length > 0) {
      setSelectedDay(day);
    }
  };

  const handleTypeChange = (newType: 'entrada' | 'salida' | 'transferencia' | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (newType) {
      newParams.set('transactionType', newType);
      newParams.delete('type');
    } else {
      newParams.delete('transactionType');
      newParams.delete('type');
    }
    setSearchParams(newParams, { replace: true });
  };

  const handleClearFilter = (filterKey: 'accountId' | 'tag') => {
    const newParams = new URLSearchParams(searchParams);
    if (filterKey === 'accountId') newParams.delete('accountId');
    if (filterKey === 'tag') {
      newParams.delete('tagId');
      newParams.delete('tagValue');
    }
    setSearchParams(newParams, { replace: true });
  };

  const monthTitle = format(currentMonth, 'MMMM yyyy', { locale: es });

  const bottomSheetTitle = selectedDay
    ? format(selectedDay, "d 'de' MMMM", { locale: es })
    : '';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
      {/* ── Header Principal: Botón volver + Navegación de mes ── */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 flex-shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex-shrink-0"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Navegación de mes centrado */}
        <div className="flex items-center gap-1">
          <button
            onClick={goToPreviousMonth}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-base font-bold capitalize tracking-tight px-1">
            {monthTitle}
          </h2>
          <button
            onClick={goToNextMonth}
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="w-8 flex-shrink-0" />
      </div>

      {/* ── Fila de Filtro: Texto + Badge a la Izquierda y Dropdown Alineado a la Derecha ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-850 bg-gray-50/70 dark:bg-gray-900/40 flex-shrink-0">
        {/* Izquierda: Texto + Badge/Chip del parámetro */}
        <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-2">
          {activeAccount && (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">
                Cuenta:
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 max-w-[160px] truncate shadow-2xs">
                <span className="truncate">{activeAccount.name}</span>
                <button
                  type="button"
                  onClick={() => handleClearFilter('accountId')}
                  className="hover:opacity-80 p-0.5 transition-opacity"
                  aria-label="Limpiar cuenta"
                >
                  <X className="w-3 h-3 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                </button>
              </span>
            </>
          )}

          {activeTag && (
            <>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 font-medium">
                Etiqueta:
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white shadow-2xs max-w-[160px] truncate"
                style={{ backgroundColor: activeTag.color }}
              >
                <span className="truncate">{activeTag.name}</span>
                <button
                  type="button"
                  onClick={() => handleClearFilter('tag')}
                  className="hover:opacity-80 p-0.5 transition-opacity"
                  aria-label="Limpiar etiqueta"
                >
                  <X className="w-3 h-3 flex-shrink-0 text-white/90" />
                </button>
              </span>
            </>
          )}

          {!activeAccount && !activeTag && (
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
              Todas las transacciones
            </span>
          )}
        </div>

        {/* Derecha: Dropdown Filtro por Tipo de Transacción */}
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl border text-xs font-semibold transition-all ${
                  typeParam === 'entrada'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                    : typeParam === 'salida'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                    : typeParam === 'transferencia'
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100'
                }`}
              >
                {typeParam === 'entrada' && <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
                {typeParam === 'salida' && <TrendingDown className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />}
                {typeParam === 'transferencia' && <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                {!typeParam && <Filter className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />}

                <span>
                  {typeParam === 'entrada'
                    ? 'Ingresos'
                    : typeParam === 'salida'
                    ? 'Egresos'
                    : typeParam === 'transferencia'
                    ? 'Transfer.'
                    : 'Todos'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem
                onClick={() => handleTypeChange(null)}
                className={`flex items-center gap-2 text-xs cursor-pointer ${typeParam === null ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <span>Todos</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleTypeChange('entrada')}
                className={`flex items-center gap-2 text-xs cursor-pointer ${typeParam === 'entrada' ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}`}
              >
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Ingresos</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleTypeChange('salida')}
                className={`flex items-center gap-2 text-xs cursor-pointer ${typeParam === 'salida' ? 'font-bold text-rose-600 dark:text-rose-400' : ''}`}
              >
                <TrendingDown className="w-4 h-4 text-rose-500" />
                <span>Egresos</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => handleTypeChange('transferencia')}
                className={`flex items-center gap-2 text-xs cursor-pointer ${typeParam === 'transferencia' ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}
              >
                <ArrowLeftRight className="w-4 h-4 text-blue-500" />
                <span>Transferencias</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Días de la Semana ── */}
      <div className="grid grid-cols-7 px-3 pt-3 pb-2 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/30 flex-shrink-0">
        {WEEK_DAYS.map(day => (
          <div key={day} className="flex items-center justify-center">
            <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              {day}
            </span>
          </div>
        ))}
      </div>

      {/* ── Grid del Calendario (Protagonista Principal) ── */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr gap-1.5 p-3 content-stretch h-full overflow-hidden bg-white dark:bg-gray-950">
        {calendarDays.map(day => {
          const key = format(day, 'yyyy-MM-dd');
          const txs = transactionsByDay[key] ?? [];
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

          return (
            <CalendarDayCell
              key={key}
              day={day}
              transactions={txs}
              isSelected={isSelected}
              isToday={isToday(day)}
              isCurrentMonth={isSameMonth(day, currentMonth)}
              onClick={() => handleDayClick(day)}
            />
          );
        })}
      </div>

      {/* ── BottomSheet de Transacciones del Día ── */}
      <BottomSheet
        isOpen={selectedDay !== null}
        onClose={() => setSelectedDay(null)}
        title={bottomSheetTitle}
      >
        {selectedDay && (
          <CalendarTransactionList
            day={selectedDay}
            transactions={dayTransactions}
            typeParam={typeParam}
            income={dayTotals.income}
            expenses={dayTotals.expenses}
            transfers={dayTotals.balance}
          />
        )}

      </BottomSheet>
    </div>
  );
}
