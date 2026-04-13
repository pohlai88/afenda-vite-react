import { createBrowserRouter } from "react-router-dom"

import "@/app/_platform/shell/types/shell-route-handle"

import { browserRoutes } from "@/routes/route-browser"

/**
 * Top-level router factory only — route definitions live under `src/routes/`.
 */
export const router = createBrowserRouter(browserRoutes)
