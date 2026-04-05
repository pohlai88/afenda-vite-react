import { useTranslation } from 'react-i18next'

export function LoginView() {
  const { t } = useTranslation('auth')

  return (
    <div className="login-page">
      <h1>{t('login.title.label')}</h1>
      <p>{t('login.subtitle.message')}</p>
      <div className="placeholder">{t('login.placeholder.message')}</div>
    </div>
  )
}
