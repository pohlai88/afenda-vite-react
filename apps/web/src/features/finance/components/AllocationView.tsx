import { useTranslation } from 'react-i18next'
import {
  AllocationBadge,
  SemanticAlert,
  SemanticPanel,
  SemanticSection,
} from '@afenda/shadcn-ui/semantic'

import { useFinanceActionBar } from '../hooks'

export function AllocationView() {
  useFinanceActionBar()
  const { t } = useTranslation('allocation')

  return (
    <section className="ui-page ui-stack-relaxed">
      <header className="ui-header">
        <h1 className="ui-title-page">{t('header.title.label')}</h1>
      </header>
      <SemanticSection
        title={t('header.title.label')}
        description={t('error.over_allocated.message')}
        toolbar={<AllocationBadge state="blocked" />}
      >
        <SemanticPanel header={t('header.title.label')}>
          <SemanticAlert
            tone="destructive"
            emphasis="soft"
            title={t('header.title.label')}
            description={t('error.over_allocated.message')}
            role="alert"
          />
        </SemanticPanel>
      </SemanticSection>
    </section>
  )
}
