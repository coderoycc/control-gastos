import { useState, useCallback } from 'react';
import { subMonths, addMonths } from 'date-fns';

function getCurrentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function useMonthNavigation() {
  const [currentDate, setCurrentDate] = useState<Date>(getCurrentMonthStart);

  const goToPreviousMonth = useCallback(() => {
    setCurrentDate(prev => subMonths(prev, 1));
  }, []);

  const goToNextMonth = useCallback(() => {
    setCurrentDate(prev => addMonths(prev, 1));
  }, []);

  const resetToCurrentMonth = useCallback(() => {
    setCurrentDate(getCurrentMonthStart());
  }, []);

  return {
    currentDate,
    goToPreviousMonth,
    goToNextMonth,
    resetToCurrentMonth,
  };
}
