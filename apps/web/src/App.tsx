/**
 * RESPONSIBILITY ENVELOPE
 * File role: top-level React app composition.
 * Owns: providers, suspense boundaries, router mounting, shell orchestration.
 * Must own only application composition concerns.
 * Must not own startup bootstrapping or global styling rules.
 * Safe edits: provider order, app-wide suspense, router handoff.
 * Unsafe edits: DOM mount code, token definitions, page-specific CSS.
 * Styling rule: consume shared app classes and tokens, do not define them here.
 * Related files: `main.tsx`, `share/routing/router.tsx`, `index.css`.
 */
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
