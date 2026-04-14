import { Outlet } from "react-router-dom"

import { MarketingThemeProvider } from "./marketing-theme-provider"

/**
 * Layout for public marketing routes only — not used under `/app`.
 */
export function MarketingLayout() {
  return (
    <MarketingThemeProvider>
      <Outlet />
    </MarketingThemeProvider>
  )
}
