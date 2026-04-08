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
 * ResolutionTrigger is a sparkle icon button that opens the resolution panel.
 */
export function ResolutionTrigger({
  unresolvedCount = 0,
  onClick,
  className,
}: ResolutionTriggerProps) {
  const { t } = useTranslation('shell')
  const hasIssues = unresolvedCount > 0

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(className)}
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
      {hasIssues ? (
        <SparklesIcon aria-hidden="true" />
      ) : (
        <CheckCircleIcon aria-hidden="true" />
      )}
    </Button>
  )
}
