import { useTranslation } from 'react-i18next'

import { useFinanceActionBar } from '../use-finance-action-bar'

export function AllocationView() {
  useFinanceActionBar()
  const { t } = useTranslation('allocation')

  return (
    <div className="page">
      <h1>{t('header.title.label')}</h1>
      <div className="placeholder">{t('error.over_allocated.message')}</div>
    </div>
  )
}
