import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { LoginView } from '@/features/auth'
import { CustomersView } from '@/features/customers'
import { DashboardView } from '@/features/dashboard'
import { EmployeesView } from '@/features/employees'
import {
  AllocationView,
  FinanceView,
  InvoiceView,
  SettlementView,
} from '@/features/finance'
import { InventoryView } from '@/features/inventory'
import { NotFoundView } from '@/features/not-found'
import { ReportsView } from '@/features/reports'
import { SalesView } from '@/features/sales'
import { SettingsView } from '@/features/settings'
import { ErpLayout } from '@/share/components/layout'

export const featureRoutes: RouteObject[] = [
  { path: '/app/login', element: <LoginView /> },
  {
    path: '/app',
    element: <ErpLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'dashboard', element: <DashboardView /> },
      { path: 'inventory', element: <InventoryView /> },
      { path: 'sales', element: <SalesView /> },
      { path: 'customers', element: <CustomersView /> },
      { path: 'employees', element: <EmployeesView /> },
      { path: 'finance', element: <FinanceView /> },
      { path: 'invoices', element: <InvoiceView /> },
      { path: 'allocations', element: <AllocationView /> },
      { path: 'settlements', element: <SettlementView /> },
      { path: 'reports', element: <ReportsView /> },
      { path: 'settings', element: <SettingsView /> },
      { path: '*', element: <NotFoundView /> },
    ],
  },
]
