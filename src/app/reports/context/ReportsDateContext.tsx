import { createContext } from 'react';

export interface ReportsDateState {
  currentDate: Date;
  dateRange: { start: string; end: string } | null;
}

export interface ReportsDateActions {
  setCurrentDate: (date: Date) => void;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  setDateRange: (range: { start: string; end: string } | null) => void;
  resetToMonthView: () => void;
}

export type ReportsDateContextType = ReportsDateState & ReportsDateActions;

export const ReportsDateContext = createContext<ReportsDateContextType | undefined>(undefined);
