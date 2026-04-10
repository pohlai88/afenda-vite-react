import { Link, useLocation } from "react-router-dom"
import { icons as lucideIcons, CircleIcon, type LucideIcon } from "lucide-react"
import { useTranslation } from "react-i18next"

import { cn } from "@afenda/shadcn-ui/lib/utils"

import type { ActionBarTab } from "@/share/types"
import { getIntegritySeverityPresentation } from "@afenda/shadcn-ui/semantic"

export interface TopActionBarWidgetProps {
  tab: ActionBarTab
  className?: string
}

export function TopActionBarWidget({
  tab,
  className,
}: TopActionBarWidgetProps) {
  const { t } = useTranslation("shell")
  const location = useLocation()
  const isActive = tab.isActive ?? location.pathname === tab.path

  const IconComponent: LucideIcon =
    (lucideIcons as Record<string, LucideIcon>)[tab.icon] ?? CircleIcon

  const label = t(tab.labelKey as never)
  const badgeTone = tab.badge
    ? getIntegritySeverityPresentation(tab.badge.severity)
    : null

  return (
    <Link
      to={tab.path}
      className={cn(
        "flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
        isActive
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
        className
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <IconComponent className="size-4" />
      <span>{label}</span>
      {tab.badge && (
        <span
          className={cn(
            "ml-1 rounded-full px-1.5 py-0.5 text-micro font-bold",
            badgeTone?.badgeClassName
          )}
        >
          {tab.badge.value}
        </span>
      )}
    </Link>
  )
}
