import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'

const SLUG_TITLE_KEYS: Record<string, string> = {
  events: 'nav.workspace.event_log',
  audit: 'nav.workspace.audit_trail',
  partners: 'nav.workspace.partner_integrations',
}

/**
 * Placeholder for Afenda workspace routes that share the Supabase-style sidebar
 * slot count before dedicated modules exist.
 */
export function WorkspacePlaceholderView() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { t } = useTranslation('shell')

  const titleKey =
    SLUG_TITLE_KEYS[slug] ?? 'nav.workspace.placeholder_title'

  return (
    <div className="ui-page ui-section">
      <h1 className="ui-title">
        {t(titleKey, { defaultValue: slug })}
      </h1>
      <p className="ui-lede">
        {t('nav.workspace.placeholder_body')}
      </p>
    </div>
  )
}
