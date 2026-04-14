"use client"

import { useTranslation } from "react-i18next"

/** Workspace title + tagline for the labels column header (optional slot). */
export function ShellLabelsColumnBrand() {
  const { t } = useTranslation("shell")

  return (
    <div className="min-w-0 px-1">
      <div className="truncate font-semibold text-sidebar-foreground">
        {t("sidebar.brand")}
      </div>
      <div className="truncate text-xs text-muted-foreground">
        {t("sidebar.brand_tagline")}
      </div>
    </div>
  )
}
