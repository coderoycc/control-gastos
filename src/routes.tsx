import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ReportsLayout } from "./app/reports/components/ReportsLayout";
import { TransactionsList } from "./pages/TransactionsList";
import { AddTransaction } from "./pages/AddTransaction";
import { EditTransaction } from "./pages/EditTransaction";
import { ConfigurationsManager } from "./pages/ConfigurationsManager";
import { Reports } from "./pages/Reports";
import { ReportByAccount } from "./pages/ReportByAccount";
import { ReportCharts } from "./pages/ReportCharts";
import { AccountFlow } from "./pages/AccountFlow";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: TransactionsList },
      {
        path: "reports",
        Component: ReportsLayout,
        children: [
          { index: true, Component: Reports },
          { path: "by-account", Component: ReportByAccount },
          { path: "charts", Component: ReportCharts },
          { path: "account-flow", Component: AccountFlow },
        ],
      },
      { path: "add", Component: AddTransaction },
      { path: "edit/:id", Component: EditTransaction },
      { path: "accounts", Component: ConfigurationsManager },
    ],
  },
]);
