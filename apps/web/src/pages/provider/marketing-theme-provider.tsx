import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { ThemeColorMeta } from "../../app/_platform/theme/theme-color-meta"

/**
 * Public marketing routes only — separate storage from the signed-in app so
 * theme choice on `/` does not affect `/app/*` and vice versa.
 * Must match `index.html` path-based key selection for FOUC.
 */
export const VITE_MARKETING_THEME_STORAGE_KEY = "vite-ui-marketing-theme"

export interface MarketingThemeProviderProps {
  readonly children: ReactNode
}

export function MarketingThemeProvider(props: MarketingThemeProviderProps) {
  const { children } = props

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey={VITE_MARKETING_THEME_STORAGE_KEY}
    >
      {children}
      <ThemeColorMeta />
    </ThemeProvider>
  )
}
