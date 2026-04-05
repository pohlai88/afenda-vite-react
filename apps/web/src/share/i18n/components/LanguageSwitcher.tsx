import { useTranslation } from 'react-i18next'

import { SUPPORTED_LOCALES, type SupportedLocale } from '../policy'

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation('shell')
  const languageOnly = (i18n.language ?? 'en').split('-')[0] as SupportedLocale
  const current = SUPPORTED_LOCALES.includes(languageOnly) ? languageOnly : 'en'

  return (
    <div className="language-switcher">
      <label htmlFor="afenda-locale-select">{t('language.label')}</label>
      <select
        id="afenda-locale-select"
        name="locale"
        value={current}
        aria-label={t('language.label')}
        onChange={(e) => {
          const next = e.target.value as SupportedLocale
          void i18n.changeLanguage(next)
        }}
      >
        <option value="en">{t('language.option_en')}</option>
        <option value="ms">{t('language.option_ms')}</option>
        <option value="id">{t('language.option_id')}</option>
        <option value="vi">{t('language.option_vi')}</option>
      </select>
    </div>
  )
}
