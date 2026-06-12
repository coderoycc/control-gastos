import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { TransactionsList } from "./pages/TransactionsList";
import { AddTransaction } from "./pages/AddTransaction";
import { EditTransaction } from "./pages/EditTransaction";
import { ConfigurationsManager } from "./pages/ConfigurationsManager";
import { Reports } from "./pages/Reports";
import { ReportByAccount } from "./pages/ReportByAccount";
import { ReportCharts } from "./pages/ReportCharts";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: TransactionsList },
      { path: "reports", Component: Reports },
      { path: "reports/by-account", Component: ReportByAccount },
      { path: "reports/charts", Component: ReportCharts },
      { path: "add", Component: AddTransaction },
      { path: "edit/:id", Component: EditTransaction },
      { path: "accounts", Component: ConfigurationsManager },
    ],
  },
]);
