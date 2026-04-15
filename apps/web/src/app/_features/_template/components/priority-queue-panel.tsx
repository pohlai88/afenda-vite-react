import { Clock3, UserRound } from "lucide-react"

import { cn } from "@afenda/design-system/utils"

import type { FeatureTemplateRecord } from "../types/feature-template"
import {
  formatFeatureTemplateSeverity,
  formatFeatureTemplateStatus,
  getFeatureTemplateSeverityClassName,
  getFeatureTemplateStatusClassName,
} from "../utils/feature-template-utils"

export interface PriorityQueuePanelProps {
  readonly records: readonly FeatureTemplateRecord[]
  readonly onOpenRecord: (record: FeatureTemplateRecord) => void
}

const RECORD_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function formatRecordTime(record: FeatureTemplateRecord): string {
  return (
    record.eventTimeLabel ??
    RECORD_TIME_FORMATTER.format(new Date(record.updatedAt))
  )
}

export function PriorityQueuePanel({
  records,
  onOpenRecord,
}: PriorityQueuePanelProps) {
  return (
    <section
      className="ui-density-panel overflow-hidden"
      aria-labelledby="priority-queue-title"
    >
      <div className="border-b border-border-muted px-4 py-3">
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 id="priority-queue-title" className="ui-title-section">
              Priority Queue
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Operator-ready records shaped by SLA, risk, and ownership.
            </p>
          </div>
          <span className="ui-status-pill shrink-0 border-info/35 bg-info/10 text-info">
            {records.length} live
          </span>
        </div>
      </div>

      {records.length > 0 ? (
        <div className="divide-y divide-border-muted">
          {records.map((record, index) => (
            <button
              type="button"
              className={cn(
                "group flex w-full min-w-0 flex-col gap-3 px-4 py-4 text-left transition-colors duration-150 hover:bg-accent/35 focus-visible:bg-accent/45 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                index === 0 && "bg-accent/25"
              )}
              aria-label={`Open ${record.title}`}
              key={record.id}
              onClick={() => onOpenRecord(record)}
            >
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {record.category ? (
                      <span className="rounded-full border border-border-muted bg-muted/45 px-2 py-1 ui-mono-token text-muted-foreground">
                        {record.category}
                      </span>
                    ) : null}
                    <span
                      className={cn(
                        "ui-status-pill px-2 py-1",
                        getFeatureTemplateSeverityClassName(record.severity)
                      )}
                    >
                      {formatFeatureTemplateSeverity(record.severity)}
                    </span>
                  </div>

                  <h3 className="mt-3 line-clamp-2 font-semibold text-foreground">
                    {record.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {record.description}
                  </p>
                </div>

                <span
                  className={cn(
                    "ui-status-pill shrink-0",
                    getFeatureTemplateStatusClassName(record.status)
                  )}
                >
                  {formatFeatureTemplateStatus(record.status)}
                </span>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <UserRound className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{record.owner}</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5 shrink-0" aria-hidden />
                  {formatRecordTime(record)}
                </span>
                {record.slaLabel ? (
                  <span className="truncate">SLA: {record.slaLabel}</span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4">
          <p className="ui-empty-state">
            No records require operator attention in this scope.
          </p>
        </div>
      )}
    </section>
  )
}
