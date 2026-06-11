import { ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { SwipeableContainer } from '../../../components';
import { Summary } from '../../../components/Summary';
import { TransactionTable } from '../../../components/TransactionTable';
import { AccountMenuModal } from './AccountMenuModal';
import { DateFilterModal } from './DateFilterModal';
import { useReportByAccount } from '../hooks/useReportByAccount';

export function ReportByAccountView() {
  const {
    accounts,
    labels,
    currentAccount,
    currentAccountIndex,
    showAccountMenu,
    showDateFilter,
    allTransactions,
    dateRange,
    dateError,
    activeDateLabel,
    accountTransactions,
    totals,
    prev,
    next,
    setCurrentAccountIndex,
    setShowAccountMenu,
    setShowDateFilter,
    setAllTransactions,
    setDateRange,
    setDateError,
    handleToggleAll,
    handleDateChange,
    applyDateFilter,
  } = useReportByAccount();

  if (accounts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No hay cuentas registradas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
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
              <span className="text-lg font-bold truncate">
                {currentAccount?.name}
              </span>
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

          <div className="flex items-center justify-between mt-0.5 px-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {activeDateLabel}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 shrink-0 ml-2">
              {currentAccountIndex + 1}/{accounts.length}
            </p>
          </div>
        </div>
      </SwipeableContainer>

      <Summary income={totals.income} expense={totals.expense} />

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
          onToggleAll={handleToggleAll}
          onDateChange={handleDateChange}
          onApply={applyDateFilter}
          onClose={() => setShowDateFilter(false)}
        />
      )}

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
