import { useState, useCallback, useMemo } from 'react';
import { startOfMonth, endOfMonth, subMonths, addMonths, parseISO } from 'date-fns';
import { ReportsDateContext } from './ReportsDateContext';
import type { ReportsDateContextType } from './ReportsDateContext';

export function ReportsDateProvider({ children }: { children: React.ReactNode }) {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const resetToMonthView = useCallback(() => {
    if (dateRange) {
      const endDate = parseISO(dateRange.end);
      const lastMonth = startOfMonth(endDate);
      setCurrentDate(lastMonth);
    }
    setDateRange(null);
  }, [dateRange]);

  const value = useMemo<ReportsDateContextType>(() => ({
    currentDate,
    dateRange,
    setCurrentDate,
    goToPreviousMonth,
    goToNextMonth,
    setDateRange,
    resetToMonthView,
  }), [currentDate, dateRange, goToPreviousMonth, goToNextMonth, resetToMonthView]);

  return (
    <ReportsDateContext.Provider value={value}>
      {children}
    </ReportsDateContext.Provider>
  );
}
