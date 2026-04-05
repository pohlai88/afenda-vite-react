import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { LanguageSwitcher } from '@/share/i18n'
import { useAppShellStore } from '@/share/state/use-app-shell-store'

export function DashboardView() {
  const { currentUser } = useAppShellStore()
  const { t } = useTranslation('dashboard')

  const displayName = currentUser?.name ?? t('header.guest_name.label')

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="dashboard-header-row">
          <div>
            <h1>{t('header.title.label')}</h1>
            <p>{t('header.welcome.message', { name: displayName })}</p>
            <p className="dashboard-demo-plural">
              {t('demo.priority_items', { count: 1 })}
              {` ${t('demo.separator')} `}
              {t('demo.priority_items', { count: 3 })}
            </p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>{t('card.inventory.title.label')}</h3>
          <p>{t('card.inventory.description.message')}</p>
          <Link to="/app/inventory">{t('card.inventory.link.label')}</Link>
        </div>

        <div className="dashboard-card">
          <h3>{t('card.sales.title.label')}</h3>
          <p>{t('card.sales.description.message')}</p>
          <Link to="/app/sales">{t('card.sales.link.label')}</Link>
        </div>

        <div className="dashboard-card">
          <h3>{t('card.customers.title.label')}</h3>
          <p>{t('card.customers.description.message')}</p>
          <Link to="/app/customers">{t('card.customers.link.label')}</Link>
        </div>

        <div className="dashboard-card">
          <h3>{t('card.finance.title.label')}</h3>
          <p>{t('card.finance.description.message')}</p>
          <Link to="/app/finance">{t('card.finance.link.label')}</Link>
        </div>

        <div className="dashboard-card">
          <h3>{t('card.employees.title.label')}</h3>
          <p>{t('card.employees.description.message')}</p>
          <Link to="/app/employees">{t('card.employees.link.label')}</Link>
        </div>

        <div className="dashboard-card">
          <h3>{t('card.reports.title.label')}</h3>
          <p>{t('card.reports.description.message')}</p>
          <Link to="/app/reports">{t('card.reports.link.label')}</Link>
        </div>
      </div>
    </div>
  )
}
