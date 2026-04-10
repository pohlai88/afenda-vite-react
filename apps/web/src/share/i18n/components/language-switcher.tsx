import { GlobeIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@afenda/shadcn-ui/components/ui/select"
import { SUPPORTED_LOCALES, type SupportedLocale } from "../policy"

const LOCALE_OPTIONS = [
  { value: "en" as const, labelKey: "language.option_en" as const },
  { value: "ms" as const, labelKey: "language.option_ms" as const },
  { value: "id" as const, labelKey: "language.option_id" as const },
  { value: "vi" as const, labelKey: "language.option_vi" as const },
] as const

export function LanguageSwitcher() {
  const { i18n, t } = useTranslation("shell")
  const languageOnly = (i18n.language ?? "en").split("-")[0] as SupportedLocale
  const current = SUPPORTED_LOCALES.includes(languageOnly) ? languageOnly : "en"

  return (
    <Select
      value={current}
      onValueChange={(next: string) => {
        void i18n.changeLanguage(next as SupportedLocale)
      }}
    >
      <SelectTrigger
        size="sm"
        className="gap-1.5 border-none bg-transparent shadow-none"
        aria-label={t("language.label")}
      >
        <GlobeIcon className="size-4 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALE_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
