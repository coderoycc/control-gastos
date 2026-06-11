import { useReportMonth, ReportsMenu } from '../app/reports';

export function Reports() {
  const {
    containerRef,
    currentDate,
    totals,
    handlePreviousMonth,
    handleNextMonth,
  } = useReportMonth();

  return (
    <ReportsMenu
      containerRef={containerRef}
      currentDate={currentDate}
      totals={totals}
      onPreviousMonth={handlePreviousMonth}
      onNextMonth={handleNextMonth}
    />
  );
}
