import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useData } from '../context';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { Summary } from '../components/Summary';
import { TransactionTable } from '../components/TransactionTable';
import { SwipeableContainer } from '../../components';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidDate(dateStr: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
}

// ---------------------------------------------------------------------------
// Sub-componente: modal de filtro de fechas
// ---------------------------------------------------------------------------

interface DateFilterModalProps {
  allTransactions: boolean;
  dateRange: { start: string; end: string };
  dateError: string;
  onToggleAll: (checked: boolean) => void;
  onDateChange: (field: 'start' | 'end', value: string) => void;
  onApply: () => void;
  onClose: () => void;
}

function DateFilterModal({
  allTransactions, dateRange, dateError,
  onToggleAll, onDateChange, onApply, onClose,
}: DateFilterModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-medium">Filtrar por Fecha</h3>
        </div>
        <div className="p-4 space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={allTransactions}
              onChange={(e) => onToggleAll(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="flex-1 text-sm">Todas las transacciones</span>
          </label>

          {!allTransactions && (
            <div className="space-y-3">
              {(['start', 'end'] as const).map((field) => (
                <div key={field}>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {field === 'start' ? 'Fecha Inicio' : 'Fecha Fin'}
                  </label>
                  <input
                    type="date"
                    value={dateRange[field]}
                    onChange={(e) => onDateChange(field, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm bg-white dark:bg-gray-950 ${
                      dateError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                </div>
              ))}
            </div>
          )}

          {dateError && (
            <p className="text-xs text-red-600 dark:text-red-400 text-center">{dateError}</p>
          )}

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={onApply}
              className="flex-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componente: modal selector de cuenta
// ---------------------------------------------------------------------------

interface AccountMenuModalProps {
  accounts: { id: string; name: string; detail: string }[];
  currentIndex: number;
  onSelect: (index: number) => void;
  onClose: () => void;
}

function AccountMenuModal({ accounts, currentIndex, onSelect, onClose }: AccountMenuModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm max-h-[60vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <h3 className="font-medium">Seleccionar Cuenta</h3>
        </div>
        <div className="p-2">
          {accounts.map((account, index) => (
            <button
              key={account.id}
              onClick={() => { onSelect(index); onClose(); }}
              className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                index === currentIndex
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <p className="font-medium">{account.name}</p>
              {account.detail && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{account.detail}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Página principal
// ---------------------------------------------------------------------------

export function ReportByAccount() {
  const [searchParams] = useSearchParams();
  const { transactions, accounts, labels } = useData();

  // Mes recibido desde Reports (sincronizado)
  const monthParam = searchParams.get('month');
  const currentDate = monthParam ? new Date(monthParam + '-01') : new Date();
  const monthStart  = startOfMonth(currentDate);
  const monthEnd    = endOfMonth(currentDate);

  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [showAccountMenu, setShowAccountMenu]          = useState(false);
  const [showDateFilter, setShowDateFilter]            = useState(false);
  const [allTransactions, setAllTransactions]          = useState(false);
  const [dateRange, setDateRange] = useState({
    start: format(monthStart, 'yyyy-MM-dd'),
    end:   format(monthEnd,   'yyyy-MM-dd'),
  });
  const [dateError, setDateError] = useState('');

  // --- Navegación de cuentas ---
  const prev = () => setCurrentAccountIndex(i => (i > 0 ? i - 1 : accounts.length - 1));
  const next = () => setCurrentAccountIndex(i => (i < accounts.length - 1 ? i + 1 : 0));

  const currentAccount = accounts[currentAccountIndex];

  // --- Filtrado de transacciones ---
  const accountTransactions = useMemo(() => {
    if (!currentAccount) return [];

    const filterStart = parseISO(dateRange.start);
    const filterEnd   = parseISO(dateRange.end);
    const rangeValid  = !isNaN(filterStart.getTime()) && !isNaN(filterEnd.getTime());

    return transactions
      .filter(t => {
        if (t.accountId !== currentAccount.id) return false;
        if (allTransactions || !rangeValid) return true;
        return isWithinInterval(parseISO(t.date), { start: filterStart, end: filterEnd });
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentAccount, dateRange, allTransactions]);

  const totals = useMemo(() =>
    accountTransactions.reduce(
      (acc, t) => {
        if (t.type === 'entrada') acc.income  += t.amount;
        if (t.type === 'salida')  acc.expense += t.amount;
        return acc;
      },
      { income: 0, expense: 0 }
    ),
    [accountTransactions]
  );

  // --- Etiqueta del rango activo ---
  const activeDateLabel = (() => {
    if (allTransactions) return 'Todas las transacciones';
    const s = parseISO(dateRange.start);
    const e = parseISO(dateRange.end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return 'Rango inválido';
    return `${format(s, 'd MMM', { locale: es })} – ${format(e, 'd MMM yyyy', { locale: es })}`;
  })();

  // --- Aplicar filtro ---
  const applyDateFilter = () => {
    const s = parseISO(dateRange.start);
    const e = parseISO(dateRange.end);
    if (!isValidDate(dateRange.start) || !isValidDate(dateRange.end)) {
      setDateError('Fecha inválida'); return;
    }
    if (s > e) {
      setDateError('La fecha inicio debe ser menor que la fecha fin'); return;
    }
    setDateError('');
    setShowDateFilter(false);
  };

  // --- Sin cuentas ---
  if (accounts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No hay cuentas registradas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">

      {/* ── Header compacto: cuenta + fecha ─────────────────────────────── */}
      <SwipeableContainer
        onSwipeLeft={next}
        onSwipeRight={prev}
        animated
        animationType="slide-fade"
        animationDuration={220}
        threshold={15}
        delta={45}
        preventScrollOnSwipe={true}
        className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
      >
        <div className="px-3 py-2 max-w-md mx-auto">
          {/* Fila principal: flechas + nombre + selector */}
          <div className="flex items-center gap-1">
            <button
              onClick={prev}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              aria-label="Cuenta anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowAccountMenu(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-0"
            >
              <span className="text-lg font-bold truncate">{currentAccount?.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
            </button>

            <button
              onClick={next}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors shrink-0"
              aria-label="Cuenta siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Fila secundaria: rango activo + indicador de cuenta */}
          <div className="flex items-center justify-between mt-0.5 px-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{activeDateLabel}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">
              {currentAccountIndex + 1}/{accounts.length}
            </p>
          </div>
        </div>
      </SwipeableContainer>

      {/* ── Resumen de totales ───────────────────────────────────────────── */}
      <Summary income={totals.income} expense={totals.expense} />

      {/* ── Tabla de transacciones (también swipeable) ───────────────────── */}
      <SwipeableContainer
        onSwipeLeft={next}
        onSwipeRight={prev}
        animated
        animationType="slide-fade"
        animationDuration={220}
        threshold={15}
        delta={45}
        preventScrollOnSwipe={true}
        className="flex-1"
        style={{ overflowY: 'auto' }}
      >
        <TransactionTable transactions={accountTransactions} labels={labels} />
      </SwipeableContainer>

      {/* ── Footer: totales fijos ────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950">
        <div className="flex items-center">
          <p className="flex-1 text-base font-bold">Total</p>
          <p className="w-28 text-right font-extrabold text-lg text-red-600 dark:text-red-400">
            -${totals.expense.toLocaleString()}
          </p>
          <p className="w-28 text-right font-extrabold text-lg text-green-600 dark:text-green-400">
            +${totals.income.toLocaleString()}
          </p>
        </div>
      </div>

      {/* ── Modales ──────────────────────────────────────────────────────── */}
      {showAccountMenu && (
        <AccountMenuModal
          accounts={accounts}
          currentIndex={currentAccountIndex}
          onSelect={setCurrentAccountIndex}
          onClose={() => setShowAccountMenu(false)}
        />
      )}

      {showDateFilter && (
        <DateFilterModal
          allTransactions={allTransactions}
          dateRange={dateRange}
          dateError={dateError}
          onToggleAll={(v) => { setAllTransactions(v); setDateError(''); }}
          onDateChange={(f, v) => {
            setDateError(v && !isValidDate(v) ? 'Fecha inválida' : '');
            setDateRange(r => ({ ...r, [f]: v }));
          }}
          onApply={applyDateFilter}
          onClose={() => setShowDateFilter(false)}
        />
      )}

      {/* ── Botón flotante de filtro ─────────────────────────────────────── */}
      <button
        onClick={() => setShowDateFilter(true)}
        className="fixed bottom-32 right-4 w-11 h-11 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center z-40"
        aria-label="Filtrar por fecha"
      >
        <Filter className="w-4 h-4" />
      </button>
    </div>
  );
}