import { ThemeProvider, useTheme } from "next-themes"
import { useEffect, type ReactNode } from "react"

/** Must match `apps/web/index.html` inline script and `meta[name="theme-color"]` sync. */
export const VITE_UI_THEME_STORAGE_KEY = "vite-ui-theme"

const THEME_COLOR_LIGHT = "#ffffff"
const THEME_COLOR_DARK = "#0a0a0a"

function ThemeColorMeta() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) {
      return
    }
    let meta = document.querySelector(
      'meta[name="theme-color"]'
    ) as HTMLMetaElement | null
    if (!meta) {
      meta = document.createElement("meta")
      meta.setAttribute("name", "theme-color")
      document.head.appendChild(meta)
    }
    meta.setAttribute(
      "content",
      resolvedTheme === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT
    )
  }, [resolvedTheme])

  return null
}

export interface AppThemeProviderProps {
  readonly children: ReactNode
}

/**
 * Global color scheme: `class` on `document.documentElement`, shared with the
 * blocking script in `index.html` via {@link VITE_UI_THEME_STORAGE_KEY}.
 */
export function AppThemeProvider(props: AppThemeProviderProps) {
  const { children } = props

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      enableSystem
      storageKey={VITE_UI_THEME_STORAGE_KEY}
    >
      {children}
      <ThemeColorMeta />
    </ThemeProvider>
  )
}
