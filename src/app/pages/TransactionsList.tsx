import { useState, useMemo, useRef } from 'react';
import { Link } from 'react-router';
import { ArrowUpCircle, ArrowDownCircle, ArrowRightLeft, Filter, X, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useData, type Transaction, type TransactionType } from '../context/DataContext';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, addMonths, subMonths, getDaysInMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { BottomSheet } from '../components/BottomSheet';

export function TransactionsList() {
  const { transactions, accounts, labels } = useData();
  
  // Get current month as default
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Touch/swipe handling
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left - next month
        handleNextMonth();
      } else {
        // Swipe right - previous month
        handlePreviousMonth();
      }
    }
  };

  const handlePreviousMonth = () => {
    // If has date range filter, go back to current month
    if (startDate && endDate) {
      setStartDate('');
      setEndDate('');
      setCurrentDate(new Date());
    } else {
      setCurrentDate(prev => subMonths(prev, 1));
    }
  };

  const handleNextMonth = () => {
    // If has date range filter, go back to current month
    if (startDate && endDate) {
      setStartDate('');
      setEndDate('');
      setCurrentDate(new Date());
    } else {
      setCurrentDate(prev => addMonths(prev, 1));
    }
  };

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Filter by account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.accountId === selectedAccount);
    }

    // Filter by date range (priority over month)
    if (startDate && endDate) {
      filtered = filtered.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { 
          start: parseISO(startDate), 
          end: parseISO(endDate) 
        });
      });
    } else {
      // Filter by current month
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      filtered = filtered.filter(t => {
        const date = parseISO(t.date);
        return isWithinInterval(date, { start: monthStart, end: monthEnd });
      });
    }

    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedAccount, currentDate, startDate, endDate]);

  // Calculate summary
  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'entrada') {
        acc.income += t.amount;
      } else if (t.type === 'salida') {
        acc.expense += t.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const balance = summary.income - summary.expense;

  const getFilterDateText = () => {
    if (startDate && endDate) {
      return `${format(parseISO(startDate), "d 'de' MMM", { locale: es })} - ${format(parseISO(endDate), "d 'de' MMM, yyyy", { locale: es })}`;
    }
    return null;
  };

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'entrada':
        return <ArrowUpCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'salida':
        return <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'transferencia':
        return <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getTransactionColor = (type: TransactionType) => {
    switch (type) {
      case 'entrada':
        return 'border-l-green-600 dark:border-l-green-400 bg-green-50 dark:bg-green-950/20';
      case 'salida':
        return 'border-l-red-600 dark:border-l-red-400 bg-red-50 dark:bg-red-950/20';
      case 'transferencia':
        return 'border-l-blue-600 dark:border-l-blue-400 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const clearFilters = () => {
    setSelectedAccount('all');
    setStartDate('');
    setEndDate('');
  };

  const hasActiveFilters = selectedAccount !== 'all' || startDate || endDate;

  return (
    <div className="flex flex-col h-full">
      {/* Month Header - Compact */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <button
            onClick={handlePreviousMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 text-center">
            <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
              01
            </span>
            <span className="text-2xl font-bold uppercase tracking-wide">
              {format(currentDate, 'MMMM', { locale: es })}
            </span>
            <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
              {getDaysInMonth(currentDate)}
            </span>
          </div>

          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">
          {format(currentDate, 'yyyy', { locale: es })}
        </p>

        {getFilterDateText() && (
          <p className="text-center text-xs text-blue-600 dark:text-blue-400 mt-1">
            {getFilterDateText()}
          </p>
        )}
      </div>

      {/* Summary - Compact */}
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-around text-center">
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Ingresos</p>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              ${summary.income.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Gastos</p>
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              ${summary.expense.toLocaleString()}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-300 dark:bg-gray-700" />
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">Balance</p>
            <p className={`text-sm font-semibold ${
              balance >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              ${balance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Floating Buttons Container */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-1.5">
        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(true)}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 dark:bg-gray-600 text-white shadow-lg hover:bg-gray-800 dark:hover:bg-gray-700 transition-all hover:scale-110 active:scale-95"
          aria-label="Filtros"
        >
          <Filter className="w-4 h-4" />
        </button>

        {/* Add Transaction Button */}
        <Link
          to="/add"
          className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-500 text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all hover:scale-110 active:scale-95"
          aria-label="Agregar transacción"
        >
          <Plus className="w-4 h-4" />
        </Link>
      </div>

      {/* Filters BottomSheet */}
      <BottomSheet
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        title="Filtros"
      >
        <div className="p-4 space-y-4">
          {/* Account Filter */}
          <div>
            <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
              Cuenta
            </label>
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
            >
              <option value="all">Todas las cuentas</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Desde
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700 dark:text-gray-300">
                Hasta
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
              />
            </div>
          </div>

          {(selectedAccount !== 'all' || startDate || endDate) && (
            <button
              onClick={() => {
                setSelectedAccount('all');
                setStartDate('');
                setEndDate('');
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}

          <button
            onClick={() => setShowFilters(false)}
            className="w-full px-4 py-2.5 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors"
          >
            Aplicar filtros
          </button>
        </div>
      </BottomSheet>

      {/* Transactions List with Swipe Gestures */}
      <div 
        className="flex-1 overflow-auto px-4 py-3"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p>No hay transacciones</p>
            <p className="text-sm mt-1">
              {startDate && endDate ? 'en este rango de fechas' : 'este mes'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map(transaction => {
              const account = accounts.find(a => a.id === transaction.accountId);
              const transactionLabels = labels.filter(l => transaction.labels.includes(l.id));
              return (
                <Link
                  key={transaction.id}
                  to={`/edit/${transaction.id}`}
                  className={`block p-4 rounded-lg border-l-4 ${getTransactionColor(transaction.type)} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      {getTransactionIcon(transaction.type)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{transaction.detail}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {transactionLabels.map(label => (
                            <span
                              key={label.id}
                              className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                              style={{ backgroundColor: label.color }}
                            >
                              {label.name}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {account?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          {format(parseISO(transaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className={`font-semibold ${
                        transaction.type === 'entrada' 
                          ? 'text-green-700 dark:text-green-400' 
                          : transaction.type === 'salida'
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-blue-700 dark:text-blue-400'
                      }`}>
                        {transaction.type === 'salida' ? '-' : ''}${transaction.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
