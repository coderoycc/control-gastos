// ─── Contrato público del módulo reports ───

export { useReportMonth } from './hooks/useReportMonth';
export { useReportByAccount } from './hooks/useReportByAccount';
export { useAccountFlow } from './hooks/useAccountFlow';
export { ReportsMenu } from './components/ReportsMenu';
export { ReportByAccountView } from './components/ReportByAccountView';
export { AccountFlowView } from './components/AccountFlowView';
export { DateFilterModal } from './components/DateFilterModal';
export { AccountMenuModal } from './components/AccountMenuModal';
export { ChartView } from './components/ChartView';
export { useReportCharts } from './hooks/useReportCharts';
export { ReportsLayout } from './components/ReportsLayout';
export { useReportsDate } from './context/useReportsDate';
export { CalendarView, type CalendarViewProps } from './components/CalendarView';
export { useCalendarTransactions } from './hooks/useCalendarTransactions';

