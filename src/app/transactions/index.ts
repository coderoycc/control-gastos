// ─── Contrato público del módulo transactions ───
// Solo esto es accesible desde fuera del módulo.

// Components
export { MonthNavigation } from './components/MonthNavigation';
export { TransactionSummary } from './components/TransactionSummary';
export { TransactionCard } from './components/TransactionCard';
export { TransactionFilters } from './components/TransactionFilters';
export { TransactionForm } from './components/TransactionForm';
export { EditTransactionForm } from './components/EditTransactionForm';

// Hooks
export { useMonthNavigation } from './hooks/useMonthNavigation';
export { useTransactionFilters } from './hooks/useTransactionFilters';
export { useSpendingLimitAlert } from './hooks/useSpendingLimitAlert';

// Types (solo los que necesita quien importa el módulo)
export type { TransactionFiltersResult } from './hooks/useTransactionFilters';
