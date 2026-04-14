"use client"

import { useTranslation } from "react-i18next"

import {
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@afenda/design-system/ui-primitives"

import { changeLocale } from "../../i18n"
import {
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from "../../i18n/policy/i18n-policy"

const LOCALE_OPTIONS = [
  { value: "en" as const, labelKey: "language.option_en" as const },
  { value: "ms" as const, labelKey: "language.option_ms" as const },
  { value: "id" as const, labelKey: "language.option_id" as const },
  { value: "vi" as const, labelKey: "language.option_vi" as const },
] as const

function normalizeLocale(language?: string): SupportedLocale {
  const code = language?.split("-")[0]
  return SUPPORTED_LOCALES.find((l) => l === code) ?? "en"
}

export function ShellUserMenuLanguage() {
  const { i18n, t } = useTranslation("shell")
  const current = normalizeLocale(i18n.language)

  return (
    <DropdownMenuGroup>
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          {t("user_menu.language")}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="min-w-44">
          <DropdownMenuRadioGroup
            value={current}
            onValueChange={(v) => {
              if (SUPPORTED_LOCALES.includes(v as SupportedLocale)) {
                void changeLocale(v as SupportedLocale)
              }
            }}
          >
            {LOCALE_OPTIONS.map((option) => (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {t(option.labelKey)}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    </DropdownMenuGroup>
  )
}
