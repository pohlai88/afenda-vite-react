import { Link, useLocation } from 'react-router-dom'
import { icons as lucideIcons, CircleIcon, type LucideIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@afenda/ui/lib/utils'

import type { TruthActionBarTab } from '@afenda/core/truth-ui'
import type { TruthSeverity } from '@afenda/core/truth'

export interface ActionBarItemProps {
  tab: TruthActionBarTab
  className?: string
}

const BADGE_COLORS: Record<TruthSeverity, string> = {
  valid:
    'bg-[var(--color-truth-valid)] text-[var(--color-truth-valid-foreground)]',
  warning:
    'bg-[var(--color-truth-warning)] text-[var(--color-truth-warning-foreground)]',
  broken:
    'bg-[var(--color-truth-broken)] text-[var(--color-truth-broken-foreground)]',
  pending:
    'bg-[var(--color-truth-pending)] text-[var(--color-truth-pending-foreground)]',
  neutral:
    'bg-[var(--color-truth-neutral)] text-[var(--color-truth-neutral-foreground)]',
}

/**
 * ActionBarItem renders a single tab in the action bar.
 * Includes icon, label, and optional truth-aware badge.
 */
export function ActionBarItem({ tab, className }: ActionBarItemProps) {
  const { t } = useTranslation('shell')
  const location = useLocation()
  const isActive = tab.isActive ?? location.pathname === tab.path

  const IconComponent: LucideIcon =
    (lucideIcons as Record<string, LucideIcon>)[tab.icon] ?? CircleIcon

  const label = t(tab.labelKey as never)

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
            'ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold',
            BADGE_COLORS[tab.badge.severity],
          )}
        >
          {tab.badge.value}
        </span>
      )}
    </Link>
  )
}
