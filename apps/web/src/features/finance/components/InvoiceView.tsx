import { useTranslation } from 'react-i18next'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@afenda/ui/components/ui/card'

import { useFinanceActionBar } from '../hooks/use-finance-action-bar'

export function InvoiceView() {
  useFinanceActionBar()
  const { t } = useTranslation('invoice')

  return (
    <section className="ui-page ui-stack-relaxed">
      <header className="ui-header">
        <h1 className="ui-title-page">{t('header.title.label')}</h1>
      </header>
      <div className="ui-card-grid">
        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t('entity.label')}</CardTitle>
            <CardDescription>{t('status.paid.label')}</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t('entity.label')}</CardTitle>
            <CardDescription>{t('status.draft.label')}</CardDescription>
          </CardContent>
        </Card>
      </div>
      <div className="ui-empty-state">{t('total.message', { count: 24 })}</div>
    </section>
  )
}
