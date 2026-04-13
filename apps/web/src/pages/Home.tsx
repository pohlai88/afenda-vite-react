import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

export default function Landing() {
  const { t } = useTranslation('shell')

  return (
    <main className="ui-page ui-stack-relaxed">
      <header className="ui-header">
        <h1 className="ui-title-hero">
          {`${t('marketing.landing.brand_name')} — ${t('marketing.landing.title')}`}
        </h1>
        <p className="ui-lede">{t('marketing.landing.subtitle')}</p>
      </header>
      <div className="ui-empty-state ui-stack-tight">
        <p>{t('marketing.landing.placeholder_primary')}</p>
        <p>
          <Link className="text-link" to="/app/login">
            {t('marketing.landing.sign_in')}
          </Link>
          {` ${t('marketing.landing.sign_in_or')} `}
          <Link className="text-link" to="/app/dashboard">
            {t('marketing.landing.open_erp')}
          </Link>
          {t('marketing.landing.sentence_end')}
        </p>
      </div>
    </main>
  )
}
