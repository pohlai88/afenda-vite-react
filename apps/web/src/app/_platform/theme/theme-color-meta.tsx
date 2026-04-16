import { useTheme } from "next-themes"
import { useEffect } from "react"

const THEME_COLOR_LIGHT = "#ffffff"
const THEME_COLOR_DARK = "#0a0a0a"

/** Syncs `meta[name="theme-color"]` with the active next-themes resolved scheme. */
export function ThemeColorMeta() {
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
