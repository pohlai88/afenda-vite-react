import { createBrowserRouter } from "react-router-dom"

import "./app/_platform/shell/types/shell-route-handle"

import { browserRoutes } from "./routes/route-browser"

/** Align with Vite `base` / `import.meta.env.BASE_URL` for non-root deploys. */
function viteBaseToRouterBasename(): string | undefined {
  const base = import.meta.env.BASE_URL
  if (base === "/" || base === "") return undefined
  return base.endsWith("/") ? base.slice(0, -1) : base
}

const basename = viteBaseToRouterBasename()

export const router = createBrowserRouter(browserRoutes, {
  ...(basename ? { basename } : {}),
})
