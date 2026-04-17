import { Outlet, useLocation } from "react-router-dom"

import "../../styles/marketing.css"

import { MarketingThemeProvider } from "./marketing-theme-provider"

/** Public marketing shell: theme + ambient art direction (separate from `/app` ThemeProvider storage). */
export function MarketingLayout() {
  const location = useLocation()
  const isPlatformPreview = location.pathname.startsWith("/platform-preview")

  return (
    <MarketingThemeProvider>
      <div
        className={[
          "marketing-root",
          isPlatformPreview ? "marketing-root--platform-preview" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Outlet />
      </div>
    </MarketingThemeProvider>
  )
}
