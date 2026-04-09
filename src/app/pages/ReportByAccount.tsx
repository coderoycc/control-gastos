import { useMemo, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useData } from '../context';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, ChevronLeft, ChevronRight, ChevronDown, Filter } from 'lucide-react';
import { Summary } from '../components/Summary';
import { TransactionTable } from '../components/TransactionTable';

export function ReportByAccount() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { transactions, accounts, labels } = useData();
  
  const monthParam = searchParams.get('month');
  const currentDate = monthParam ? new Date(monthParam + '-01') : new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const [currentAccountIndex, setCurrentAccountIndex] = useState(0);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [allTransactions, setAllTransactions] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: format(monthStart, 'yyyy-MM-dd'),
    end: format(monthEnd, 'yyyy-MM-dd')
  });
  const [dateError, setDateError] = useState('');

  const isValidDate = (dateStr: string) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    if (value && !isValidDate(value)) {
      setDateError('Fecha inválida');
    } else {
      setDateError('');
    }
    setDateRange({ ...dateRange, [field]: value });
  };

  // Touch/swipe handling for accounts
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
        // Swipe left - next account
        handleNextAccount();
      } else {
        // Swipe right - previous account
        handlePreviousAccount();
      }
    }
  };

  const handlePreviousAccount = () => {
    setCurrentAccountIndex(prev => (prev > 0 ? prev - 1 : accounts.length - 1));
  };

  const handleNextAccount = () => {
    setCurrentAccountIndex(prev => (prev < accounts.length - 1 ? prev + 1 : 0));
  };

  const currentAccount = accounts[currentAccountIndex];

  const accountTransactions = useMemo(() => {
    if (!currentAccount) return [];
    
    return transactions
      .filter(t => {
        const date = parseISO(t.date);
        const isInAccount = t.accountId === currentAccount.id;
        
        if (allTransactions) {
          return isInAccount;
        }
        
        const filterStart = parseISO(dateRange.start);
        const filterEnd = parseISO(dateRange.end);
        
        if (isNaN(filterStart.getTime()) || isNaN(filterEnd.getTime())) {
          return isInAccount;
        }
        
        const isInRange = isWithinInterval(date, { start: filterStart, end: filterEnd });
        
        return isInRange && isInAccount;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, currentAccount, dateRange, allTransactions]);

  const totals = useMemo(() => {
    return accountTransactions.reduce((acc, t) => {
      if (t.type === 'entrada') {
        acc.income += t.amount;
      } else if (t.type === 'salida') {
        acc.expense += t.amount;
      }
      return acc;
    }, { income: 0, expense: 0 });
  }, [accountTransactions]);

  const formatDateRange = () => {
    if (allTransactions) {
      return 'Todas las transacciones';
    }
    const start = parseISO(dateRange.start);
    const end = parseISO(dateRange.end);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Rango inválido';
    }
    
    return `${format(start, 'd MMM yyyy', { locale: es })} - ${format(end, 'd MMM yyyy', { locale: es })}`;
  };

  const applyDateFilter = () => {
    const start = parseISO(dateRange.start);
    const end = parseISO(dateRange.end);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setDateError('Fecha inválida');
      return;
    }
    
    if (start > end) {
      setDateError('La fecha inicio debe ser menor que la fecha fin');
      return;
    }
    
    setDateError('');
    setShowDateFilter(false);
  };

  if (accounts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/reports')}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-medium">Reporte por Cuenta</h2>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <p>No hay cuentas registradas</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      

      {/* Account Selector */}
      <div 
        className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex flex-col items-center gap-1 max-w-md mx-auto">
          {/* Date Range Display */}
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDateRange()}
          </p>
          
          {/* Account Selector with Navigation */}
          <div className="flex items-center justify-between w-full">
            <button
              onClick={handlePreviousAccount}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cuenta anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setShowAccountMenu(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="text-xl font-bold">
                {currentAccount?.name || 'Sin cuenta'}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>

            <button
              onClick={handleNextAccount}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Cuenta siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <Summary income={totals.income} expense={totals.expense} />

      {/* Transaction Table */}
      <TransactionTable transactions={accountTransactions} labels={labels} />

      {/* Totals Footer - Fixed */}
      <div className="px-4 py-3 border-t-2 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="font-semibold">Total</p>
          </div>
          <div className="w-20 text-right">
            <p className="font-bold text-red-600 dark:text-red-400">
              -${totals.expense.toLocaleString()}
            </p>
          </div>
          <div className="w-20 text-right">
            <p className="font-bold text-green-600 dark:text-green-400">
              +${totals.income.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Account Selection Modal */}
      {showAccountMenu && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAccountMenu(false)}
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
                  onClick={() => {
                    setCurrentAccountIndex(index);
                    setShowAccountMenu(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    index === currentAccountIndex
                      ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-medium'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <p className="font-medium">{account.name}</p>
                  {account.detail && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {account.detail}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Date Filter Modal */}
      {showDateFilter && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDateFilter(false)}
        >
          <div 
            className="bg-white dark:bg-gray-900 rounded-lg w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white dark:bg-gray-900 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
              <h3 className="font-medium">Filtrar por Fecha</h3>
            </div>
            <div className="p-4">
              {/* Checkbox for all transactions */}
              <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allTransactions}
                  onChange={(e) => {
                    setAllTransactions(e.target.checked);
                    setDateError('');
                  }}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600"
                />
                <span className="flex-1 text-sm">Todas las transacciones</span>
              </label>

              {/* Date Range Inputs */}
              {!allTransactions && (
                <div className="mt-4 space-y-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        dateError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-950`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border text-sm ${
                        dateError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } bg-white dark:bg-gray-950`}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setShowDateFilter(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
                >
                  Cancelar
                </button>
                <button
                  onClick={applyDateFilter}
                  className="flex-1 px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700 transition-colors text-sm"
                >
                  Aplicar
                </button>
              </div>

              {/* Date Error Message */}
              {dateError && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-3 text-center">
                  {dateError}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Filter Button */}
      <button
        onClick={() => setShowDateFilter(true)}
        className="fixed bottom-32 right-4 w-12 h-12 rounded-full bg-blue-600 dark:bg-blue-600 text-white shadow-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition-all flex items-center justify-center z-40"
        aria-label="Filtrar por fecha"
      >
        <Filter className="w-5 h-5" />
      </button>
    </div>
  );
}