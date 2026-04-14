import { createBrowserRouter } from "react-router-dom"

import "./app/_platform/shell/types/shell-route-handle"

import { browserRoutes } from "./routes/route-browser"

/**
 * Top-level router factory only — shell routes under `src/routes/`; public marketing
 * route table (`route-marketing.tsx`) under `src/pages/route/`; UI under
 * `src/pages/marketing/`; layout +
 * theme under `src/pages/provider/`.
 */
export const router = createBrowserRouter(browserRoutes)
