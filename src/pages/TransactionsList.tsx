import { useCallback } from 'react';
import { Link } from 'react-router';
import { Filter, Plus } from 'lucide-react';
import { SwipeableContainer, Summary } from '../components';
import {
  useMonthNavigation,
  useTransactionFilters,
  MonthNavigation,
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
    sortOrder,
    setSortOrder,
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

  const hasActiveFilters = selectedAccount !== 'all' || !!startDate || !!endDate || sortOrder !== 'desc';

  return (
    <div className="flex flex-col h-full">
      <MonthNavigation
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        filterDateText={filterDateText}
      />

      <Summary
        income={summary.income}
        expense={summary.expense}
        advanced
      />
      <div className="px-4 pt-2 pb-0 flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs">
        <span>Últimas transacciones</span>
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs cursor-pointer hover:underline"
        >
          <Filter className="w-3.5 h-3.5" />
          Filtrar
        </button>
      </div>
      <div className="fixed bottom-20 right-4 z-50 flex flex-col">
        <Link
          to="/add"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
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
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
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
