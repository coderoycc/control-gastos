import { useCallback } from 'react';
import { Link } from 'react-router';
import { Filter, Plus, Search, Calendar, X } from 'lucide-react';
import { format } from 'date-fns';
import { SwipeableContainer, Summary } from '../../../components';
import { useData } from '../../context';
import { useMonthNavigation } from '../hooks/useMonthNavigation';
import { useTransactionFilters } from '../hooks/useTransactionFilters';
import { useTransactionSearch } from '../hooks/useTransactionSearch';
import { MonthNavigation } from './MonthNavigation';
import { TransactionCard } from './TransactionCard';
import { TransactionFilters } from './TransactionFilters';

export function TransactionsList() {
  useData();
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
    selectedLabelId,
    setSelectedLabelId,
    searchQuery,
    setSearchQuery,
  } = useTransactionFilters(currentDate);

  const {
    showSearch,
    searchInputRef,
    toggleSearch,
    clearSearch,
    handleKeyDown
  } = useTransactionSearch(setSearchQuery);

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

  const hasActiveFilters = selectedAccount !== 'all' || !!startDate || !!endDate || sortOrder !== 'desc' || selectedLabelId !== null || searchQuery !== '';
  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasFilterBadge = selectedAccount !== 'all' || !!startDate || !!endDate || sortOrder !== 'desc' || selectedLabelId !== null;

  const getCalendarUrl = () => {
    const params = new URLSearchParams();
    if (currentDate) {
      params.set('month', format(currentDate, 'yyyy-MM'));
    }

    const hasAccount = selectedAccount && selectedAccount !== 'all';
    const hasTag = selectedLabelId !== null && selectedLabelId !== undefined;

    if (hasAccount) {
      params.set('accountId', selectedAccount);
    } else if (hasTag) {
      params.set('tagId', String(selectedLabelId));
    }

    const queryString = params.toString();
    return queryString ? `/reports/calendar?${queryString}` : '/reports/calendar';
  };

  return (
    <div className="flex flex-col h-full">
      <MonthNavigation
        currentDate={currentDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        filterDateText={filterDateText}
      />

      <Summary income={summary.income} expense={summary.expense} advanced />

      {/* Barra de acciones */}
      <div className="px-4 pt-2 pb-0 flex items-center justify-between text-gray-500 dark:text-gray-400 text-xs">
        <span>Ultimas transacciones</span>
        <div className="flex items-center gap-2">
          <Link
            to={getCalendarUrl()}
            className="flex items-center justify-center p-1.5 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            title="Ver calendario"
          >
            <Calendar className="w-4 h-4" />
          </Link>

          <button
            onClick={toggleSearch}
            className={`flex items-center justify-center p-1.5 rounded-full transition-colors ${
              showSearch || hasSearchQuery
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            title={showSearch ? 'Ocultar busqueda' : 'Buscar'}
          >
            <Search className="w-4 h-4" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center justify-center p-1.5 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              title="Filtrar"
            >
              <Filter className="w-4 h-4" />
            </button>
            {hasFilterBadge && (
              <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-gray-900 pointer-events-none" />
            )}
          </div>
        </div>
      </div>

      {/* Barra de busqueda inline */}
      {showSearch && (
        <div className="px-4 pt-2 pb-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              inputMode="search"
              enterKeyHint="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Buscar transaccion..."
              className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400 dark:focus:border-blue-500 transition-all"
            />
            {hasSearchQuery && (
              <button
                onPointerDown={(e) => e.preventDefault()}
                onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-200 active:scale-90 transition-transform"
                aria-label="Borrar texto"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {hasSearchQuery && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              Mostrando resultados para{' '}
              <span className="font-semibold text-blue-600 dark:text-blue-400">"{searchQuery}"</span>
            </p>
          )}
        </div>
      )}

      {/* Chip cuando la barra esta cerrada pero hay query activo */}
      {!showSearch && hasSearchQuery && (
        <div className="px-4 pt-1.5 flex items-center gap-1.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">Buscando:</span>
          <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-full px-2.5 py-0.5">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 max-w-[160px] truncate">
              {searchQuery}
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="ml-0.5 text-blue-400 dark:text-blue-500 active:scale-90 transition-transform"
              aria-label="Quitar filtro"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-20 right-4 z-50 flex flex-col">
        <Link
          to="/add"
          className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
          aria-label="Agregar transaccion"
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
        selectedLabelId={selectedLabelId}
        onLabelChange={setSelectedLabelId}
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
              {hasSearchQuery
                ? `que coincidan con "${searchQuery}"`
                : startDate && endDate
                  ? 'en este rango de fechas'
                  : 'este mes'}
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
