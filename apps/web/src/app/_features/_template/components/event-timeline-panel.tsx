import { CircleDot, DatabaseZap, Workflow } from "lucide-react"

import { cn } from "@afenda/design-system/utils"

import type { FeatureTemplateRecord } from "../types/feature-template"
import {
  formatFeatureTemplateStatus,
  getFeatureTemplateStatusClassName,
} from "../utils/feature-template-utils"

export interface EventTimelinePanelProps {
  readonly records: readonly FeatureTemplateRecord[]
}

const TIMELINE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
})

function TimelineIcon({ category }: { readonly category?: string }) {
  const className = "size-4"
  if (category === "Integration" || category === "Webhook") {
    return <DatabaseZap className={className} aria-hidden />
  }

  if (category === "Workflow" || category === "Policy") {
    return <Workflow className={className} aria-hidden />
  }

  return <CircleDot className={className} aria-hidden />
}

export function EventTimelinePanel({ records }: EventTimelinePanelProps) {
  return (
    <section
      className="ui-density-panel overflow-hidden"
      aria-labelledby="event-timeline-title"
    >
      <div className="border-b border-border-muted px-4 py-3">
        <h2 id="event-timeline-title" className="ui-title-section">
          Event Timeline
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Chronological stream for decisions, transitions, and system evidence.
        </p>
      </div>

      {records.length > 0 ? (
        <ol className="grid gap-0">
          {records.map((record, index) => (
            <li
              className="relative grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-3 px-4 py-4"
              key={record.id}
            >
              {index < records.length - 1 ? (
                <span
                  className="absolute top-10 bottom-0 left-[1.72rem] w-px bg-border-muted"
                  aria-hidden
                />
              ) : null}
              <span className="z-10 inline-flex size-8 items-center justify-center rounded-full border border-border-muted bg-card text-muted-foreground">
                <TimelineIcon category={record.category} />
              </span>

              <article className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-2">
                  <time
                    className="rounded-full border border-border-muted bg-muted/45 px-2 py-1 ui-mono-token text-muted-foreground"
                    dateTime={record.updatedAt}
                  >
                    {record.eventTimeLabel ??
                      TIMELINE_TIME_FORMATTER.format(
                        new Date(record.updatedAt)
                      )}
                  </time>
                  <span
                    className={cn(
                      "ui-status-pill px-2 py-1",
                      getFeatureTemplateStatusClassName(record.status)
                    )}
                  >
                    {formatFeatureTemplateStatus(record.status)}
                  </span>
                </div>

                <h3 className="mt-3 truncate font-semibold text-foreground">
                  {record.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                  {record.description}
                </p>
                <p className="mt-3 truncate text-xs text-muted-foreground">
                  <span translate="no">{record.id}</span> / {record.owner}
                </p>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="p-4">
          <p className="ui-empty-state">No timeline events were found.</p>
        </div>
      )}
    </section>
  )
}
