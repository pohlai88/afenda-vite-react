import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import { Navigate } from "react-router-dom"

import { AppRouteErrorFallback } from "../../../_components"
import { PublicThemeProvider } from "../../theme"
import { AUTH_ROUTES } from "../auth-paths"

const AuthLayout = lazy(() =>
  import("./auth-layout").then((module) => ({ default: module.AuthLayout }))
)

const RouteAuthCallback = lazy(() =>
  import("./route-auth-callback").then((module) => ({
    default: module.RouteAuthCallback,
  }))
)

const RouteAuthUnified = lazy(() =>
  import("./route-auth-unified").then((module) => ({
    default: module.RouteAuthUnified,
  }))
)

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
