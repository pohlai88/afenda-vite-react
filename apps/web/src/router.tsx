import { createBrowserRouter } from "react-router-dom"

import Home from "@/pages/Home"

/**
 * Top-level browser routes for the Vite SPA entry.
 * Add feature entry routes here; keep feature implementation under `src/app/_features/*`.
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
])
