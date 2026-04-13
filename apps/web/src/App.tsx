import { Suspense } from "react"
import { RouterProvider } from "react-router-dom"

import { AppThemeProvider } from "@/app/_platform/theme/app-theme-provider"

import { router } from "./router"

/**
 * App root: global theme (`next-themes`) + React Router + Suspense.
 */
export default function App() {
  return (
    <AppThemeProvider>
      <Suspense
        fallback={
          <div className="p-4 text-sm text-muted-foreground">Loading…</div>
        }
      >
        <RouterProvider router={router} />
      </Suspense>
    </AppThemeProvider>
  )
}
