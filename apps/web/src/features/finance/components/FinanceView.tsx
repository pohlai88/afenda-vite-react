import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ErpModulePage } from '@/share/i18n'

export function FinanceView() {
  const { t } = useTranslation(['invoice', 'allocation', 'settlement'])

  return (
    <div className="page">
      <ErpModulePage module="finance" />
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>{t('invoice:header.title.label')}</h3>
          <p>{t('invoice:total.message', { count: 12 })}</p>
          <Link to="/app/invoices">{t('invoice:entity.label')}</Link>
        </div>
        <div className="dashboard-card">
          <h3>{t('allocation:header.title.label')}</h3>
          <p>{t('allocation:error.over_allocated.message')}</p>
          <Link to="/app/allocations">
            {t('allocation:header.title.label')}
          </Link>
        </div>
        <div className="dashboard-card">
          <h3>{t('settlement:header.title.label')}</h3>
          <p>
            {`${t('settlement:status.pending.label')} / ${t('settlement:status.completed.label')}`}
          </p>
          <Link to="/app/settlements">
            {t('settlement:header.title.label')}
          </Link>
        </div>
      </div>
    </div>
  )
}
