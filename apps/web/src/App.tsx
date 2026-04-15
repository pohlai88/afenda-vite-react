import { Suspense } from "react"
import { RouterProvider } from "react-router-dom"

import { AppBootstrapLoading, RootErrorBoundary } from "./app/_components"
import { router } from "./router"

/**
 * App root: error boundary + React Router + Suspense. Theme providers live on route branches
 * (marketing vs `/app`) so public and internal surfaces do not share theme state.
 */
export default function App() {
  return (
    <RootErrorBoundary>
      <Suspense fallback={<AppBootstrapLoading />}>
        <RouterProvider router={router} />
      </Suspense>
    </RootErrorBoundary>
  )
}
