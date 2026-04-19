import { Toaster } from "@afenda/design-system/ui-primitives"
import { Outlet } from "react-router-dom"

import "./marketing.css"

import { MarketingThemeProvider } from "./marketing-theme-provider"

/** Public marketing shell: isolated theme surface and ambient art direction, separate from `/app` shell state. */
export function MarketingLayout() {
  return (
    <MarketingThemeProvider>
      <div className="marketing-root">
        <div className="marketing-shell-content">
          <Outlet />
        </div>
      </div>
      <Toaster />
    </MarketingThemeProvider>
  )
}
