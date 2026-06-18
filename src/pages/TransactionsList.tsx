import { useCallback } from 'react';
import { Link } from 'react-router';
import { Filter, Plus } from 'lucide-react';
import { SwipeableContainer } from '../components';
import {
  useMonthNavigation,
  useTransactionFilters,
  MonthNavigation,
  TransactionSummary,
  TransactionCard,
  TransactionFilters,
} from '../app/transactions';

export function TransactionsList() {
  const {
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
  } = useMonthNavigation();

  const {
    filteredTransactions,
    summary,
    balance,
    selectedAccount,
    startDate,
    endDate,
    showFilters,
    setSelectedAccount,
    setStartDate,
    setEndDate,
    setShowFilters,
    clearFilters,
    filterDateText,
  } = useTransactionFilters(currentDate);

  const handlePreviousMonth = useCallback(() => {
    if (startDate && endDate) {
      clearFilters();
      resetToCurrentMonth();
    } else {
      goToPreviousMonth();
    }
  }, [startDate, endDate, clearFilters, resetToCurrentMonth, goToPreviousMonth]);

  const handleNextMonth = useCallback(() => {
    if (startDate && endDate) {
      clearFilters();
      resetToCurrentMonth();
    } else {
      goToNextMonth();
    }
  }, [startDate, endDate, clearFilters, resetToCurrentMonth, goToNextMonth]);

  const hasActiveFilters = selectedAccount !== 'all' || !!startDate || !!endDate;

  return (
    <div className="flex flex-col h-full">
      <MonthNavigation
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        filterDateText={filterDateText}
      />

      <TransactionSummary
        income={summary.income}
        expense={summary.expense}
        balance={balance}
      />

      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-1.5">
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 dark:bg-gray-600 text-white shadow-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95"
          aria-label="Filtros"
        >
          <Filter className="w-4 h-4" />
        </button>

        <Link
          to="/add"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
          aria-label="Agregar transacción"
        >
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      <TransactionFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        startDate={startDate}
        onStartDateChange={setStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />

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
        className="flex-1 overflow-auto px-4 py-3"
      >
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p>No hay transacciones</p>
            <p className="text-sm mt-1">
              {startDate && endDate ? 'en este rango de fechas' : 'este mes'}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredTransactions.map(transaction => (
              <TransactionCard key={transaction.id} transaction={transaction} />
            ))}
          </div>
        )}
      </SwipeableContainer>
    </div>
  );
}
