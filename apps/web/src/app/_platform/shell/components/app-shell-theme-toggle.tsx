import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { startTransition, useEffect, useState, type ReactElement } from "react"
import { useTranslation } from "react-i18next"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/design-system/ui-primitives"

function ThemeGlyph(props: { readonly mode: string }): ReactElement {
  const { mode } = props
  if (mode === "light") {
    return <Sun className="size-4 shrink-0 text-muted-foreground" aria-hidden />
  }
  if (mode === "dark") {
    return (
      <Moon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
    )
  }
  return (
    <Monitor className="size-4 shrink-0 text-muted-foreground" aria-hidden />
  )
}

/**
 * Color scheme control for the app shell header (global preference, not route metadata).
 */
export function AppShellThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useTranslation("shell")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    startTransition(() => {
      setMounted(true)
    })
  }, [])

  if (!mounted) {
    return (
      <div
        className="flex h-9 min-w-22 items-center justify-center rounded-md border border-transparent"
        aria-hidden
      />
    )
  }

  const value = theme ?? "dark"

  return (
    <Select value={value} onValueChange={setTheme}>
      <SelectTrigger
        size="sm"
        className="touch-manipulation gap-1.5 border-none bg-transparent shadow-none"
        aria-label={t("theme.toggle")}
      >
        <ThemeGlyph mode={value === "system" ? "system" : value} />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="light">{t("theme.light")}</SelectItem>
        <SelectItem value="dark">{t("theme.dark")}</SelectItem>
        <SelectItem value="system">{t("theme.system")}</SelectItem>
      </SelectContent>
    </Select>
  )
}
