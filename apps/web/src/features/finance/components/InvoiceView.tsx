import { useTranslation } from 'react-i18next'

export function InvoiceView() {
  const { t } = useTranslation('invoice')

  return (
    <div className="page">
      <h1>{t('header.title.label')}</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>{t('entity.label')}</h3>
          <p>{t('status.paid.label')}</p>
        </div>
        <div className="dashboard-card">
          <h3>{t('entity.label')}</h3>
          <p>{t('status.draft.label')}</p>
        </div>
      </div>
      <div className="placeholder">{t('total.message', { count: 24 })}</div>
    </div>
  )
}
