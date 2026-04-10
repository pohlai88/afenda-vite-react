import { memo, useCallback } from "react"
import { useTheme } from "@/components/theme-provider"
import { useTranslation } from "react-i18next"
import { Button } from "@afenda/shadcn-ui/components/ui/button"
import { MoonIcon, SunIcon } from "lucide-react"

export const ThemeToggle = memo(function ThemeToggle() {
  const { t } = useTranslation("shell")
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  const toggle = useCallback(() => {
    setTheme(isDark ? "light" : "dark")
  }, [isDark, setTheme])

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={t("theme.toggle")}
      className="size-8"
    >
      {isDark ? (
        <MoonIcon className="size-4" />
      ) : (
        <SunIcon className="size-4" />
      )}
    </Button>
  )
})
