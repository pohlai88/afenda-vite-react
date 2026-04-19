import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { ThemeColorMeta } from "./theme-color-meta"
import { AFENDA_THEME_STORAGE_KEYS } from "./theme-storage-contract"

/** Canonical localStorage key for public non-`/app` surfaces. */
export const VITE_PUBLIC_THEME_STORAGE_KEY = AFENDA_THEME_STORAGE_KEYS.marketing

export interface PublicThemeProviderProps {
  readonly children: ReactNode
}

/**
 * Public theme boundary shared by non-ERP route stacks.
 *
 * Keeps public surfaces isolated from `/app` theme persistence while aligning
 * with the blocking theme boot script for all non-app routes.
 */
export function PublicThemeProvider(props: PublicThemeProviderProps) {
  const { children } = props

  return (
    <ThemeProvider
      attribute="class"
      themes={["light", "dark"]}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey={VITE_PUBLIC_THEME_STORAGE_KEY}
    >
      {children}
      <ThemeColorMeta />
    </ThemeProvider>
  )
}
