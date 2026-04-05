import { Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from './share/providers/query-provider'
import { appRouter } from './share/routing/router'

function AppShell() {
  const { t } = useTranslation('shell')
  return (
    <QueryProvider>
      <Suspense
        fallback={<div className="loading">{t('loading.erp_system')}</div>}
      >
        <RouterProvider router={appRouter} />
      </Suspense>
    </QueryProvider>
  )
}

function App() {
  return <AppShell />
}

export default App
