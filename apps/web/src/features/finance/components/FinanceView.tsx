import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ErpModulePage } from '@/share/i18n'
import { Button } from '@afenda/ui/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@afenda/ui/components/ui/card'

import { useFinanceActionBar } from '../hooks/use-finance-action-bar'

export function FinanceView() {
  useFinanceActionBar()
  const { t } = useTranslation(['invoice', 'allocation', 'settlement'])

  return (
    <ErpModulePage module="finance">
      <div className="ui-card-grid">
        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t('invoice:header.title.label')}</CardTitle>
            <CardDescription>
              {t('invoice:total.message', { count: 12 })}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/invoices">{t('invoice:entity.label')}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t('allocation:header.title.label')}</CardTitle>
            <CardDescription>
              {t('allocation:error.over_allocated.message')}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/allocations">
                {t('allocation:header.title.label')}
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="ui-stack">
            <CardTitle>{t('settlement:header.title.label')}</CardTitle>
            <CardDescription>
              {`${t('settlement:status.pending.label')} / ${t('settlement:status.completed.label')}`}
            </CardDescription>
            <Button variant="link" size="text" asChild>
              <Link to="/app/settlements">
                {t('settlement:header.title.label')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </ErpModulePage>
  )
}
