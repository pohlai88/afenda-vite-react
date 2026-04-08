import { type MouseEventHandler } from 'react'
import { BellIcon } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import type { TruthSeverity } from '@afenda/core/truth'
import { Button } from '@afenda/ui/components/ui/button'
import { cn } from '@afenda/ui/lib/utils'
import { getTruthSeverityPresentation } from '@afenda/shadcn-ui/semantic'

export interface TruthAlertTriggerProps {
  /** Total count of alerts (failures + warnings) */
  count?: number
  /** Highest severity among alerts */
  severity?: TruthSeverity
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}

const SEVERITY_STATUS_DEFAULTS: Record<TruthSeverity, string> = {
  valid: 'Truth status: all clear',
  warning: 'Truth status: warning',
  broken: 'Truth status: broken',
  pending: 'Truth status: pending',
  neutral: 'Truth status: neutral',
}

/**
 * TruthAlertTrigger replaces the generic notification bell.
 * Shows severity-colored dot and badge count from the truth health store.
 */
export function TruthAlertTrigger({
  count = 0,
  severity = 'neutral',
  onClick,
  className,
}: TruthAlertTriggerProps) {
  const { t } = useTranslation('shell')
  const hasAlerts = count > 0
  const countLabel = count > 99 ? '99+' : String(count)
  const tone = getTruthSeverityPresentation(severity)

  const severityStatusLabel = t(
    `truth_alerts.severity.${severity}`,
    SEVERITY_STATUS_DEFAULTS[severity],
  )

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn('relative', className)}
      onClick={onClick}
      aria-label={
        hasAlerts
          ? t('truth_alerts.aria_label_count', {
              count,
              defaultValue: `${count} truth alert${count > 1 ? 's' : ''}`,
            })
          : t('truth_alerts.aria_label_none', 'No truth alerts')
      }
    >
      <BellIcon aria-hidden="true" />
      {hasAlerts ? (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 flex h-4 w-min min-w-4 items-center justify-center rounded-full px-1 text-xs font-bold leading-tight ring-2 ring-background',
            tone.badgeClassName,
          )}
          aria-live="polite"
          aria-atomic="true"
        >
          {countLabel}
        </span>
      ) : (
        <span
          className={cn(
            'absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full ring-2 ring-background',
            tone.dotClassName,
          )}
          role="status"
          aria-label={severityStatusLabel}
        />
      )}
    </Button>
  )
}
