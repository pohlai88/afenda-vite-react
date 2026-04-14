import { useHasMounted } from "@afenda/design-system/hooks"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"

import { Button } from "@afenda/design-system/ui-primitives"

type MarketingThemeMode = "light" | "dark" | "system"

function MarketingThemeModeGlyph(props: { readonly mode: MarketingThemeMode }) {
  const { mode } = props

  switch (mode) {
    case "light":
      return <Sun aria-hidden className="size-4 shrink-0 opacity-90" />
    case "dark":
      return <Moon aria-hidden className="size-4 shrink-0 opacity-90" />
    case "system":
      return <Monitor aria-hidden className="size-4 shrink-0 opacity-90" />
  }
}

export function MarketingThemeCycleButton() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation("shell")
  const mounted = useHasMounted()

  const mode: MarketingThemeMode =
    theme === "light" || theme === "dark" ? theme : "system"
  const next: MarketingThemeMode =
    mode === "light" ? "dark" : mode === "dark" ? "system" : "light"

  const modeLabel =
    mode === "system"
      ? t("theme.system")
      : mode === "dark"
        ? t("theme.dark")
        : t("theme.light")

  if (!mounted) {
    return (
      <Button
        className="min-w-36 justify-center gap-2"
        disabled
        size="sm"
        variant="outline"
      >
        <span aria-hidden className="size-4 shrink-0" />
        <span className="text-muted-foreground">…</span>
      </Button>
    )
  }

  return (
    <Button
      aria-label={t("marketing.token_playground.theme_cycle_aria")}
      className="min-w-36 justify-center gap-2"
      onClick={() => setTheme(next)}
      size="sm"
      title={t("marketing.token_playground.theme_cycle")}
      type="button"
      variant="outline"
    >
      <MarketingThemeModeGlyph mode={mode} />
      <span className="truncate">{modeLabel}</span>
    </Button>
  )
}
