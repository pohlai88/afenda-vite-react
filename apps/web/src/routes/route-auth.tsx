import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"

import { AppRouteErrorFallback } from "../app/_components"
import {
  AUTH_ROUTES,
  RouteAuthCallback,
  RouteAuthUnified,
} from "../app/_platform/auth"
import { AuthLayout } from "../app/_platform/auth/routes/auth-layout"
import { AuthThemeProvider } from "../app/_platform/auth/routes/auth-theme-provider"

/**
 * Public authentication routes.
 *
 * Owns:
 * - `/auth/*`
 * - auth callback handling
 * - legacy short-path redirects to canonical auth URLs
 *
 * Must not own:
 * - marketing/editorial routes
 * - ERP `/app` shell routes
 * - auth UI provider wiring outside route composition
 *
 * Composed at the root router alongside marketing and `/app`.
 *
 * @see ./README.md — router composition and shell policy.
 */
export const authRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <AuthLayout />,
    errorElement: (
      <AuthThemeProvider>
        <AppRouteErrorFallback homeHref="/" />
      </AuthThemeProvider>
    ),
    handle: { shell: null },
    children: [
      {
        path: "auth/callback",
        element: <RouteAuthCallback />,
        handle: { shell: null },
      },
      {
        path: "auth/*",
        element: <RouteAuthUnified />,
        handle: { shell: null },
      },
      {
        path: "login",
        element: <Navigate to={AUTH_ROUTES.login} replace />,
        handle: { shell: null },
      },
      {
        path: "register",
        element: <Navigate to={AUTH_ROUTES.register} replace />,
        handle: { shell: null },
      },
      {
        path: "forgot-password",
        element: <Navigate to={AUTH_ROUTES.forgotPassword} replace />,
        handle: { shell: null },
      },
      {
        path: "reset-password",
        element: <Navigate to={AUTH_ROUTES.resetPassword} replace />,
        handle: { shell: null },
      },
    ],
  },
]
