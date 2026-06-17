import { ChevronDown, Filter } from 'lucide-react';
import { SwipeableContainer } from '../../../components';
import { Summary } from '../../../components/Summary';
import { TransactionTable } from '../../../components/TransactionTable';
import { AccountMenuModal } from './AccountMenuModal';
import { ReportFilters } from './ReportFilters';
import { useReportByAccount } from '../hooks/useReportByAccount';

export function ReportByAccountView() {
  const {
    accounts,
    labels,
    currentAccount,
    currentAccountIndex,
    showAccountMenu,
    showFilters,
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
    setShowFilters,
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
        <div className="relative px-3 py-2 max-w-md mx-auto flex items-center justify-center">
          <button
            onClick={() => setShowAccountMenu(true)}
            className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-0"
          >
            <span className="text-lg font-bold truncate">
              {currentAccount?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
          <button
            onClick={() => setShowFilters(true)}
            className="absolute right-0 flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Filtros"
          >
            <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
        <div className="px-3 pb-2 max-w-md mx-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-center">
            {activeDateLabel}
          </p>
        </div>
      </div>

      <Summary income={totals.income} expense={totals.expense} advanced={true} />

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
        <TransactionTable transactions={accountTransactions} labels={labels} accounts={accounts} currentAccountId={currentAccount?.id} />
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

      {showFilters && (
        <ReportFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          startDate={dateRange.start}
          onStartDateChange={(value) => handleDateChange('start', value)}
          endDate={dateRange.end}
          onEndDateChange={(value) => handleDateChange('end', value)}
          allTransactions={allTransactions}
          onToggleAll={handleToggleAll}
          dateError={dateError}
          onApply={applyDateFilter}
        />
      )}
    </div>
  );
}
