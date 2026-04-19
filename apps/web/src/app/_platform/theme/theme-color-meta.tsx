import { useTheme } from "next-themes"
import { useEffect } from "react"

const THEME_COLOR_LIGHT = "#ffffff"
const THEME_COLOR_DARK = "#0a0a0a"

function getThemeColorMeta(): HTMLMetaElement {
  let meta = document.querySelector(
    'meta[name="theme-color"]'
  ) as HTMLMetaElement | null

  if (!meta) {
    meta = document.createElement("meta")
    meta.name = "theme-color"
    document.head.appendChild(meta)
  }

  return meta
}

/** Updates `theme-color` from resolved theme; `index.html` sets `color-scheme` + default `theme-color`. */
export function ThemeColorMeta() {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    if (!resolvedTheme) return

    const meta = getThemeColorMeta()
    meta.content =
      resolvedTheme === "dark" ? THEME_COLOR_DARK : THEME_COLOR_LIGHT
  }, [resolvedTheme])

  return null
}
