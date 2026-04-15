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
      className="ui-density-panel min-w-0 overflow-hidden"
      aria-labelledby="priority-queue-title"
    >
      <div className="border-b border-border-muted px-4 py-3">
        <div className="flex min-w-0 items-center justify-between gap-[0.75rem]">
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
        <div className="grid min-w-0 gap-[0] divide-y divide-border-muted">
          {records.map((record, index) => (
            <button
              type="button"
              className={cn(
                "group grid min-w-0 grid-cols-1 gap-[0.75rem] px-4 py-4 text-left transition-colors duration-150 hover:bg-accent/35 focus-visible:bg-accent/45 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                index === 0 && "bg-accent/25"
              )}
              aria-label={`Open ${record.title}`}
              key={record.id}
              onClick={() => onOpenRecord(record)}
            >
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-start gap-[0.75rem]">
                <div className="min-w-0 overflow-hidden">
                  <div className="flex min-w-0 flex-wrap items-center gap-[0.5rem]">
                    {record.category ? (
                      <span className="max-w-full min-w-0 truncate rounded-full border border-border-muted bg-muted/45 px-2 py-1 ui-mono-token text-muted-foreground">
                        {record.category}
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
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {record.description}
                  </p>
                </div>

                <span
                  className={cn(
                    "ui-status-pill shrink-0 self-start",
                    getFeatureTemplateStatusClassName(record.status)
                  )}
                >
                  {formatFeatureTemplateStatus(record.status)}
                </span>
              </div>

              <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="inline-flex max-w-full min-w-0 items-center gap-[0.375rem]">
                  <UserRound className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{record.owner}</span>
                </span>
                <span className="inline-flex min-w-0 shrink-0 items-center gap-[0.375rem]">
                  <Clock3 className="size-3.5 shrink-0" aria-hidden />
                  <span className="truncate">{formatRecordTime(record)}</span>
                </span>
                {record.slaLabel ? (
                  <span className="max-w-full min-w-0 truncate">
                    SLA: {record.slaLabel}
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="p-[1rem]">
          <p className="ui-empty-state">
            No records require operator attention in this scope.
          </p>
        </div>
      )}
    </section>
  )
}
