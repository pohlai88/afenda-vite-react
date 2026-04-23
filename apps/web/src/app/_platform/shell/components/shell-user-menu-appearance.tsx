"use client"

import { useSyncExternalStore } from "react"
import { useTranslation } from "react-i18next"
import { useTheme } from "next-themes"

import {
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@afenda/design-system/ui-primitives"

import { useShellDensity } from "../../theme"

const noopSubscribe = () => () => {}

/**
 * Theme (next-themes) + density (`data-density`) controls for the shell account menu.
 */
export function ShellUserMenuAppearance() {
  const { t } = useTranslation("shell")
  const { theme, setTheme } = useTheme()
  const [density, setDensityPreference] = useShellDensity()
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  )

  const themeValue = isClient ? (theme ?? "system") : "system"

  return (
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>{t("user_menu.theme")}</DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-40">
          <DropdownMenuRadioGroup
            value={themeValue}
            onValueChange={(v) => {
              if (v === "light" || v === "dark" || v === "system") {
                setTheme(v)
              }
            }}
          >
            <DropdownMenuRadioItem value="light">
              {t("user_menu.theme_light")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              {t("user_menu.theme_dark")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              {t("user_menu.theme_system")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          {t("user_menu.density")}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-40">
          <DropdownMenuRadioGroup
            value={density}
            onValueChange={(v) => {
              if (v === "compact" || v === "comfortable" || v === "spacious") {
                setDensityPreference(v)
              }
            }}
          >
            <DropdownMenuRadioItem value="compact">
              {t("user_menu.density_compact")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="comfortable">
              {t("user_menu.density_comfortable")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="spacious">
              {t("user_menu.density_spacious")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  )
}
