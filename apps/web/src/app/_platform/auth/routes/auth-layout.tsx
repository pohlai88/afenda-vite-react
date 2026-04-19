import { Toaster } from "@afenda/design-system/ui-primitives"
import { Outlet } from "react-router-dom"

import { AfendaPublicAuthUiProvider } from "../better-auth-ui/afenda-public-auth-ui-provider"

import { AuthThemeProvider } from "./auth-theme-provider"

/** Standalone auth shell: owns provider stack, theme boundary, and route outlet for `/auth/*`. */
export function AuthLayout() {
  return (
    <AuthThemeProvider>
      <AfendaPublicAuthUiProvider>
        <div className="auth-root">
          <div className="auth-shell-content">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </AfendaPublicAuthUiProvider>
    </AuthThemeProvider>
  )
}
