import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { TransactionsList } from './pages/TransactionsList';
import { AddTransaction } from './pages/AddTransaction';
import { EditTransaction } from './pages/EditTransaction';
import { ConfigurationsManager } from './pages/ConfigurationsManager';
import { Reports } from './pages/Reports';
import { ReportByAccount } from './pages/ReportByAccount';
import { ReportByLabel } from './pages/ReportByLabel';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: TransactionsList },
      { path: 'reports', Component: Reports },
      { path: 'reports/by-account', Component: ReportByAccount },
      { path: 'reports/by-label', Component: ReportByLabel },
      { path: 'add', Component: AddTransaction },
      { path: 'edit/:id', Component: EditTransaction },
      { path: 'accounts', Component: ConfigurationsManager },
    ],
  },
]);