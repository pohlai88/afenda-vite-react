import { Suspense } from "react"
import { RouterProvider } from "react-router-dom"

import { router } from "./router"

/**
 * Minimal app shell: only React Router + Suspense.
 * Layer in providers (theme, query client, etc.) here when you need them.
 */
export default function App() {
  return (
    <Suspense
      fallback={
        <div className="p-4 text-sm text-muted-foreground">Loading…</div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  )
}
