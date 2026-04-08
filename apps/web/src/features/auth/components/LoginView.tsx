import { useTranslation } from 'react-i18next'

export function LoginView() {
  const { t } = useTranslation('auth')

  return (
    <section className="ui-page ui-stack-relaxed">
      <header className="ui-header">
        <h1 className="ui-title-page">{t('login.title.label')}</h1>
        <p className="ui-lede">{t('login.subtitle.message')}</p>
      </header>
      <div className="ui-empty-state">{t('login.placeholder.message')}</div>
    </section>
  )
}
