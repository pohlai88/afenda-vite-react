import { useTranslation } from 'react-i18next'

type PageContent = {
  title: string
  description: string
  placeholder: string
}

export type ErpModulePageId =
  | 'inventory'
  | 'sales'
  | 'customers'
  | 'employees'
  | 'finance'
  | 'reports'
  | 'settings'

export function ErpModulePage({ module: mod }: { module: ErpModulePageId }) {
  const { t } = useTranslation('shell')
  let content: PageContent

  switch (mod) {
    case 'inventory':
      content = {
        title: t('erp_module.inventory.page.title'),
        description: t('erp_module.inventory.page.description'),
        placeholder: t('erp_module.inventory.placeholder.message'),
      }
      break
    case 'sales':
      content = {
        title: t('erp_module.sales.page.title'),
        description: t('erp_module.sales.page.description'),
        placeholder: t('erp_module.sales.placeholder.message'),
      }
      break
    case 'customers':
      content = {
        title: t('erp_module.customers.page.title'),
        description: t('erp_module.customers.page.description'),
        placeholder: t('erp_module.customers.placeholder.message'),
      }
      break
    case 'employees':
      content = {
        title: t('erp_module.employees.page.title'),
        description: t('erp_module.employees.page.description'),
        placeholder: t('erp_module.employees.placeholder.message'),
      }
      break
    case 'finance':
      content = {
        title: t('erp_module.finance.page.title'),
        description: t('erp_module.finance.page.description'),
        placeholder: t('erp_module.finance.placeholder.message'),
      }
      break
    case 'reports':
      content = {
        title: t('erp_module.reports.page.title'),
        description: t('erp_module.reports.page.description'),
        placeholder: t('erp_module.reports.placeholder.message'),
      }
      break
    case 'settings':
      content = {
        title: t('erp_module.settings.page.title'),
        description: t('erp_module.settings.page.description'),
        placeholder: t('erp_module.settings.placeholder.message'),
      }
      break
  }

  return (
    <div className="page">
      <h1>{content.title}</h1>
      <p>{content.description}</p>
      <div className="placeholder">{content.placeholder}</div>
    </div>
  )
}
