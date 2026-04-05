import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { QueryProvider } from './share/providers/query-provider'
import { appRouter } from './share/routing/router'

function App() {
  return (
    <QueryProvider>
      <Suspense fallback={<div className="loading">Loading ERP System...</div>}>
        <RouterProvider router={appRouter} />
      </Suspense>
    </QueryProvider>
  )
}

export default App
