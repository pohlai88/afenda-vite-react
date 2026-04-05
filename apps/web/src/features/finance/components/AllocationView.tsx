import { useTranslation } from 'react-i18next'

export function AllocationView() {
  const { t } = useTranslation('allocation')

  return (
    <div className="page">
      <h1>{t('header.title.label')}</h1>
      <div className="placeholder">{t('error.over_allocated.message')}</div>
    </div>
  )
}
