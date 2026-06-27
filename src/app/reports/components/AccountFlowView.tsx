import { ChevronDown } from 'lucide-react';
import { SwipeableContainer } from '../../../components';
import { Summary } from '../../../components/Summary';
import { TransactionTable } from '../../../components/TransactionTable';
import { AccountMenuModal } from './AccountMenuModal';
import { useAccountFlow } from '../hooks/useAccountFlow';

export function AccountFlowView() {
  const {
    accounts,
    labels,
    currentAccount,
    currentAccountIndex,
    showAccountMenu,
    accountTransactions,
    totals,
    prev,
    next,
    setCurrentAccountIndex,
    setShowAccountMenu,
  } = useAccountFlow();

  if (accounts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No hay cuentas registradas</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Header: account name */}
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="relative px-3 pt-2 max-w-md mx-auto flex items-center justify-center">
          <button
            onClick={() => setShowAccountMenu(true)}
            className="flex items-center justify-center gap-1.5 py-1 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-0"
          >
            <span className="text-lg font-bold truncate">
              {currentAccount?.name}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
          </button>
        </div>
        <div className="px-3 max-w-md mx-auto">
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate text-center">
            Todas las transacciones
          </p>
        </div>
      </div>

      <Summary income={totals.income} expense={totals.expense} advanced={true} />

      <div className="flex items-center px-4 py-2 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent shadow-xs dark:shadow-gray-500/50 text-xs font-medium text-gray-600 dark:text-gray-400">
        <div className="flex-1 min-w-0">Detalle</div>
        <div className="w-20 text-right flex-shrink-0">Egresos</div>
        <div className="w-20 text-right flex-shrink-0">Ingresos</div>
      </div>

      {/* Swipe navigates between accounts */}
      <SwipeableContainer
        onSwipeLeft={next}
        onSwipeRight={prev}
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
        <TransactionTable
          transactions={accountTransactions}
          labels={labels}
          accounts={accounts}
          currentAccountId={currentAccount?.id}
        />
      </SwipeableContainer>

      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-transparent shadow-xs dark:shadow-gray-500/50">
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
    </div>
  );
}
