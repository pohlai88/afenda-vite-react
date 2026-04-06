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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@afenda/ui/components/ui/popover'
import { cn } from '@afenda/ui/lib/utils'

import { TruthAlertTrigger } from '../block-ui'

export interface TruthAlertPanelProps {
  /** All alerts to display */
  alerts?: readonly TruthAlertItem[]
  /** Called when user clicks on an alert */
  onAlertClick?: (alert: TruthAlertItem) => void
  /** Called when user marks an alert as read */
  onMarkRead?: (alertId: string) => void
  /** Called when user marks all alerts as read */
  onMarkAllRead?: () => void
  className?: string
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

const SEVERITY_BORDER_COLORS: Record<TruthSeverity, string> = {
  valid: 'border-l-[var(--color-truth-valid)]',
  warning: 'border-l-[var(--color-truth-warning)]',
  broken: 'border-l-[var(--color-truth-broken)]',
  pending: 'border-l-[var(--color-truth-pending)]',
  neutral: 'border-l-[var(--color-truth-neutral)]',
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
  className,
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
          className={className}
        />
      </PopoverTrigger>
      <PopoverContent
        align="end"
        side="bottom"
        sideOffset={6}
        collisionPadding={16}
        className={cn(
          'flex max-h-[min(85vh,36rem)] w-[min(100vw-2rem,24rem)] flex-col gap-0 overflow-hidden p-0',
        )}
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
          className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4"
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
                <ul className="space-y-2">
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
      </PopoverContent>
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

  return (
    <div
      className={cn(
        'rounded-lg border border-l-4 bg-card p-3',
        SEVERITY_BORDER_COLORS[alert.severity],
        !alert.read && 'bg-accent/50',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className={cn('text-sm', !alert.read && 'font-medium')}>
              {alert.title}
            </p>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {categoryLabel}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {alert.description}
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            {new Date(alert.timestamp).toLocaleString()}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {!alert.read ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onMarkRead?.()
              }}
              aria-label={t('truth_alerts.mark_read', 'Mark as read')}
            >
              <CheckIcon className="size-3" aria-hidden />
            </Button>
          ) : null}
          {alert.resolution ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              type="button"
              onClick={onClick}
              aria-label={t('truth_alerts.view_resolution', 'View resolution')}
            >
              <ChevronRightIcon className="size-3" aria-hidden />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
