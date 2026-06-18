import { Outlet } from 'react-router';
import { ReportsDateProvider } from '../context/ReportsDateProvider';

export function ReportsLayout() {
  return (
    <ReportsDateProvider>
      <Outlet />
    </ReportsDateProvider>
  );
}
