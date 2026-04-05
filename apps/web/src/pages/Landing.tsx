import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Landing() {
  const { t } = useTranslation('shell')

  return (
    <main className="page">
      <h1>{`${t('marketing.landing.brand_name')} — ${t('marketing.landing.title')}`}</h1>
      <p>{t('marketing.landing.subtitle')}</p>
      <div className="placeholder">
        <p>{t('marketing.landing.placeholder_primary')}</p>
        <p>
          <Link to="/app/login">{t('marketing.landing.sign_in')}</Link>
          {` ${t('marketing.landing.sign_in_or')} `}
          <Link to="/app/dashboard">{t('marketing.landing.open_erp')}</Link>
          {t('marketing.landing.sentence_end')}
        </p>
      </div>
    </main>
  )
}
