import { ThemeProvider } from "next-themes"
import type { ReactNode } from "react"

import { ShellDensityRoot } from "./shell-density-root"
import { ShellMotionRoot } from "./shell-motion-root"
import { ThemeColorMeta } from "./theme-color-meta"

/**
 * Signed-in app (`/app/*`) theme — separate storage from public marketing routes.
 * Must match `apps/web/index.html` blocking script (same keys + `isApp` via `pathAfterViteBase` + Vite `base`).
 */
export const VITE_UI_THEME_STORAGE_KEY = "vite-ui-theme"

export interface AppThemeProviderProps {
  readonly children: ReactNode
}

/**
 * App shell color scheme: `class` on `document.documentElement`, aligned with
 * the `/app` branch of the blocking script in `index.html`.
 */
export function AppThemeProvider(props: AppThemeProviderProps) {
  const { children } = props

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      disableTransitionOnChange
      enableSystem
      storageKey={VITE_UI_THEME_STORAGE_KEY}
    >
      <ShellDensityRoot />
      <ShellMotionRoot />
      {children}
      <ThemeColorMeta />
    </ThemeProvider>
  )
}
