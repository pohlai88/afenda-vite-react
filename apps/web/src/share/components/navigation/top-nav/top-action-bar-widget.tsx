import { Link, useLocation } from 'react-router-dom'
import { icons as lucideIcons, CircleIcon, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@afenda/ui/lib/utils'

import type { TruthActionBarTab } from '@afenda/core/truth-ui'
import { getTruthSeverityPresentation } from '@afenda/shadcn-ui/semantic'

export interface TopActionBarWidgetProps {
  tab: TruthActionBarTab
  className?: string
}

export function TopActionBarWidget({
  tab,
  className,
}: TopActionBarWidgetProps) {
  const { t } = useTranslation('shell')
  const location = useLocation()
  const isActive = tab.isActive ?? location.pathname === tab.path

  const IconComponent: LucideIcon =
    (lucideIcons as Record<string, LucideIcon>)[tab.icon] ?? CircleIcon

  const label = t(tab.labelKey as never)
  const badgeTone = tab.badge
    ? getTruthSeverityPresentation(tab.badge.severity)
    : null

  return (
    <Link
      to={tab.path}
      className={cn(
        'flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
        className,
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      <IconComponent className="size-4" />
      <span>{label}</span>
      {tab.badge && (
        <span
          className={cn(
            'text-micro ml-1 rounded-full px-1.5 py-0.5 font-bold',
            badgeTone?.badgeClassName,
          )}
        >
          {tab.badge.value}
        </span>
      )}
    </Link>
  )
}
