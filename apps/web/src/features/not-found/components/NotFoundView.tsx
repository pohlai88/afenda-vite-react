import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export function NotFoundView() {
  const { t } = useTranslation('shell')

  return (
    <div className="not-found">
      <h1>{t('error.not_found.title')}</h1>
      <p>{t('error.not_found.description')}</p>
      <Link to="/app/dashboard">{t('error.not_found.link_dashboard')}</Link>
    </div>
  )
}
