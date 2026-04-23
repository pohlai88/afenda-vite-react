import { Toaster } from "@afenda/design-system/ui-primitives"
import { Outlet } from "react-router-dom"
import { PublicThemeProvider } from "../../theme"

import { AfendaAuthUiProvider } from "../better-auth-ui/afenda-auth-ui-provider"
import "../auth.css"

/** Standalone auth shell: owns provider stack, theme boundary, and route outlet for `/auth/*`. */
export function AuthLayout() {
  return (
    <PublicThemeProvider>
      <AfendaAuthUiProvider>
        <div data-testid="auth-layout-root" className="auth-root">
          <div className="auth-shell-content">
            <Outlet />
          </div>
        </div>
        <Toaster />
      </AfendaAuthUiProvider>
    </PublicThemeProvider>
  )
}
