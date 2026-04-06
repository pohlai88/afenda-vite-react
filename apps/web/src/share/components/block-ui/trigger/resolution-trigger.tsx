import { type MouseEventHandler } from 'react'
import { SparklesIcon, CheckCircleIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { Button } from '@afenda/ui/components/ui/button'
import { cn } from '@afenda/ui/lib/utils'

export interface ResolutionTriggerProps {
  /** Number of unresolved issues */
  unresolvedCount?: number
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}

/**
 * ResolutionTrigger is a sparkle icon button (Neon-inspired) that opens the resolution panel.
 * Shows "All OK" when clean, or "Resolve (N)" when there are unresolved items.
 */
export function ResolutionTrigger({
  unresolvedCount = 0,
  onClick,
  className,
}: ResolutionTriggerProps) {
  const { t } = useTranslation('shell')
  const hasIssues = unresolvedCount > 0

  const icon = hasIssues ? (
    <SparklesIcon className="h-4 w-4" aria-hidden="true" />
  ) : (
    <CheckCircleIcon
      className="h-4 w-4 text-(--color-truth-valid)"
      aria-hidden="true"
    />
  )

  const desktopLabel = hasIssues ? (
    <span className="hidden sm:inline" aria-live="polite" aria-atomic="true">
      {t('resolution.resolve', 'Resolve')} ({unresolvedCount})
    </span>
  ) : (
    <span className="hidden sm:inline" aria-live="polite" aria-atomic="true">
      {t('resolution.all_ok', 'All OK')}
    </span>
  )

  const compactCount = hasIssues ? (
    <span className="sm:hidden" aria-hidden="true">
      {unresolvedCount}
    </span>
  ) : null

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={cn(
        'h-8 gap-1.5 px-2 text-sm font-medium',
        hasIssues
          ? 'text-(--color-truth-warning-foreground)'
          : 'text-(--color-truth-valid-foreground)',
        className,
      )}
      onClick={onClick}
      aria-label={
        hasIssues
          ? t('resolution.aria_label_issues', {
              count: unresolvedCount,
              defaultValue: `${unresolvedCount} issue${unresolvedCount > 1 ? 's' : ''} to resolve`,
            })
          : t('resolution.aria_label_ok', 'System OK')
      }
    >
      {icon}
      {desktopLabel}
      {compactCount}
    </Button>
  )
}
