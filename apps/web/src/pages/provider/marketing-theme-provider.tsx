import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { ThemeColorMeta } from "../../app/_platform/theme/theme-color-meta"

/** localStorage key — must match `index.html` inline script for marketing routes. */
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
