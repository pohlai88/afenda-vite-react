import { Link } from 'react-router-dom'
import { useAppShellStore } from '@/share/state/use-app-shell-store'

export function DashboardView() {
  const { currentUser } = useAppShellStore()

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ERP Dashboard</h1>
        <p>Welcome back, {currentUser?.name || 'User'}!</p>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Inventory</h3>
          <p>Manage your products and stock levels</p>
          <Link to="/app/inventory">View Inventory →</Link>
        </div>

        <div className="dashboard-card">
          <h3>Sales</h3>
          <p>Track orders and sales performance</p>
          <Link to="/app/sales">View Sales →</Link>
        </div>

        <div className="dashboard-card">
          <h3>Customers</h3>
          <p>Manage customer relationships</p>
          <Link to="/app/customers">View Customers →</Link>
        </div>

        <div className="dashboard-card">
          <h3>Finance</h3>
          <p>Financial reports and transactions</p>
          <Link to="/app/finance">View Finance →</Link>
        </div>

        <div className="dashboard-card">
          <h3>Employees</h3>
          <p>Staff management and HR</p>
          <Link to="/app/employees">View Employees →</Link>
        </div>

        <div className="dashboard-card">
          <h3>Reports</h3>
          <p>Analytics and business intelligence</p>
          <Link to="/app/reports">View Reports →</Link>
        </div>
      </div>
    </div>
  )
}
