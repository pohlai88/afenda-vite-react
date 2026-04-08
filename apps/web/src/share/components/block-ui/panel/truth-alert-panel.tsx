import { BellIcon, CheckIcon, ChevronRightIcon, FilterIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { TruthSeverity } from '@afenda/core/truth'
import type { TruthAlertItem } from '@afenda/core/truth-ui'
import {
  TRUTH_SEVERITY_ORDER,
  filterUnread,
  getHighestSeverity,
  sortByPriorityAndSeverity,
} from '@afenda/core/truth-ui'

import { Button } from '@afenda/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@afenda/ui/components/ui/dropdown-menu'
import { Popover, PopoverTrigger } from '@afenda/ui/components/ui/popover'

import { ShellPopoverContent } from '@/share/components/shell-ui'
import { cn } from '@afenda/ui/lib/utils'

import { getTruthSeverityPresentation } from '@afenda/shadcn-ui/semantic'
import { TruthAlertTrigger } from '../trigger'

export interface TruthAlertPanelProps {
  /** All alerts to display */
  alerts?: readonly TruthAlertItem[]
  /** Called when user clicks on an alert */
  onAlertClick?: (alert: TruthAlertItem) => void
  /** Called when user marks an alert as read */
  onMarkRead?: (alertId: string) => void
  /** Called when user marks all alerts as read */
  onMarkAllRead?: () => void
  /** Merged into {@link TruthAlertTrigger} (e.g. top nav icon rail). */
  triggerClassName?: string
}

const ORDERED_SEVERITIES = (
  Object.keys(TRUTH_SEVERITY_ORDER) as TruthSeverity[]
).sort((a, b) => TRUTH_SEVERITY_ORDER[a] - TRUTH_SEVERITY_ORDER[b])

const SEVERITY_GROUP_DEFAULTS: Record<TruthSeverity, string> = {
  broken: 'Broken',
  warning: 'Warnings',
  pending: 'Pending',
  neutral: 'Neutral',
  valid: 'Information',
}

/**
 * TruthAlertPanel: anchored popover (like ResolutionPanel) with alerts grouped by severity.
 * Unread filter lives in the header menu; category is shown on each row.
 */
export function TruthAlertPanel({
  alerts = [],
  onAlertClick,
  onMarkRead,
  onMarkAllRead,
  triggerClassName,
}: TruthAlertPanelProps) {
  const { t } = useTranslation('shell')
  const [open, setOpen] = useState(false)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const unreadCount = useMemo(() => filterUnread([...alerts]).length, [alerts])
  const highestSeverity = useMemo(
    () => getHighestSeverity([...alerts]),
    [alerts],
  )

  const filteredAlerts = useMemo(() => {
    const base = [...alerts]
    const afterUnread = showUnreadOnly ? filterUnread(base) : base
    return sortByPriorityAndSeverity(afterUnread)
  }, [alerts, showUnreadOnly])

  const groups = useMemo(
    () =>
      ORDERED_SEVERITIES.map((severity) => ({
        severity,
        items: filteredAlerts.filter((a) => a.severity === severity),
      })).filter((g) => g.items.length > 0),
    [filteredAlerts],
  )

  const handleAlertActivate = (alert: TruthAlertItem) => {
    onAlertClick?.(alert)
    if (onAlertClick) setOpen(false)
  }

  return (
    <Popover modal open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <TruthAlertTrigger
          count={unreadCount}
          severity={highestSeverity}
          className={triggerClassName}
        />
      </PopoverTrigger>
      <ShellPopoverContent
        shellVariant="topRail"
        className="flex w-96 flex-col gap-0 overflow-hidden p-0"
      >
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <h2
              id="truth-alert-panel-title"
              className="flex items-center gap-2 text-base font-semibold leading-tight"
            >
              <BellIcon className="size-5 shrink-0" aria-hidden />
              {t('truth_alerts.title', 'Truth Alerts')}
            </h2>
            <div className="flex shrink-0 items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
                    <FilterIcon className="size-3.5" aria-hidden />
                    {t('truth_alerts.filter', 'Filter')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={showUnreadOnly}
                    onCheckedChange={setShowUnreadOnly}
                  >
                    {t('truth_alerts.unread_only', 'Unread only')}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {unreadCount > 0 ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={() => onMarkAllRead?.()}
                >
                  <CheckIcon className="mr-1 size-3.5" aria-hidden />
                  {t('truth_alerts.mark_all_read', 'Mark all read')}
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="min-h-0 flex-1 flex flex-col gap-4 overflow-y-auto px-4 py-4"
          role="region"
          aria-labelledby="truth-alert-panel-title"
        >
          {groups.length > 0 ? (
            groups.map(({ severity, items }) => (
              <section
                key={severity}
                aria-labelledby={`truth-alerts-sev-${severity}`}
              >
                <h3
                  id={`truth-alerts-sev-${severity}`}
                  className="mb-2 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <span>
                    {t(
                      `truth_alerts.severity_group.${severity}`,
                      SEVERITY_GROUP_DEFAULTS[severity],
                    )}
                  </span>
                  <span className="font-normal normal-case text-muted-foreground">
                    ({items.length})
                  </span>
                </h3>
                <ul className="flex flex-col gap-2">
                  {items.map((alert) => (
                    <li key={alert.id}>
                      <AlertCard
                        alert={alert}
                        onClick={() => handleAlertActivate(alert)}
                        onMarkRead={() => onMarkRead?.(alert.id)}
                      />
                    </li>
                  ))}
                </ul>
              </section>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellIcon
                className="mb-2 size-10 text-muted-foreground/50"
                aria-hidden="true"
              />
              <p className="text-sm text-muted-foreground">
                {t('truth_alerts.no_alerts', 'No alerts')}
              </p>
            </div>
          )}
        </div>
      </ShellPopoverContent>
    </Popover>
  )
}

interface AlertCardProps {
  alert: TruthAlertItem
  onClick?: () => void
  onMarkRead?: () => void
}

function AlertCard({ alert, onClick, onMarkRead }: AlertCardProps) {
  const { t } = useTranslation('shell')

  const categoryLabel = t(`truth_alerts.tab_${alert.category}`, alert.category)
  const tone = getTruthSeverityPresentation(alert.severity)

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 bg-card p-3',
        tone.borderClassName,
        tone.rowClassName,
        !alert.read && 'bg-accent/50',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className={cn('text-sm', !alert.read && 'font-medium')}>
              {alert.title}
            </p>
            <span
              className={cn(
                'text-micro rounded-md px-1.5 py-0.5 font-medium',
                tone.pillClassName,
              )}
            >
              {categoryLabel}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {alert.description}
          </p>
          <p className="text-micro mt-1 text-muted-foreground">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {!alert.read ? (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMarkRead?.()
              }}
              aria-label={t('truth_alerts.mark_read', 'Mark as read')}
            >
              <CheckIcon aria-hidden />
            </Button>
          ) : null}
          {alert.resolution ? (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={onClick}
              aria-label={t('truth_alerts.view_resolution', 'View resolution')}
            >
              <ChevronRightIcon aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
