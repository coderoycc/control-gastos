import { ChevronDown, Filter } from 'lucide-react';
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
    handlePreviousMonth,
    handleNextMonth,
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
      <div className="border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="px-3 py-2 max-w-md mx-auto flex flex-col items-center">
          <button
            onClick={() => setShowAccountMenu(true)}
            className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-0"
          >
            <span className="text-lg font-bold truncate">
              {currentAccount?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </button>

          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {activeDateLabel}
          </p>
        </div>
      </div>

      <Summary income={totals.income} expense={totals.expense} />

      <SwipeableContainer
        onSwipeLeft={handleNextMonth}
        onSwipeRight={handlePreviousMonth}
        threshold={30}
        velocityThreshold={0.15}
        delta={30}
        preventScrollOnSwipe
        trackMouse
        animated
        animationType="slide-fade"
        animationDuration={350}
        animationEasing="ease-in-out"
        className="flex-1 overflow-auto"
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
