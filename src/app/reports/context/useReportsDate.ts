import { useContext } from 'react';
import { ReportsDateContext } from './ReportsDateContext';
import type { ReportsDateContextType } from './ReportsDateContext';

export function useReportsDate(): ReportsDateContextType {
  const context = useContext(ReportsDateContext);
  if (!context) {
    throw new Error('useReportsDate must be used within ReportsDateProvider');
  }
  return context;
}
