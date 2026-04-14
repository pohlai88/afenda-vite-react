import { Suspense } from "react"
import { RouterProvider } from "react-router-dom"

import { AppBootstrapLoading } from "./app/_components"
import { router } from "./router"

/**
 * App root: React Router + Suspense. Theme providers live on route branches
 * (marketing vs `/app`) so public and internal surfaces do not share theme state.
 */
export default function App() {
  return (
    <Suspense fallback={<AppBootstrapLoading />}>
      <RouterProvider router={router} />
    </Suspense>
  )
}
