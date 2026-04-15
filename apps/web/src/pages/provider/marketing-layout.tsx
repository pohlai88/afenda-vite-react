import { Outlet } from "react-router-dom"

import { MarketingThemeProvider } from "./marketing-theme-provider"

/** Public marketing shell: theme only (separate from `/app` ThemeProvider storage). */
export function MarketingLayout() {
  return (
    <MarketingThemeProvider>
      <Outlet />
    </MarketingThemeProvider>
  )
}
