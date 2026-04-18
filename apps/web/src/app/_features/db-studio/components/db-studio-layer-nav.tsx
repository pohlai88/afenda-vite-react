"use client"

import { useTranslation } from "react-i18next"

import { cn } from "@afenda/design-system/utils"

const SECTIONS = [
  { id: "db-studio-catalog", labelKey: "nav_catalog" as const },
  { id: "db-studio-governance", labelKey: "nav_governance" as const },
  { id: "db-studio-logical", labelKey: "nav_logical" as const },
  { id: "db-studio-physical", labelKey: "nav_physical" as const },
  { id: "db-studio-evidence", labelKey: "nav_evidence" as const },
]

/**
 * In-page anchors mapping conceptual → governance → logical → physical → audit evidence
 * @see packages/_database/src/studio
 */
export function DbStudioLayerNav(props: { readonly className?: string }) {
  const { t } = useTranslation("shell")
  const { className } = props

  return (
    <nav
      aria-label={t("db_studio.layer_nav_aria")}
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-2 border-b border-border pb-3",
        className
      )}
    >
      {SECTIONS.map((s) => (
        <a
          key={s.id}
          href={`#${s.id}`}
          className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
        >
          {t(`db_studio.${s.labelKey}`)}
        </a>
      ))}
    </nav>
  )
}
