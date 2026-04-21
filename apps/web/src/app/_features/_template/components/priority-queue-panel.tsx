import { Clock3, UserRound } from "lucide-react"

import { cn } from "@afenda/design-system/utils"

import {
  FeatureTemplatePanelEmptyState,
  FeatureTemplatePanelShell,
} from "./feature-template-panel-shell"
import { FeatureTemplateStatusPill } from "./feature-template-status-pill"
import type { FeatureTemplateRecord } from "../types/feature-template"
import {
  formatFeatureTemplateSeverity,
  getFeatureTemplateSeverityClassName,
} from "../feature-template-policy"
import {
  formatFeatureTemplateDateTime,
  normalizeFeatureTemplateText,
  resolveFeatureTemplateDateTime,
} from "../feature-template-formatters"

export interface PriorityQueuePanelProps {
  readonly records: readonly FeatureTemplateRecord[]
  readonly onOpenRecord: (record: FeatureTemplateRecord) => void
}

function PriorityQueueItem({
  record,
  isHighlighted,
  onOpenRecord,
}: {
  readonly record: FeatureTemplateRecord
  readonly isHighlighted: boolean
  readonly onOpenRecord: (record: FeatureTemplateRecord) => void
}) {
  const categoryLabel = normalizeFeatureTemplateText(record.category)
  const description = normalizeFeatureTemplateText(record.description)
  const ownerLabel = normalizeFeatureTemplateText(record.owner)
  const slaLabel = normalizeFeatureTemplateText(record.slaLabel)
  const dateTime = resolveFeatureTemplateDateTime(record.updatedAt)
  const timeLabel = formatFeatureTemplateDateTime(
    record.updatedAt,
    record.eventTimeLabel
  )

  return (
    <button
      type="button"
      className={cn(
        "group grid min-w-0 grid-cols-1 gap-3 px-4 py-4 text-left transition-colors duration-150 hover:bg-accent/35 focus-visible:bg-accent/45 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        isHighlighted && "bg-accent/25"
      )}
      aria-label={`Open ${record.title}`}
      onClick={() => onOpenRecord(record)}
    >
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <div className="min-w-0 overflow-hidden">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            {categoryLabel ? (
              <span className="max-w-full min-w-0 truncate rounded-full border border-border-muted bg-muted/45 px-2 py-1 ui-mono-token text-muted-foreground">
                {categoryLabel}
              </span>
            ) : null}
            <span
              className={cn(
                "ui-status-pill shrink-0 px-2 py-1",
                getFeatureTemplateSeverityClassName(record.severity)
              )}
            >
              {formatFeatureTemplateSeverity(record.severity)}
            </span>
          </div>

          <h3 className="mt-3 line-clamp-2 font-semibold wrap-break-word text-foreground">
            {record.title}
          </h3>
          {description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <FeatureTemplateStatusPill
          status={record.status}
          className="self-start"
        />
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
        {ownerLabel ? (
          <span className="inline-flex max-w-full min-w-0 items-center gap-1.5">
            <UserRound className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">{ownerLabel}</span>
          </span>
        ) : null}
        <time
          className="inline-flex min-w-0 shrink-0 items-center gap-1.5"
          dateTime={dateTime}
        >
          <Clock3 className="size-3.5 shrink-0" aria-hidden />
          <span className="truncate">{timeLabel}</span>
        </time>
        {slaLabel ? (
          <span className="max-w-full min-w-0 truncate">SLA: {slaLabel}</span>
        ) : null}
      </div>
    </button>
  )
}

export function PriorityQueuePanel({
  records,
  onOpenRecord,
}: PriorityQueuePanelProps) {
  const hasRecords = records.length > 0

  return (
    <FeatureTemplatePanelShell
      title="Priority Queue"
      description="Operator-ready records shaped by SLA, risk, and ownership."
      headingId="priority-queue-title"
      headerSlot={
        <span className="ui-status-pill shrink-0 border-info/35 bg-info/10 text-info">
          {records.length} live
        </span>
      }
    >
      {hasRecords ? (
        <div className="grid min-w-0 gap-0 divide-y divide-border-muted">
          {records.map((record, index) => (
            <PriorityQueueItem
              key={record.id}
              record={record}
              isHighlighted={index === 0}
              onOpenRecord={onOpenRecord}
            />
          ))}
        </div>
      ) : (
        <FeatureTemplatePanelEmptyState>
          No records require operator attention in this scope.
        </FeatureTemplatePanelEmptyState>
      )}
    </FeatureTemplatePanelShell>
  )
}
