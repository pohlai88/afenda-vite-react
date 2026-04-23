import { type ReactNode, useMemo, useState } from "react"
import { Clock3, Link2, ShieldCheck, UserRound } from "lucide-react"
import { useTranslation } from "react-i18next"

import {
  AppSurface,
  type AppSurfaceKind,
  type AppSurfaceContract,
  StateSurface,
} from "@/app/_platform/app-surface"
import { ApiClientHttpError } from "@/app/_platform/runtime"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@afenda/design-system/ui-primitives"
import { cn } from "@afenda/design-system/utils"

import { useEventsWorkspace } from "../hooks/use-events-workspace"
import { useOpsAuditFeed } from "../hooks/use-ops-audit-feed"
import { useOpsCounterpartyFeed } from "../hooks/use-ops-counterparty-feed"
import type {
  OpsAuditFeedItem,
  OpsAuditFeedResponse,
  OpsEventsWorkspaceFeedResponse,
  WorkspaceAuditEntry,
  WorkspaceCounterparty,
  WorkspaceCounterpartyHealth,
  WorkspaceEvent,
  WorkspaceMetric,
  WorkspaceSnapshot,
} from "../types/workspace-ops"

type AuditRenderableEntry = Pick<
  WorkspaceAuditEntry,
  | "id"
  | "eventCode"
  | "title"
  | "description"
  | "actorLabel"
  | "actorRole"
  | "actionLabel"
  | "occurredAt"
>

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

function createWorkspaceSurfaceContract(input: {
  readonly title: string
  readonly description: string
  readonly kicker: string
  readonly workspace?:
    | Pick<
        WorkspaceSnapshot["workspace"],
        "tenantName" | "operatingWindowLabel" | "lastUpdatedAt"
      >
    | null
    | {
        readonly tenantName: string
        readonly operatingWindowLabel: string
        readonly lastUpdatedAt: string | null
      }
}): AppSurfaceContract {
  return {
    kind: "workspace",
    header: {
      kicker: input.kicker,
      title: input.title,
      description: input.description,
    },
    metaRow: input.workspace
      ? {
          items: [
            {
              id: "tenant",
              label: "Tenant",
              value: input.workspace.tenantName,
            },
            {
              id: "window",
              label: "Operating window",
              value: input.workspace.operatingWindowLabel,
            },
            {
              id: "updated",
              label: "Updated",
              value: input.workspace.lastUpdatedAt
                ? `Updated ${formatDateTime(input.workspace.lastUpdatedAt)}`
                : "No activity yet",
            },
          ],
        }
      : undefined,
    content: {
      sections: [{ id: "metrics" }, { id: "primary-content" }],
    },
    stateSurface: {
      loading: {
        title: `Loading ${input.title.toLowerCase()}`,
        description:
          "Please wait while Afenda assembles the current operating surface.",
      },
      empty: {
        title: "No operating records yet",
        description:
          "This tenant has context, but no records have been created for this surface yet.",
      },
      failure: {
        title: `${input.title} unavailable`,
        description:
          "Afenda could not assemble this operating surface right now.",
      },
      forbidden: {
        title: "Surface unavailable",
        description:
          "This route is not available in the current tenant context.",
      },
    },
  }
}

function createTruthSurfaceContract(
  feed?: OpsAuditFeedResponse
): AppSurfaceContract {
  return {
    kind: "truth",
    header: {
      kicker: "Truth audit",
      title: "Audit trail",
      description:
        "Every truth record stays attached to the actor, doctrine, and affected record that changed operating state.",
    },
    metaRow: feed
      ? {
          items: [
            {
              id: "tenant",
              label: "Tenant",
              value: feed.audit.tenantName,
            },
            {
              id: "window",
              label: "Recorded window",
              value: feed.audit.recordedWindowLabel,
            },
            {
              id: "updated",
              label: "Latest truth",
              value: feed.audit.lastRecordedAt
                ? `Latest truth ${formatDateTime(feed.audit.lastRecordedAt)}`
                : "No truth records yet",
            },
          ],
        }
      : undefined,
    content: {
      sections: [{ id: "audit-feed" }, { id: "proof-chamber" }],
    },
    stateSurface: {
      loading: {
        title: "Loading audit trail",
        description: "Please wait while the persisted truth feed is assembled.",
      },
      empty: {
        title: "No truth records yet",
        description:
          "This tenant has no persisted truth rows for the audit surface yet.",
      },
      failure: {
        title: "Audit trail unavailable",
        description:
          "Afenda could not load the persisted truth feed right now.",
      },
      forbidden: {
        title: "Audit unavailable",
        description:
          "You do not have permission to inspect the tenant truth feed.",
      },
    },
  }
}

function toneClassName(tone: WorkspaceMetric["tone"]): string {
  switch (tone) {
    case "success":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "warning":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "danger":
      return "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
    default:
      return "border-border bg-muted/40 text-muted-foreground"
  }
}

function eventStatusClassName(status: WorkspaceEvent["status"]): string {
  switch (status) {
    case "closed":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "completed":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "assigned":
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
    case "draft":
      return "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
    case "in_progress":
      return "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300"
    default:
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
}

function counterpartyHealthClassName(
  health: WorkspaceCounterpartyHealth
): string {
  switch (health) {
    case "healthy":
      return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
    case "blocked":
      return "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300"
    default:
      return "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  }
}

function MetricStrip(props: { readonly metrics: readonly WorkspaceMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {props.metrics.map((metric) => (
        <Card key={metric.id} className="border-border/70 shadow-sm">
          <CardContent className="grid gap-2 px-5 py-5">
            <div
              className={cn(
                "inline-flex w-fit rounded-full border px-2.5 py-1 text-[11px] font-medium",
                toneClassName(metric.tone)
              )}
            >
              {metric.label}
            </div>
            <div className="text-3xl font-semibold tracking-tight">
              {metric.value}
            </div>
            <p className="text-sm text-muted-foreground">{metric.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ProgressTrack(props: { readonly event: WorkspaceEvent }) {
  const { t } = useTranslation("shell")
  const { progress } = props.event
  return (
    <ol
      className="grid gap-3 md:grid-cols-5"
      aria-label={t("events_workspace.progress_aria", {
        eventCode: props.event.code,
      })}
    >
      {progress.steps.map((step, index) => {
        const stepNumber = index + 1
        const isComplete = stepNumber <= progress.currentStep
        return (
          <li
            key={step}
            className={cn(
              "rounded-2xl border px-3 py-3 text-sm",
              isComplete
                ? "border-primary/25 bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            <div className="ui-mono-token text-[10px] uppercase">
              {String(stepNumber).padStart(2, "0")}
            </div>
            <div className="mt-2 font-medium">{step}</div>
          </li>
        )
      })}
    </ol>
  )
}

function EventQueue(props: {
  readonly events: readonly WorkspaceEvent[]
  readonly selectedEventId: string | null
  readonly onSelect: (eventId: string) => void
}) {
  const { t } = useTranslation("shell")

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {t("events_workspace.queue_title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {props.events.length > 0 ? (
          props.events.map((event) => (
            <button
              key={event.id}
              type="button"
              onClick={() => props.onSelect(event.id)}
              className={cn(
                "grid gap-3 rounded-2xl border px-4 py-4 text-left transition-colors hover:bg-accent/35 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                props.selectedEventId === event.id
                  ? "border-primary/30 bg-primary/8"
                  : "border-border/70 bg-background"
              )}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 ui-mono-token text-[11px] text-muted-foreground">
                  {event.code}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
                    eventStatusClassName(event.status)
                  )}
                >
                  {event.status.replace("_", " ")}
                </span>
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">
                  {event.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {event.summary}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" aria-hidden />
                  {event.slaLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-3.5" aria-hidden />
                  {event.ownerLabel ?? t("events_workspace.needs_owner")}
                </span>
              </div>
            </button>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm leading-6 text-muted-foreground">
            {t("events_workspace.queue_empty")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function EventDetailCard(props: {
  readonly event: WorkspaceEvent
  readonly counterparty: WorkspaceCounterparty | null
  readonly auditEntries: readonly WorkspaceAuditEntry[]
  readonly onClaim: () => Promise<unknown>
  readonly onAdvance: () => Promise<unknown>
  readonly isClaiming: boolean
  readonly isAdvancing: boolean
}) {
  const { t } = useTranslation("shell")
  const { event, counterparty, auditEntries } = props

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 ui-mono-token text-[11px] text-muted-foreground">
            {event.code}
          </span>
          <span
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
              eventStatusClassName(event.status)
            )}
          >
            {event.status.replace("_", " ")}
          </span>
        </div>
        <div>
          <CardTitle className="text-2xl tracking-tight">
            {event.title}
          </CardTitle>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            {event.summary}
          </p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6">
        <ProgressTrack event={event} />

        <div className="grid gap-4 md:grid-cols-3">
          <InfoTile
            label={t("events_workspace.stage_label")}
            value={event.stageLabel}
          />
          <InfoTile
            label={t("events_workspace.source_label")}
            value={event.sourceLabel}
          />
          <InfoTile
            label={t("events_workspace.owner_label")}
            value={event.ownerLabel ?? t("events_workspace.unassigned")}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={props.isClaiming}
            onClick={() => void props.onClaim()}
          >
            {props.isClaiming
              ? t("events_workspace.claiming")
              : event.ownerLabel
                ? t("events_workspace.reassign_to_me")
                : t("events_workspace.claim_event")}
          </Button>
          <Button
            type="button"
            disabled={props.isAdvancing || event.status === "closed"}
            onClick={() => void props.onAdvance()}
          >
            {props.isAdvancing
              ? t("events_workspace.advancing")
              : event.status === "closed"
                ? t("events_workspace.already_closed")
                : t("events_workspace.advance_stage")}
          </Button>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <Card className="border-border/70 bg-muted/20 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("events_workspace.recent_proof_trail")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {auditEntries.length > 0 ? (
                auditEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-border/70 bg-background px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                        {entry.actionLabel}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(entry.occurredAt)}
                      </span>
                    </div>
                    <h3 className="mt-3 font-semibold">{entry.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {entry.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("events_workspace.no_audit_evidence")}
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-muted/20 shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {t("events_workspace.counterparty_context")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              {counterparty ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 ui-mono-token text-[11px] text-muted-foreground">
                      {counterparty.code}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
                        counterpartyHealthClassName(counterparty.health)
                      )}
                    >
                      {counterparty.health}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{counterparty.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {counterparty.channelLabel}
                    </p>
                  </div>
                  <InfoTile
                    label={t("events_workspace.response_window_label")}
                    value={counterparty.responseLabel}
                  />
                  <InfoTile
                    label={t("events_workspace.owner_label")}
                    value={counterparty.ownerLabel}
                  />
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("events_workspace.no_counterparty_dependency")}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}

function InfoTile(props: { readonly label: string; readonly value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background px-4 py-4">
      <div className="ui-mono-token text-[10px] text-muted-foreground uppercase">
        {props.label}
      </div>
      <div className="mt-2 text-sm font-medium">{props.value}</div>
    </div>
  )
}

function AuditFeed(props: {
  readonly entries: readonly AuditRenderableEntry[]
  readonly emptyMessage?: string
}) {
  const { t } = useTranslation("shell")

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {t("events_workspace.audit_trail_title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {props.entries.length > 0 ? (
          props.entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-border/70 bg-background px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {entry.eventCode}
                </span>
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground">
                  {entry.actionLabel}
                </span>
              </div>
              <h3 className="mt-3 font-semibold">{entry.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {entry.description}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <UserRound className="size-3.5" aria-hidden />
                  {entry.actorLabel} / {entry.actorRole}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" aria-hidden />
                  {formatDateTime(entry.occurredAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm leading-6 text-muted-foreground">
            {props.emptyMessage ??
              t("events_workspace.no_truth_records_workspace")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function CounterpartyGrid(props: {
  readonly counterparties: readonly WorkspaceCounterparty[]
  readonly eventsById: ReadonlyMap<string, WorkspaceEvent>
}) {
  const { t } = useTranslation("shell")

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {t("events_workspace.counterparty_roster")}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-2">
        {props.counterparties.length > 0 ? (
          props.counterparties.map((counterparty) => (
            <div
              key={counterparty.id}
              className="rounded-2xl border border-border/70 bg-background px-4 py-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 ui-mono-token text-[11px] text-muted-foreground">
                  {counterparty.code}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
                    counterpartyHealthClassName(counterparty.health)
                  )}
                >
                  {counterparty.health}
                </span>
              </div>
              <h3 className="mt-3 font-semibold">{counterparty.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {counterparty.channelLabel}
              </p>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <div>{counterparty.regionLabel}</div>
                <div>{counterparty.responseLabel}</div>
                <div>
                  {t("events_workspace.owner_value", {
                    owner: counterparty.ownerLabel,
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {counterparty.activeEventIds.length > 0 ? (
                  counterparty.activeEventIds.map((eventId) => {
                    const event = props.eventsById.get(eventId)
                    return (
                      <span
                        key={eventId}
                        className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground"
                      >
                        <Link2 className="size-3" aria-hidden />
                        {event?.code ?? eventId}
                      </span>
                    )
                  })
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t("events_workspace.no_active_counterparty_escalations")}
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm leading-6 text-muted-foreground xl:col-span-2">
            {t("events_workspace.no_counterparties_linked")}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function useSelectedEvent(
  snapshot: OpsEventsWorkspaceFeedResponse | undefined
) {
  const [requestedEventId, setRequestedEventId] = useState<string | null>(null)

  const selectedEventId = useMemo(() => {
    if (!snapshot) {
      return null
    }

    if (
      requestedEventId &&
      snapshot.events.some((event) => event.id === requestedEventId)
    ) {
      return requestedEventId
    }

    return (
      snapshot.eventsWorkspace.highlightedEventId ??
      snapshot.events[0]?.id ??
      null
    )
  }, [requestedEventId, snapshot])

  const selectedEvent = useMemo(
    () =>
      snapshot?.events.find((event) => event.id === selectedEventId) ?? null,
    [selectedEventId, snapshot]
  )

  return {
    selectedEventId,
    selectedEvent,
    setSelectedEventId: setRequestedEventId,
  }
}

function isForbiddenError(error: unknown): boolean {
  return error instanceof ApiClientHttpError && error.status === 403
}

function SurfaceRetryActions(props: { readonly onRetry: () => void }) {
  const { t } = useTranslation("shell")

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" variant="outline" onClick={props.onRetry}>
        {t("events_workspace.retry_surface")}
      </Button>
    </div>
  )
}

function renderStateSurface(input: {
  readonly surfaceKind: AppSurfaceKind
  readonly contract: AppSurfaceContract
  readonly kind: "loading" | "empty" | "failure" | "forbidden"
  readonly actions?: ReactNode
}) {
  const state = input.contract.stateSurface[input.kind]

  return (
    <StateSurface
      surfaceKind={input.surfaceKind}
      kind={input.kind}
      title={state.title}
      description={state.description}
      actions={input.actions}
    />
  )
}

export function EventsOpsPage() {
  const { t } = useTranslation("shell")
  const workspace = useEventsWorkspace()
  const { data: snapshot } = workspace
  const { selectedEventId, selectedEvent, setSelectedEventId } =
    useSelectedEvent(snapshot)
  const surfaceContract = createWorkspaceSurfaceContract({
    title: t("events_workspace.surface_title"),
    description: t("events_workspace.surface_description"),
    kicker: t("events_workspace.surface_kicker"),
    workspace: snapshot?.eventsWorkspace,
  })

  if (workspace.isPending) {
    return renderStateSurface({
      surfaceKind: "workspace",
      contract: surfaceContract,
      kind: "loading",
    })
  }

  if (workspace.isError || !snapshot) {
    return renderStateSurface({
      surfaceKind: "workspace",
      contract: surfaceContract,
      kind: isForbiddenError(workspace.error) ? "forbidden" : "failure",
      actions: isForbiddenError(workspace.error) ? undefined : (
        <SurfaceRetryActions onRetry={() => void workspace.refetch()} />
      ),
    })
  }

  const counterparty = selectedEvent?.counterpartyId
    ? (snapshot.counterparties.find(
        (item) => item.id === selectedEvent.counterpartyId
      ) ?? null)
    : null
  const eventAudit = selectedEvent
    ? snapshot.recentAuditEntries.filter(
        (entry) => entry.eventId === selectedEvent.id
      )
    : []

  return (
    <AppSurface contract={surfaceContract}>
      <MetricStrip metrics={snapshot.eventsWorkspace.metrics} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <EventQueue
          events={snapshot.events}
          selectedEventId={selectedEventId}
          onSelect={setSelectedEventId}
        />
        {selectedEvent ? (
          <EventDetailCard
            event={selectedEvent}
            counterparty={counterparty}
            auditEntries={eventAudit}
            onClaim={() => workspace.claimEvent(selectedEvent.id)}
            onAdvance={() => workspace.advanceEvent(selectedEvent.id)}
            isClaiming={workspace.isClaimingEvent}
            isAdvancing={workspace.isAdvancingEvent}
          />
        ) : (
          renderStateSurface({
            surfaceKind: "workspace",
            contract: surfaceContract,
            kind: "empty",
          })
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <AuditFeed entries={snapshot.recentAuditEntries.slice(0, 4)} />
        <CounterpartyGrid
          counterparties={snapshot.counterparties}
          eventsById={
            new Map(snapshot.events.map((event) => [event.id, event]))
          }
        />
      </div>
    </AppSurface>
  )
}

export function AuditTrailPage() {
  const { t } = useTranslation("shell")
  const auditFeed = useOpsAuditFeed({ limit: 30 })
  const surfaceContract = createTruthSurfaceContract(auditFeed.data)

  if (auditFeed.isPending) {
    return renderStateSurface({
      surfaceKind: "truth",
      contract: surfaceContract,
      kind: "loading",
    })
  }

  if (auditFeed.isError || !auditFeed.data) {
    return renderStateSurface({
      surfaceKind: "truth",
      contract: surfaceContract,
      kind: isForbiddenError(auditFeed.error) ? "forbidden" : "failure",
      actions: isForbiddenError(auditFeed.error) ? undefined : (
        <SurfaceRetryActions onRetry={() => void auditFeed.refetch()} />
      ),
    })
  }

  return (
    <AppSurface contract={surfaceContract}>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        {auditFeed.data.entries.length > 0 ? (
          <AuditFeed
            entries={auditFeed.data.entries.map((entry: OpsAuditFeedItem) => ({
              id: entry.id,
              eventCode: entry.eventCode,
              title: entry.title,
              description: entry.summary,
              actorLabel: entry.actorLabel,
              actorRole: entry.actorRole,
              actionLabel: entry.actionLabel,
              occurredAt: entry.occurredAt,
            }))}
            emptyMessage={t("events_workspace.no_truth_records_tenant")}
          />
        ) : (
          renderStateSurface({
            surfaceKind: "truth",
            contract: surfaceContract,
            kind: "empty",
          })
        )}
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t("events_workspace.what_this_proves")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm leading-7 text-muted-foreground">
            <p>{t("events_workspace.truth_proof_1")}</p>
            <p>{t("events_workspace.truth_proof_2")}</p>
            <p className="inline-flex items-center gap-2 rounded-2xl border border-border/70 bg-muted/20 px-4 py-4 text-foreground">
              <ShieldCheck className="size-4 text-primary" aria-hidden />
              {t("events_workspace.truth_proof_3")}
            </p>
          </CardContent>
        </Card>
      </div>
    </AppSurface>
  )
}

export function CounterpartyRosterPage() {
  const { t } = useTranslation("shell")
  const counterpartyFeed = useOpsCounterpartyFeed()
  const surfaceContract = createWorkspaceSurfaceContract({
    title: t("events_workspace.counterparty_surface_title"),
    description: t("events_workspace.counterparty_surface_description"),
    kicker: t("events_workspace.counterparty_surface_kicker"),
    workspace: counterpartyFeed.data?.counterparties ?? null,
  })

  if (counterpartyFeed.isPending) {
    return renderStateSurface({
      surfaceKind: "workspace",
      contract: surfaceContract,
      kind: "loading",
    })
  }

  if (counterpartyFeed.isError || !counterpartyFeed.data) {
    return renderStateSurface({
      surfaceKind: "workspace",
      contract: surfaceContract,
      kind: isForbiddenError(counterpartyFeed.error) ? "forbidden" : "failure",
      actions: isForbiddenError(counterpartyFeed.error) ? undefined : (
        <SurfaceRetryActions onRetry={() => void counterpartyFeed.refetch()} />
      ),
    })
  }

  const eventsById = new Map(
    counterpartyFeed.data.events.map((event) => [event.id, event])
  )
  const impactedEvents = counterpartyFeed.data.events.filter(
    (event) => event.counterpartyId !== null
  )

  return (
    <AppSurface contract={surfaceContract}>
      <MetricStrip metrics={counterpartyFeed.data.counterparties.metrics} />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <CounterpartyGrid
          counterparties={counterpartyFeed.data.items}
          eventsById={eventsById}
        />
        <Card className="border-border/70 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {t("events_workspace.active_coordination_events")}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            {impactedEvents.length > 0
              ? impactedEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border border-border/70 bg-background px-4 py-4"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 ui-mono-token text-[11px] text-muted-foreground">
                        {event.code}
                      </span>
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize",
                          eventStatusClassName(event.status)
                        )}
                      >
                        {event.status.replace("_", " ")}
                      </span>
                    </div>
                    <h2 className="mt-3 font-semibold">{event.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {event.summary}
                    </p>
                  </div>
                ))
              : renderStateSurface({
                  surfaceKind: "workspace",
                  contract: surfaceContract,
                  kind: "empty",
                })}
          </CardContent>
        </Card>
      </div>
    </AppSurface>
  )
}
