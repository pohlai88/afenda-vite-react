/**
 * Event timeline panel for feature template activity streams.
 *
 * Purpose:
 * - Render a chronological evidence surface for feature template records.
 * - Present event time, status, title, summary, and operator ownership.
 * - Keep rendering stable when optional fields are absent or malformed.
 *
 * Rules:
 * - Treat records as already ordered by the upstream domain/application layer.
 * - Keep category-to-icon resolution explicit and centrally governed.
 * - Avoid rendering fragile separators or empty content blocks.
 */
import { CircleDot, DatabaseZap, Workflow } from "lucide-react"

import {
  FeatureTemplatePanelEmptyState,
  FeatureTemplatePanelShell,
} from "./feature-template-panel-shell"
import { FeatureTemplateStatusPill } from "./feature-template-status-pill"
import type { FeatureTemplateRecord } from "../types/feature-template"
import {
  formatFeatureTemplateTime,
  normalizeFeatureTemplateText,
  resolveFeatureTemplateDateTime,
} from "../utils/feature-template-formatters"

import { resolveTimelineIconKind } from "./event-timeline-icon"

export interface EventTimelinePanelProps {
  readonly records: readonly FeatureTemplateRecord[]
}

function TimelineIcon({ category }: { readonly category?: string }) {
  const className = "size-4"

  switch (resolveTimelineIconKind(category)) {
    case "integration":
      return <DatabaseZap className={className} aria-hidden />
    case "workflow":
      return <Workflow className={className} aria-hidden />
    default:
      return <CircleDot className={className} aria-hidden />
  }
}

function TimelineMeta({ record }: { readonly record: FeatureTemplateRecord }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2">
      <time
        className="rounded-full border border-border-muted bg-muted/45 px-2 py-1 ui-mono-token text-muted-foreground"
        dateTime={resolveFeatureTemplateDateTime(record.updatedAt)}
      >
        {formatFeatureTemplateTime(record.updatedAt, record.eventTimeLabel)}
      </time>
      <FeatureTemplateStatusPill status={record.status} />
    </div>
  )
}

function TimelineDescription({
  description,
}: {
  readonly description: string
}) {
  const detail = normalizeFeatureTemplateText(description)
  if (!detail) {
    return null
  }

  return (
    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
      {detail}
    </p>
  )
}

function TimelineFooter({
  id,
  owner,
}: Pick<FeatureTemplateRecord, "id" | "owner">) {
  const ownerLabel = normalizeFeatureTemplateText(owner)

  return (
    <p className="mt-3 truncate text-xs text-muted-foreground">
      <span translate="no">{id}</span>
      {ownerLabel ? <> / {ownerLabel}</> : null}
    </p>
  )
}

function TimelineItem({
  record,
  isLastItem,
}: {
  readonly record: FeatureTemplateRecord
  readonly isLastItem: boolean
}) {
  return (
    <li className="relative grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-3 px-4 py-4">
      {!isLastItem ? (
        <span
          className="absolute top-10 bottom-0 left-[1.72rem] w-px bg-border-muted"
          aria-hidden
        />
      ) : null}
      <span className="z-10 inline-flex size-8 items-center justify-center rounded-full border border-border-muted bg-card text-muted-foreground">
        <TimelineIcon category={record.category} />
      </span>

      <article className="min-w-0">
        <TimelineMeta record={record} />

        <h3 className="mt-3 truncate font-semibold text-foreground">
          {record.title}
        </h3>
        <TimelineDescription description={record.description} />
        <TimelineFooter id={record.id} owner={record.owner} />
      </article>
    </li>
  )
}

export function EventTimelinePanel({ records }: EventTimelinePanelProps) {
  const hasRecords = records.length > 0

  return (
    <FeatureTemplatePanelShell
      title="Event Timeline"
      description="Chronological stream for decisions, transitions, and system evidence."
      headingId="event-timeline-title"
    >
      {hasRecords ? (
        <ol className="grid gap-0" aria-label="Event timeline entries">
          {records.map((record, index) => (
            <TimelineItem
              key={record.id}
              record={record}
              isLastItem={index === records.length - 1}
            />
          ))}
        </ol>
      ) : (
        <FeatureTemplatePanelEmptyState>
          No timeline events were found.
        </FeatureTemplatePanelEmptyState>
      )}
    </FeatureTemplatePanelShell>
  )
}
