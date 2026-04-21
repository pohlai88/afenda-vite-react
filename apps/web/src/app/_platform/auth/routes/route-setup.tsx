import { Navigate, type RouteObject } from "react-router-dom"

import { AppRouteErrorFallback } from "../../../_components"
import {
  ProfileSetupPage,
  SetupLayout,
  WorkspaceSetupPage,
} from "../../../_features/setup"
import { AppThemeProvider } from "../../theme/app-theme-provider"
import "../auth.css"
import { AfendaAuthUiProvider } from "../better-auth-ui/afenda-auth-ui-provider"
import { RequireAuth } from "../guards/require-auth"
import { RequireSetupRoute } from "../guards/require-setup-route"
import { SETUP_ROUTES } from "../setup-paths"

/**
 * Standalone authenticated setup routes under `/setup/*`.
 */
export const setupRouteObject: RouteObject = {
  path: "/setup",
  element: (
    <AppThemeProvider>
      <AfendaAuthUiProvider>
        <RequireAuth>
          <SetupLayout />
        </RequireAuth>
      </AfendaAuthUiProvider>
    </AppThemeProvider>
  ),
  errorElement: (
    <AppThemeProvider>
      <AppRouteErrorFallback />
    </AppThemeProvider>
  ),
  handle: { shell: null },
  children: [
    {
      index: true,
      element: <RequireSetupRoute mode="index" />,
      handle: { shell: null },
    },
    {
      path: "workspace",
      element: (
        <RequireSetupRoute mode="workspace">
          <WorkspaceSetupPage />
        </RequireSetupRoute>
      ),
      handle: { shell: null },
    },
    {
      path: "profile",
      element: (
        <RequireSetupRoute mode="profile">
          <ProfileSetupPage />
        </RequireSetupRoute>
      ),
      handle: { shell: null },
    },
    {
      path: "*",
      element: <Navigate to={SETUP_ROUTES.root} replace />,
      handle: { shell: null },
    },
  ],
}
