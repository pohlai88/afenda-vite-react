import type { ReactNode } from "react"

import {
  PublicThemeProvider,
  VITE_PUBLIC_THEME_STORAGE_KEY,
} from "../app/_platform/theme"

/** Canonical localStorage key for the public marketing surface. Must match the pre-hydration theme boot script. */
export const VITE_MARKETING_THEME_STORAGE_KEY = VITE_PUBLIC_THEME_STORAGE_KEY

export interface MarketingThemeProviderProps {
  readonly children: ReactNode
}

/**
 * Public marketing theme boundary.
 *
 * Isolated from `/app` theme persistence and intended only for public routes.
 * Theme storage contract must remain aligned with the blocking theme boot script.
 */
export function MarketingThemeProvider(props: MarketingThemeProviderProps) {
  const { children } = props

  return <PublicThemeProvider>{children}</PublicThemeProvider>
}
