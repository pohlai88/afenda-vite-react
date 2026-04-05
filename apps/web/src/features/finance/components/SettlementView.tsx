import { useTranslation } from 'react-i18next'

export function SettlementView() {
  const { t } = useTranslation('settlement')

  return (
    <div className="page">
      <h1>{t('header.title.label')}</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>{t('status.pending.label')}</h3>
        </div>
        <div className="dashboard-card">
          <h3>{t('status.completed.label')}</h3>
        </div>
      </div>
    </div>
  )
}
