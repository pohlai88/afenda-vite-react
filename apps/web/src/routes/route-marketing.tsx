/**
 * Public (unauthenticated) route tree: landing and auth screens under `/`.
 *
 * - Mounted with `MarketingLayout`; does **not** use the ERP `/app` shell.
 * - Every leaf declares `handle: { shell: null }` so shell policy stays explicit.
 * - Add new marketing/auth paths here, then ensure i18n and links stay consistent.
 *
 * For how this composes into `browserRoutes` and who calls `createBrowserRouter`, see the package doc below—not this file.
 *
 * @see ./README.md — router usage, marketing vs `/app/*`, and adding routes.
 */

import type { RouteObject } from "react-router-dom"

import ForgotPasswordPage from "../app/_platform/auth/forgot-password"
import LandingPage from "../pages/landing"
import LoginPage from "../app/_platform/auth/login"
import RegisterPage from "../app/_platform/auth/register"
import ResetPasswordPage from "../app/_platform/auth/reset-password"
import { MarketingLayout } from "../pages/provider/marketing-layout"

/** Public routes under `MarketingLayout`: `/`, auth screens. Does not mount the `/app` shell. */
export const marketingRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <MarketingLayout />,
    children: [
      { index: true, element: <LandingPage />, handle: { shell: null } },
      { path: "login", element: <LoginPage />, handle: { shell: null } },
      { path: "register", element: <RegisterPage />, handle: { shell: null } },
      {
        path: "forgot-password",
        element: <ForgotPasswordPage />,
        handle: { shell: null },
      },
      {
        path: "reset-password",
        element: <ResetPasswordPage />,
        handle: { shell: null },
      },
    ],
  },
]
