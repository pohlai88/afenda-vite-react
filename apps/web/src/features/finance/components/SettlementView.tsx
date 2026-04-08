import { useTranslation } from 'react-i18next'
import {
  SemanticPanel,
  SemanticSection,
  SettlementBadge,
} from '@afenda/shadcn-ui/semantic'

import { useFinanceActionBar } from '../hooks'

export function SettlementView() {
  useFinanceActionBar()
  const { t } = useTranslation('settlement')

  return (
    <section className="ui-page ui-stack-relaxed">
      <header className="ui-header">
        <h1 className="ui-title-page">{t('header.title.label')}</h1>
      </header>
      <SemanticSection
        title={t('header.title.label')}
        description={t('status.pending.label')}
      >
        <SemanticPanel
          surface="panel"
          header={t('status.pending.label')}
          toolbar={<SettlementBadge state="open" />}
        >
          <p>{t('status.pending.label')}</p>
        </SemanticPanel>
        <SemanticPanel
          surface="elevated"
          header={t('status.completed.label')}
          toolbar={<SettlementBadge state="settled" />}
        >
          <p>{t('status.completed.label')}</p>
        </SemanticPanel>
      </SemanticSection>
    </section>
  )
}
