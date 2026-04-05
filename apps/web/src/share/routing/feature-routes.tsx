import type { RouteObject } from 'react-router-dom'
import { Navigate } from 'react-router-dom'
import { LoginView } from '@/features/auth'
import { CustomersView } from '@/features/customers'
import { DashboardView } from '@/features/dashboard'
import { EmployeesView } from '@/features/employees'
import { FinanceView } from '@/features/finance'
import { InventoryView } from '@/features/inventory'
import { NotFoundView } from '@/features/not-found'
import { ReportsView } from '@/features/reports'
import { SalesView } from '@/features/sales'
import { SettingsView } from '@/features/settings'

export const featureRoutes: RouteObject[] = [
  { path: '/app', element: <Navigate to="/app/dashboard" replace /> },
  { path: '/app/login', element: <LoginView /> },
  { path: '/app/dashboard', element: <DashboardView /> },
  { path: '/app/inventory', element: <InventoryView /> },
  { path: '/app/sales', element: <SalesView /> },
  { path: '/app/customers', element: <CustomersView /> },
  { path: '/app/employees', element: <EmployeesView /> },
  { path: '/app/finance', element: <FinanceView /> },
  { path: '/app/reports', element: <ReportsView /> },
  { path: '/app/settings', element: <SettingsView /> },
  { path: '/app/*', element: <NotFoundView /> },
]
