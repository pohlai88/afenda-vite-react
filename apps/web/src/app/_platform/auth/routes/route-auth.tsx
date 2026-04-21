import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"

import { AppRouteErrorFallback } from "../../../_components"
import { PublicThemeProvider } from "../../theme/public-theme-provider"
import { AUTH_ROUTES } from "../auth-paths"
import { AuthLayout } from "./auth-layout"
import { RouteAuthCallback } from "./route-auth-callback"
import { RouteAuthUnified } from "./route-auth-unified"

/**
 * Public authentication route objects.
 */
export const authRouteObjects: RouteObject[] = [
  {
    path: "/",
    element: <AuthLayout />,
    errorElement: (
      <PublicThemeProvider>
        <AppRouteErrorFallback homeHref="/" />
      </PublicThemeProvider>
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
