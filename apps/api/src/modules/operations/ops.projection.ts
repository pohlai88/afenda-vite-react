import { randomUUID } from "node:crypto"

import type { DatabaseClient } from "@afenda/database"
import {
  opsEvents,
  opsPartners,
  tenants,
  truthRecords,
} from "@afenda/database/schema"
import { and, desc, eq, lt } from "drizzle-orm"

import { getBetterAuthRuntime } from "../../lib/better-auth-runtime.js"
import { hasBetterAuthRuntimeEnv } from "../../lib/env.js"
import { hashTruthRecordEnvelope } from "../../truth/truth-writer.js"
import type { TruthRecordEnvelope } from "../../truth/truth-record.model.js"
import {
  advanceOpsEventState,
  progressForOpsEventState,
  stageLabelForOpsEventState,
  type OpsEventPriority,
  type OpsEventState,
  type OpsPartnerHealth as OpsCounterpartyHealth,
} from "./ops.state-machine.js"

// Storage remains on legacy partner identifiers for migration stability.
// This module is the anti-corruption layer that exposes the domain outward as counterparties.

type OpsEventProjectionRecord = {
  readonly id: string
  readonly eventCode: string
  readonly title: string
  readonly summary: string
  readonly priority: OpsEventPriority
  readonly state: OpsEventState
  readonly ownerActorId: string | null
  readonly ownerLabel: string | null
  readonly counterpartyId: string | null
  readonly sourceLabel: string
  readonly slaLabel: string
  readonly updatedAt: string
}

type OpsCounterpartyProjectionRecord = {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly regionLabel: string
  readonly ownerLabel: string
  readonly channelLabel: string
  readonly responseLabel: string
  readonly health: OpsCounterpartyHealth
}

type OpsTruthRecord = {
  readonly id: string
  readonly tenantId: string
  readonly entityType: string
  readonly entityId: string
  readonly commandType: string
  readonly actorId: string
  readonly timestamp: string
  readonly beforeState: Record<string, unknown> | null
  readonly afterState: Record<string, unknown> | null
  readonly doctrineRef: string | null
  readonly invariantRefs: readonly string[]
  readonly hash: string
  readonly metadata: Record<string, unknown>
}

export interface WorkspaceMetric {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly helper: string
  readonly tone: "neutral" | "success" | "warning" | "danger"
}

export interface WorkspaceProgress {
  readonly currentStep: number
  readonly totalSteps: number
  readonly steps: readonly string[]
}

export interface WorkspaceEvent {
  readonly id: string
  readonly code: string
  readonly title: string
  readonly summary: string
  readonly priority: OpsEventPriority
  readonly status: OpsEventState
  readonly stageLabel: string
  readonly ownerLabel: string | null
  readonly counterpartyId: string | null
  readonly sourceLabel: string
  readonly slaLabel: string
  readonly updatedAt: string
  readonly progress: WorkspaceProgress
}

export interface WorkspaceAuditEntry {
  readonly id: string
  readonly eventId: string
  readonly eventCode: string
  readonly title: string
  readonly description: string
  readonly actorLabel: string
  readonly actorRole: string
  readonly actionLabel: string
  readonly occurredAt: string
}

export interface WorkspaceCounterparty {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly regionLabel: string
  readonly ownerLabel: string
  readonly channelLabel: string
  readonly responseLabel: string
  readonly health: OpsCounterpartyHealth
  readonly activeEventIds: readonly string[]
}

export interface WorkspaceSnapshot {
  readonly workspace: {
    readonly tenantId: string
    readonly tenantName: string
    readonly summaryLine: string
    readonly operatingWindowLabel: string
    readonly highlightedEventId: string
    readonly lastUpdatedAt: string
    readonly metrics: readonly WorkspaceMetric[]
  }
  readonly events: readonly WorkspaceEvent[]
  readonly auditEntries: readonly WorkspaceAuditEntry[]
  readonly counterparties: readonly WorkspaceCounterparty[]
}

export interface ReadWorkspaceSnapshotOptions {
  readonly includeAudit?: boolean
}

export interface ReadOpsAuditFeedOptions {
  readonly before?: string
  readonly limit?: number
}

export interface OpsAuditFeedItem {
  readonly id: string
  readonly tenantId: string
  readonly occurredAt: string
  readonly commandType: string
  readonly actionLabel: string
  readonly entityType: string
  readonly entityId: string
  readonly eventCode: string
  readonly title: string
  readonly summary: string
  readonly doctrineRef: string | null
  readonly invariantRefs: readonly string[]
  readonly actorLabel: string
  readonly actorRole: string
  readonly metadata: Record<string, unknown>
}

export interface OpsAuditFeedResponse {
  readonly audit: {
    readonly tenantId: string
    readonly tenantName: string
    readonly summaryLine: string
    readonly recordedWindowLabel: string
    readonly lastRecordedAt: string | null
  }
  readonly entries: readonly OpsAuditFeedItem[]
  readonly page: {
    readonly limit: number
    readonly nextBefore: string | null
  }
}

export interface OpsCounterpartyFeedResponse {
  readonly counterparties: {
    readonly tenantId: string
    readonly tenantName: string
    readonly summaryLine: string
    readonly operatingWindowLabel: string
    readonly lastUpdatedAt: string | null
    readonly metrics: readonly WorkspaceMetric[]
  }
  readonly items: readonly WorkspaceCounterparty[]
  readonly events: readonly WorkspaceEvent[]
}

export interface OpsEventsWorkspaceFeedResponse {
  readonly eventsWorkspace: {
    readonly tenantId: string
    readonly tenantName: string
    readonly summaryLine: string
    readonly operatingWindowLabel: string
    readonly highlightedEventId: string
    readonly lastUpdatedAt: string
    readonly metrics: readonly WorkspaceMetric[]
  }
  readonly events: readonly WorkspaceEvent[]
  readonly recentAuditEntries: readonly WorkspaceAuditEntry[]
  readonly counterparties: readonly WorkspaceCounterparty[]
}

export function filterWorkspaceSnapshotForPermissions(input: {
  readonly snapshot: WorkspaceSnapshot
  readonly permissions: readonly string[]
}): WorkspaceSnapshot {
  const granted = new Set(input.permissions)

  return {
    ...input.snapshot,
    auditEntries: granted.has("ops:audit:view")
      ? input.snapshot.auditEntries
      : [],
  }
}

export type PersistedOpsMutationInput = {
  readonly tenantId: string
  readonly expectedEvent: Pick<
    OpsEventProjectionRecord,
    "id" | "state" | "updatedAt" | "ownerActorId" | "ownerLabel"
  >
  readonly nextEvent: OpsEventProjectionRecord
  readonly truthRecord: TruthRecordEnvelope
}

type OpsProjectionStore = {
  readEvent: (
    tenantId: string,
    eventId: string
  ) => Promise<OpsEventProjectionRecord | null>
  readWorkspaceSnapshot: (tenantId: string) => Promise<WorkspaceSnapshot>
  readWorkspaceSnapshotWithOptions: (
    tenantId: string,
    options: ReadWorkspaceSnapshotOptions
  ) => Promise<WorkspaceSnapshot>
  readOpsAuditFeed: (
    tenantId: string,
    options: ReadOpsAuditFeedOptions
  ) => Promise<OpsAuditFeedResponse>
  readOpsCounterpartyFeed: (
    tenantId: string
  ) => Promise<OpsCounterpartyFeedResponse>
  readOpsEventsWorkspaceFeed: (
    tenantId: string,
    options: ReadWorkspaceSnapshotOptions
  ) => Promise<OpsEventsWorkspaceFeedResponse>
  persistMutation: (input: PersistedOpsMutationInput) => Promise<string>
  resetForTests: () => void
}

const defaultWorkspaceSummary =
  "Events operations keeps queue ownership, counterparty dependency, and truth evidence in one accountable operating surface."

const defaultOperatingWindowLabel = "Operating window: 07:00 to 19:00 ICT"
const defaultAuditSummary =
  "Truth records preserve who acted, what changed, and which operating doctrine governed the decision."
const defaultAuditRecordedWindowLabel =
  "Truth feed ordered by occurredAt descending"
const defaultAuditFeedLimit = 20
const maxAuditFeedLimit = 100

const seededCounterparties: readonly OpsCounterpartyProjectionRecord[] = [
  {
    id: "counterparty-northstar",
    code: "NSL",
    name: "Northstar Logistics",
    regionLabel: "APAC",
    ownerLabel: "Counterparty desk",
    channelLabel: "Carrier proof API",
    responseLabel: "Responds within 20m",
    health: "attention",
  },
  {
    id: "counterparty-atlas",
    code: "ATL",
    name: "Atlas Commerce",
    regionLabel: "Global",
    ownerLabel: "Revenue operations",
    channelLabel: "Order status webhook",
    responseLabel: "Stable same-day SLA",
    health: "healthy",
  },
  {
    id: "counterparty-civic",
    code: "CVC",
    name: "Civic Tax Gateway",
    regionLabel: "Thailand",
    ownerLabel: "Integrations squad",
    channelLabel: "Government filing bridge",
    responseLabel: "Pending signature remediation",
    health: "blocked",
  },
  {
    id: "counterparty-meridian",
    code: "MRD",
    name: "Meridian Bank",
    regionLabel: "Singapore",
    ownerLabel: "Treasury desk",
    channelLabel: "Settlement webhook",
    responseLabel: "No active issues",
    health: "healthy",
  },
] as const

const seededEvents: readonly OpsEventProjectionRecord[] = [
  {
    id: "evt-4301",
    eventCode: "EVT-4301",
    title: "Revenue recognition pack is waiting on counterparty evidence",
    summary:
      "A completed delivery batch is ready for posting, but the carrier proof packet is still incomplete.",
    priority: "critical",
    state: "draft",
    ownerActorId: null,
    ownerLabel: null,
    counterpartyId: "counterparty-northstar",
    sourceLabel: "OMS / Delivery completion",
    slaLabel: "15m to breach",
    updatedAt: "2026-04-22T09:20:00.000Z",
  },
  {
    id: "evt-4298",
    eventCode: "EVT-4298",
    title: "Commercial refund needs finance approval",
    summary:
      "Customer success approved the refund narrative; finance still needs to confirm the posting impact.",
    priority: "high",
    state: "in_progress",
    ownerActorId: "user-2",
    ownerLabel: "Mina Santos",
    counterpartyId: "counterparty-atlas",
    sourceLabel: "CRM / Refund workflow",
    slaLabel: "Review today",
    updatedAt: "2026-04-22T08:45:00.000Z",
  },
  {
    id: "evt-4289",
    eventCode: "EVT-4289",
    title: "Tax jurisdiction sync requires connector follow-up",
    summary:
      "A government filing acknowledgement needs signature remediation before downstream confirmation can continue.",
    priority: "high",
    state: "assigned",
    ownerActorId: "user-3",
    ownerLabel: "Nate Chua",
    counterpartyId: "counterparty-civic",
    sourceLabel: "Tax connector",
    slaLabel: "Awaiting counterparty remediation",
    updatedAt: "2026-04-22T08:02:00.000Z",
  },
  {
    id: "evt-4266",
    eventCode: "EVT-4266",
    title: "Settlement exception fully resolved",
    summary:
      "The bank statement mismatch was reconciled and the close packet is now audit-ready.",
    priority: "medium",
    state: "closed",
    ownerActorId: "user-4",
    ownerLabel: "Ari Tan",
    counterpartyId: "counterparty-meridian",
    sourceLabel: "Treasury close",
    slaLabel: "Closed",
    updatedAt: "2026-04-22T07:26:00.000Z",
  },
] as const

function createBootstrapTruthRecords(
  tenantId: string,
  events: readonly OpsEventProjectionRecord[]
): OpsTruthRecord[] {
  return events.map((event) =>
    buildTruthRecord({
      tenantId,
      entityType: "ops_event",
      entityId: event.id,
      commandType: "ops.event.bootstrap",
      actorId: "system.seed",
      timestamp: new Date(event.updatedAt),
      beforeState: null,
      afterState: {
        eventCode: event.eventCode,
        state: event.state,
        ownerLabel: event.ownerLabel,
      },
      doctrineRef: "ops.bootstrap",
      metadata: {
        eventCode: event.eventCode,
        title: `${event.eventCode} loaded into the ops projection`,
        description:
          "Baseline operational truth was established for this event during projection initialization.",
        actionLabel: "Bootstrapped",
        actorLabel: "Afenda system",
        actorRole: "Projection bootstrap",
      },
    })
  )
}

function tenantLabelFromId(tenantId: string): string {
  if (tenantId === "tenant-1") return "Acme Operations"
  if (tenantId === "tenant-2") return "Acme Supply"
  return tenantId
    .split(/[-_]/g)
    .filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function sortEvents(
  left: OpsEventProjectionRecord,
  right: OpsEventProjectionRecord
) {
  const priorityOrder: Readonly<Record<OpsEventPriority, number>> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return (
    priorityOrder[left.priority] - priorityOrder[right.priority] ||
    right.updatedAt.localeCompare(left.updatedAt)
  )
}

function buildTruthRecord(input: TruthRecordEnvelope): OpsTruthRecord {
  const metadata = {
    ...(input.metadata ?? {}),
    ...(input.linkage
      ? {
          executionLinkage: input.linkage,
        }
      : {}),
  }

  return {
    id: randomUUID(),
    tenantId: input.tenantId,
    entityType: input.entityType,
    entityId: input.entityId,
    commandType: input.commandType,
    actorId: input.actorId,
    timestamp: input.timestamp.toISOString(),
    beforeState: input.beforeState,
    afterState: input.afterState,
    doctrineRef: input.doctrineRef ?? null,
    invariantRefs: [...(input.invariantRefs ?? [])],
    hash: hashTruthRecordEnvelope(input),
    metadata,
  }
}

function metricsFromEvents(
  events: readonly OpsEventProjectionRecord[],
  counterparties: readonly OpsCounterpartyProjectionRecord[]
): readonly WorkspaceMetric[] {
  const openEvents = events.filter((event) => event.state !== "closed").length
  const claimedEvents = events.filter(
    (event) => event.ownerLabel !== null
  ).length
  const completedEvents = events.filter(
    (event) => event.state === "completed" || event.state === "closed"
  ).length
  const counterpartyWatch = counterparties.filter(
    (counterparty) => counterparty.health !== "healthy"
  ).length

  return [
    {
      id: "events-open",
      label: "Open events",
      value: String(openEvents),
      helper: "Events still moving through the operating queue",
      tone: openEvents > 0 ? "warning" : "success",
    },
    {
      id: "events-claimed",
      label: "Owned now",
      value: String(claimedEvents),
      helper: "Named operators currently holding workflow responsibility",
      tone: "neutral",
    },
    {
      id: "events-completed",
      label: "Completed",
      value: String(completedEvents),
      helper: "Events with continuity validated through outcome",
      tone: completedEvents > 0 ? "success" : "neutral",
    },
    {
      id: "counterparties-watch",
      label: "Counterparty watchlist",
      value: String(counterpartyWatch),
      helper: "Outside parties affecting active operational flow",
      tone: counterpartyWatch > 0 ? "warning" : "success",
    },
  ]
}

function workspaceEventFromProjection(
  event: OpsEventProjectionRecord
): WorkspaceEvent {
  return {
    id: event.id,
    code: event.eventCode,
    title: event.title,
    summary: event.summary,
    priority: event.priority,
    status: event.state,
    stageLabel: stageLabelForOpsEventState(event.state),
    ownerLabel: event.ownerLabel,
    counterpartyId: event.counterpartyId,
    sourceLabel: event.sourceLabel,
    slaLabel: event.slaLabel,
    updatedAt: event.updatedAt,
    progress: progressForOpsEventState(event.state),
  }
}

function workspaceAuditFromTruthRecord(
  record: OpsTruthRecord
): WorkspaceAuditEntry {
  const afterState = record.afterState ?? {}
  const beforeState = record.beforeState ?? {}

  return {
    id: record.id,
    eventId: record.entityId,
    eventCode: String(
      afterState.eventCode ??
        beforeState.eventCode ??
        record.metadata.eventCode ??
        record.entityId
    ),
    title: String(record.metadata.title ?? record.commandType),
    description: String(
      record.metadata.description ??
        "A truth record was appended for this business action."
    ),
    actorLabel: String(record.metadata.actorLabel ?? record.actorId),
    actorRole: String(record.metadata.actorRole ?? "Afenda operator"),
    actionLabel: String(record.metadata.actionLabel ?? record.commandType),
    occurredAt: record.timestamp,
  }
}

function opsAuditFeedItemFromTruthRecord(
  record: OpsTruthRecord
): OpsAuditFeedItem {
  const afterState = record.afterState ?? {}
  const beforeState = record.beforeState ?? {}

  return {
    id: record.id,
    tenantId: record.tenantId,
    occurredAt: record.timestamp,
    commandType: record.commandType,
    actionLabel: String(record.metadata.actionLabel ?? record.commandType),
    entityType: record.entityType,
    entityId: record.entityId,
    eventCode: String(
      afterState.eventCode ??
        beforeState.eventCode ??
        record.metadata.eventCode ??
        record.entityId
    ),
    title: String(record.metadata.title ?? record.commandType),
    summary: String(
      record.metadata.description ??
        "A truth record was appended for this business action."
    ),
    doctrineRef: record.doctrineRef,
    invariantRefs: record.invariantRefs,
    actorLabel: String(record.metadata.actorLabel ?? record.actorId),
    actorRole: String(record.metadata.actorRole ?? "Afenda operator"),
    metadata: record.metadata,
  }
}

function normalizeAuditFeedLimit(limit: number | undefined): number {
  if (limit === undefined) {
    return defaultAuditFeedLimit
  }

  return Math.max(1, Math.min(maxAuditFeedLimit, Math.trunc(limit)))
}

function buildOpsAuditFeed(input: {
  readonly tenantId: string
  readonly tenantName: string
  readonly truth: readonly OpsTruthRecord[]
  readonly limit: number
}): OpsAuditFeedResponse {
  const eligible = input.truth.filter(
    (record) => record.entityType === "ops_event"
  )
  const pageSlice = eligible.slice(0, input.limit + 1)
  const visibleEntries = pageSlice
    .slice(0, input.limit)
    .map(opsAuditFeedItemFromTruthRecord)
  const nextBefore =
    pageSlice.length > input.limit
      ? (pageSlice[input.limit - 1]?.timestamp ?? null)
      : null

  return {
    audit: {
      tenantId: input.tenantId,
      tenantName: input.tenantName,
      summaryLine: defaultAuditSummary,
      recordedWindowLabel: defaultAuditRecordedWindowLabel,
      lastRecordedAt: eligible[0]?.timestamp ?? null,
    },
    entries: visibleEntries,
    page: {
      limit: input.limit,
      nextBefore,
    },
  }
}

function buildOpsCounterpartyFeed(input: {
  readonly tenantId: string
  readonly tenantName: string
  readonly events: readonly OpsEventProjectionRecord[]
  readonly counterparties: readonly OpsCounterpartyProjectionRecord[]
}): OpsCounterpartyFeedResponse {
  const sortedEvents = [...input.events].sort(sortEvents)
  const activeEventIdsByCounterparty = new Map<string, string[]>()

  for (const event of sortedEvents) {
    if (!event.counterpartyId) {
      continue
    }

    const activeEventIds =
      activeEventIdsByCounterparty.get(event.counterpartyId) ?? []

    activeEventIdsByCounterparty.set(event.counterpartyId, [
      ...activeEventIds,
      event.id,
    ])
  }

  return {
    counterparties: {
      tenantId: input.tenantId,
      tenantName: input.tenantName,
      summaryLine:
        "Outside counterparties stay visible as live operational dependencies, not detached relationship records.",
      operatingWindowLabel: defaultOperatingWindowLabel,
      lastUpdatedAt: sortedEvents[0]?.updatedAt ?? null,
      metrics: metricsFromEvents(sortedEvents, input.counterparties),
    },
    items: [...input.counterparties]
      .sort((left, right) => left.name.localeCompare(right.name))
      .map((counterparty) => ({
        ...counterparty,
        activeEventIds: activeEventIdsByCounterparty.get(counterparty.id) ?? [],
      })),
    events: sortedEvents.map(workspaceEventFromProjection),
  }
}

function buildOpsEventsWorkspaceFeed(input: {
  readonly tenantId: string
  readonly tenantName: string
  readonly events: readonly OpsEventProjectionRecord[]
  readonly counterparties: readonly OpsCounterpartyProjectionRecord[]
  readonly truth: readonly OpsTruthRecord[]
}): OpsEventsWorkspaceFeedResponse {
  const snapshot = workspaceSnapshotFromRecords(input)

  return {
    eventsWorkspace: snapshot.workspace,
    events: snapshot.events,
    recentAuditEntries: snapshot.auditEntries,
    counterparties: snapshot.counterparties,
  }
}

function resolveWorkspaceLastUpdatedAt(input: {
  readonly events: readonly OpsEventProjectionRecord[]
  readonly truth: readonly OpsTruthRecord[]
}): string {
  return (
    input.truth[0]?.timestamp ??
    [...input.events].sort((left, right) =>
      right.updatedAt.localeCompare(left.updatedAt)
    )[0]?.updatedAt ??
    new Date().toISOString()
  )
}

function workspaceSnapshotFromRecords(input: {
  tenantId: string
  tenantName: string
  events: readonly OpsEventProjectionRecord[]
  counterparties: readonly OpsCounterpartyProjectionRecord[]
  truth: readonly OpsTruthRecord[]
}): WorkspaceSnapshot {
  const events = [...input.events].sort(sortEvents)
  const truth = [...input.truth].sort((left, right) =>
    right.timestamp.localeCompare(left.timestamp)
  )
  const activeEventIdsByCounterparty = new Map<string, string[]>()

  for (const event of events) {
    if (!event.counterpartyId || event.state === "closed") {
      continue
    }

    const current = activeEventIdsByCounterparty.get(event.counterpartyId)
    if (current) {
      current.push(event.id)
    } else {
      activeEventIdsByCounterparty.set(event.counterpartyId, [event.id])
    }
  }

  const highlightedEventId =
    events.find((event) => event.state !== "closed")?.id ?? events[0]?.id ?? ""

  return {
    workspace: {
      tenantId: input.tenantId,
      tenantName: input.tenantName,
      summaryLine: defaultWorkspaceSummary,
      operatingWindowLabel: defaultOperatingWindowLabel,
      highlightedEventId,
      lastUpdatedAt: resolveWorkspaceLastUpdatedAt({
        events,
        truth,
      }),
      metrics: metricsFromEvents(events, input.counterparties),
    },
    events: events.map(workspaceEventFromProjection),
    auditEntries: truth
      .filter((record) => record.entityType === "ops_event")
      .slice(0, 20)
      .map(workspaceAuditFromTruthRecord),
    counterparties: input.counterparties.map((counterparty) => ({
      id: counterparty.id,
      code: counterparty.code,
      name: counterparty.name,
      regionLabel: counterparty.regionLabel,
      ownerLabel: counterparty.ownerLabel,
      channelLabel: counterparty.channelLabel,
      responseLabel: counterparty.responseLabel,
      health: counterparty.health,
      activeEventIds: activeEventIdsByCounterparty.get(counterparty.id) ?? [],
    })),
  }
}

type InMemoryTenantStore = {
  tenantName: string
  events: OpsEventProjectionRecord[]
  counterparties: OpsCounterpartyProjectionRecord[]
  truth: OpsTruthRecord[]
}

class InMemoryOpsProjectionStore implements OpsProjectionStore {
  private readonly tenants = new Map<string, InMemoryTenantStore>()

  seedTenant(tenantId: string): void {
    if (this.tenants.has(tenantId)) {
      return
    }

    const events = seededEvents.map((event) => ({ ...event }))
    const initialTruth = createBootstrapTruthRecords(tenantId, events)

    this.tenants.set(tenantId, {
      tenantName: tenantLabelFromId(tenantId),
      events,
      counterparties: seededCounterparties.map((counterparty) => ({
        ...counterparty,
      })),
      truth: initialTruth,
    })
  }

  async readEvent(
    tenantId: string,
    eventId: string
  ): Promise<OpsEventProjectionRecord | null> {
    return (
      this.tenants
        .get(tenantId)
        ?.events.find((event) => event.id === eventId) ?? null
    )
  }

  async readWorkspaceSnapshot(tenantId: string): Promise<WorkspaceSnapshot> {
    return this.readWorkspaceSnapshotWithOptions(tenantId, {})
  }

  async readWorkspaceSnapshotWithOptions(
    tenantId: string,
    options: ReadWorkspaceSnapshotOptions
  ): Promise<WorkspaceSnapshot> {
    const store = this.tenants.get(tenantId)
    if (!store) {
      return workspaceSnapshotFromRecords({
        tenantId,
        tenantName: tenantLabelFromId(tenantId),
        events: [],
        counterparties: [],
        truth: [],
      })
    }

    return workspaceSnapshotFromRecords({
      tenantId,
      tenantName: store.tenantName,
      events: store.events,
      counterparties: store.counterparties,
      truth: options.includeAudit ? store.truth : [],
    })
  }

  async readOpsEventsWorkspaceFeed(
    tenantId: string,
    options: ReadWorkspaceSnapshotOptions
  ): Promise<OpsEventsWorkspaceFeedResponse> {
    const store = this.tenants.get(tenantId)
    if (!store) {
      return buildOpsEventsWorkspaceFeed({
        tenantId,
        tenantName: tenantLabelFromId(tenantId),
        events: [],
        counterparties: [],
        truth: [],
      })
    }

    return buildOpsEventsWorkspaceFeed({
      tenantId,
      tenantName: store.tenantName,
      events: store.events,
      counterparties: store.counterparties,
      truth: options.includeAudit ? store.truth : [],
    })
  }

  async readOpsAuditFeed(
    tenantId: string,
    options: ReadOpsAuditFeedOptions
  ): Promise<OpsAuditFeedResponse> {
    const store = this.tenants.get(tenantId)
    const limit = normalizeAuditFeedLimit(options.limit)
    const truth = [...(store?.truth ?? [])]
      .filter((record) =>
        options.before ? record.timestamp < options.before : true
      )
      .sort((left, right) => right.timestamp.localeCompare(left.timestamp))

    return buildOpsAuditFeed({
      tenantId,
      tenantName: store?.tenantName ?? tenantLabelFromId(tenantId),
      truth,
      limit,
    })
  }

  async readOpsCounterpartyFeed(
    tenantId: string
  ): Promise<OpsCounterpartyFeedResponse> {
    const store = this.tenants.get(tenantId)

    if (!store) {
      return buildOpsCounterpartyFeed({
        tenantId,
        tenantName: tenantLabelFromId(tenantId),
        events: [],
        counterparties: [],
      })
    }

    return buildOpsCounterpartyFeed({
      tenantId,
      tenantName: store.tenantName,
      events: store.events,
      counterparties: store.counterparties,
    })
  }

  async persistMutation(input: PersistedOpsMutationInput): Promise<string> {
    const store = this.tenants.get(input.tenantId)
    if (!store) {
      throw new Error(`ops_store_missing:${input.tenantId}`)
    }

    const eventIndex = store.events.findIndex(
      (event) => event.id === input.nextEvent.id
    )
    if (eventIndex < 0) {
      throw new Error(`event_not_found:${input.nextEvent.id}`)
    }

    const currentEvent = store.events[eventIndex]
    if (
      currentEvent.updatedAt !== input.expectedEvent.updatedAt ||
      currentEvent.state !== input.expectedEvent.state ||
      currentEvent.ownerActorId !== input.expectedEvent.ownerActorId ||
      currentEvent.ownerLabel !== input.expectedEvent.ownerLabel
    ) {
      throw new Error(`ops_event_concurrency_conflict:${input.nextEvent.id}`)
    }

    const truthRecord = buildTruthRecord(input.truthRecord)
    store.events[eventIndex] = { ...input.nextEvent }
    store.truth.unshift(truthRecord)

    return truthRecord.id
  }

  resetForTests(): void {
    this.tenants.clear()
  }
}

class DbOpsProjectionStore implements OpsProjectionStore {
  constructor(private readonly db: DatabaseClient) {}

  async readEvent(
    tenantId: string,
    eventId: string
  ): Promise<OpsEventProjectionRecord | null> {
    const rows = await this.db
      .select({
        id: opsEvents.id,
        eventCode: opsEvents.eventCode,
        title: opsEvents.title,
        summary: opsEvents.summary,
        priority: opsEvents.priority,
        state: opsEvents.state,
        ownerActorId: opsEvents.ownerActorId,
        ownerLabel: opsEvents.ownerLabel,
        counterpartyId: opsEvents.partnerId,
        sourceLabel: opsEvents.sourceLabel,
        slaLabel: opsEvents.slaLabel,
        updatedAt: opsEvents.updatedAt,
      })
      .from(opsEvents)
      .where(and(eq(opsEvents.tenantId, tenantId), eq(opsEvents.id, eventId)))
      .limit(1)

    const row = rows[0]
    if (!row) {
      return null
    }

    return {
      ...row,
      priority: row.priority as OpsEventPriority,
      state: row.state as OpsEventState,
      ownerActorId: row.ownerActorId,
      ownerLabel: row.ownerLabel,
      counterpartyId: row.counterpartyId,
      updatedAt: row.updatedAt.toISOString(),
    }
  }

  async readWorkspaceSnapshot(tenantId: string): Promise<WorkspaceSnapshot> {
    return this.readWorkspaceSnapshotWithOptions(tenantId, {})
  }

  async readWorkspaceSnapshotWithOptions(
    tenantId: string,
    options: ReadWorkspaceSnapshotOptions
  ): Promise<WorkspaceSnapshot> {
    const [tenantRow] = await this.db
      .select({
        tenantName: tenants.tenantName,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1)

    const eventRows = await this.db
      .select({
        id: opsEvents.id,
        eventCode: opsEvents.eventCode,
        title: opsEvents.title,
        summary: opsEvents.summary,
        priority: opsEvents.priority,
        state: opsEvents.state,
        ownerActorId: opsEvents.ownerActorId,
        ownerLabel: opsEvents.ownerLabel,
        counterpartyId: opsEvents.partnerId,
        sourceLabel: opsEvents.sourceLabel,
        slaLabel: opsEvents.slaLabel,
        updatedAt: opsEvents.updatedAt,
      })
      .from(opsEvents)
      .where(eq(opsEvents.tenantId, tenantId))

    const counterpartyRows = await this.db
      .select({
        id: opsPartners.id,
        code: opsPartners.partnerCode,
        name: opsPartners.partnerName,
        regionLabel: opsPartners.regionLabel,
        ownerLabel: opsPartners.ownerLabel,
        channelLabel: opsPartners.channelLabel,
        responseLabel: opsPartners.responseLabel,
        health: opsPartners.health,
      })
      .from(opsPartners)
      .where(eq(opsPartners.tenantId, tenantId))

    const truthRows = options.includeAudit
      ? await this.db
          .select({
            id: truthRecords.id,
            tenantId: truthRecords.tenantId,
            entityType: truthRecords.entityType,
            entityId: truthRecords.entityId,
            commandType: truthRecords.commandType,
            actorId: truthRecords.actorId,
            timestamp: truthRecords.timestamp,
            beforeState: truthRecords.beforeState,
            afterState: truthRecords.afterState,
            doctrineRef: truthRecords.doctrineRef,
            invariantRefs: truthRecords.invariantRefs,
            hash: truthRecords.hash,
            metadata: truthRecords.metadata,
          })
          .from(truthRecords)
          .where(eq(truthRecords.tenantId, tenantId))
          .orderBy(desc(truthRecords.timestamp))
      : []

    return workspaceSnapshotFromRecords({
      tenantId,
      tenantName: tenantRow?.tenantName ?? tenantLabelFromId(tenantId),
      events: eventRows.map((row) => ({
        ...row,
        priority: row.priority as OpsEventPriority,
        state: row.state as OpsEventState,
        ownerActorId: row.ownerActorId,
        ownerLabel: row.ownerLabel,
        counterpartyId: row.counterpartyId,
        updatedAt: row.updatedAt.toISOString(),
      })),
      counterparties: counterpartyRows.map((row) => ({
        ...row,
        health: row.health as OpsCounterpartyHealth,
      })),
      truth: truthRows.map((row) => ({
        ...row,
        tenantId: row.tenantId,
        timestamp: row.timestamp.toISOString(),
        doctrineRef: row.doctrineRef,
        invariantRefs: row.invariantRefs,
        beforeState:
          (row.beforeState as Record<string, unknown> | null) ?? null,
        afterState: (row.afterState as Record<string, unknown> | null) ?? null,
        metadata: (row.metadata as Record<string, unknown>) ?? {},
      })),
    })
  }

  async readOpsEventsWorkspaceFeed(
    tenantId: string,
    options: ReadWorkspaceSnapshotOptions
  ): Promise<OpsEventsWorkspaceFeedResponse> {
    const [tenantRow] = await this.db
      .select({
        tenantName: tenants.tenantName,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1)

    const eventRows = await this.db
      .select({
        id: opsEvents.id,
        eventCode: opsEvents.eventCode,
        title: opsEvents.title,
        summary: opsEvents.summary,
        priority: opsEvents.priority,
        state: opsEvents.state,
        ownerActorId: opsEvents.ownerActorId,
        ownerLabel: opsEvents.ownerLabel,
        counterpartyId: opsEvents.partnerId,
        sourceLabel: opsEvents.sourceLabel,
        slaLabel: opsEvents.slaLabel,
        updatedAt: opsEvents.updatedAt,
      })
      .from(opsEvents)
      .where(eq(opsEvents.tenantId, tenantId))

    const counterpartyRows = await this.db
      .select({
        id: opsPartners.id,
        code: opsPartners.partnerCode,
        name: opsPartners.partnerName,
        regionLabel: opsPartners.regionLabel,
        ownerLabel: opsPartners.ownerLabel,
        channelLabel: opsPartners.channelLabel,
        responseLabel: opsPartners.responseLabel,
        health: opsPartners.health,
      })
      .from(opsPartners)
      .where(eq(opsPartners.tenantId, tenantId))

    const truthRows = options.includeAudit
      ? await this.db
          .select({
            id: truthRecords.id,
            tenantId: truthRecords.tenantId,
            entityType: truthRecords.entityType,
            entityId: truthRecords.entityId,
            commandType: truthRecords.commandType,
            actorId: truthRecords.actorId,
            timestamp: truthRecords.timestamp,
            beforeState: truthRecords.beforeState,
            afterState: truthRecords.afterState,
            doctrineRef: truthRecords.doctrineRef,
            invariantRefs: truthRecords.invariantRefs,
            hash: truthRecords.hash,
            metadata: truthRecords.metadata,
          })
          .from(truthRecords)
          .where(eq(truthRecords.tenantId, tenantId))
          .orderBy(desc(truthRecords.timestamp))
      : []

    return buildOpsEventsWorkspaceFeed({
      tenantId,
      tenantName: tenantRow?.tenantName ?? tenantLabelFromId(tenantId),
      events: eventRows.map((row) => ({
        ...row,
        priority: row.priority as OpsEventPriority,
        state: row.state as OpsEventState,
        updatedAt: row.updatedAt.toISOString(),
      })),
      counterparties: counterpartyRows.map((row) => ({
        ...row,
        health: row.health as OpsCounterpartyHealth,
      })),
      truth: truthRows.map((row) => ({
        ...row,
        tenantId: row.tenantId,
        timestamp: row.timestamp.toISOString(),
        doctrineRef: row.doctrineRef,
        invariantRefs: row.invariantRefs,
        beforeState:
          (row.beforeState as Record<string, unknown> | null) ?? null,
        afterState: (row.afterState as Record<string, unknown> | null) ?? null,
        metadata: (row.metadata as Record<string, unknown>) ?? {},
      })),
    })
  }

  async readOpsAuditFeed(
    tenantId: string,
    options: ReadOpsAuditFeedOptions
  ): Promise<OpsAuditFeedResponse> {
    const [tenantRow] = await this.db
      .select({
        tenantName: tenants.tenantName,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1)

    const limit = normalizeAuditFeedLimit(options.limit)
    const conditions = [
      eq(truthRecords.tenantId, tenantId),
      eq(truthRecords.entityType, "ops_event"),
    ]

    if (options.before) {
      conditions.push(lt(truthRecords.timestamp, new Date(options.before)))
    }

    const truthRows = await this.db
      .select({
        id: truthRecords.id,
        tenantId: truthRecords.tenantId,
        entityType: truthRecords.entityType,
        entityId: truthRecords.entityId,
        commandType: truthRecords.commandType,
        actorId: truthRecords.actorId,
        timestamp: truthRecords.timestamp,
        beforeState: truthRecords.beforeState,
        afterState: truthRecords.afterState,
        doctrineRef: truthRecords.doctrineRef,
        invariantRefs: truthRecords.invariantRefs,
        hash: truthRecords.hash,
        metadata: truthRecords.metadata,
      })
      .from(truthRecords)
      .where(and(...conditions))
      .orderBy(desc(truthRecords.timestamp))
      .limit(limit + 1)

    return buildOpsAuditFeed({
      tenantId,
      tenantName: tenantRow?.tenantName ?? tenantLabelFromId(tenantId),
      truth: truthRows.map((row) => ({
        ...row,
        timestamp: row.timestamp.toISOString(),
        doctrineRef: row.doctrineRef,
        invariantRefs: row.invariantRefs,
        beforeState:
          (row.beforeState as Record<string, unknown> | null) ?? null,
        afterState: (row.afterState as Record<string, unknown> | null) ?? null,
        metadata: (row.metadata as Record<string, unknown>) ?? {},
      })),
      limit,
    })
  }

  async readOpsCounterpartyFeed(
    tenantId: string
  ): Promise<OpsCounterpartyFeedResponse> {
    const [tenantRow] = await this.db
      .select({
        tenantName: tenants.tenantName,
      })
      .from(tenants)
      .where(eq(tenants.id, tenantId))
      .limit(1)

    const eventRows = await this.db
      .select({
        id: opsEvents.id,
        eventCode: opsEvents.eventCode,
        title: opsEvents.title,
        summary: opsEvents.summary,
        priority: opsEvents.priority,
        state: opsEvents.state,
        ownerActorId: opsEvents.ownerActorId,
        ownerLabel: opsEvents.ownerLabel,
        counterpartyId: opsEvents.partnerId,
        sourceLabel: opsEvents.sourceLabel,
        slaLabel: opsEvents.slaLabel,
        updatedAt: opsEvents.updatedAt,
      })
      .from(opsEvents)
      .where(eq(opsEvents.tenantId, tenantId))

    const counterpartyRows = await this.db
      .select({
        id: opsPartners.id,
        code: opsPartners.partnerCode,
        name: opsPartners.partnerName,
        regionLabel: opsPartners.regionLabel,
        ownerLabel: opsPartners.ownerLabel,
        channelLabel: opsPartners.channelLabel,
        responseLabel: opsPartners.responseLabel,
        health: opsPartners.health,
      })
      .from(opsPartners)
      .where(eq(opsPartners.tenantId, tenantId))

    return buildOpsCounterpartyFeed({
      tenantId,
      tenantName: tenantRow?.tenantName ?? tenantLabelFromId(tenantId),
      events: eventRows.map((row) => ({
        ...row,
        priority: row.priority as OpsEventPriority,
        state: row.state as OpsEventState,
        updatedAt: row.updatedAt.toISOString(),
      })),
      counterparties: counterpartyRows.map((row) => ({
        ...row,
        health: row.health as OpsCounterpartyHealth,
      })),
    })
  }

  async persistMutation(input: PersistedOpsMutationInput): Promise<string> {
    const truthRecordId = randomUUID()
    const hash = hashTruthRecordEnvelope(input.truthRecord)

    await this.db.transaction(async (tx) => {
      const updatedRows = await tx
        .update(opsEvents)
        .set({
          state: input.nextEvent.state,
          ownerActorId: input.nextEvent.ownerActorId,
          ownerLabel: input.nextEvent.ownerLabel,
          sourceLabel: input.nextEvent.sourceLabel,
          slaLabel: input.nextEvent.slaLabel,
          updatedAt: new Date(input.nextEvent.updatedAt),
        })
        .where(
          and(
            eq(opsEvents.tenantId, input.tenantId),
            eq(opsEvents.id, input.nextEvent.id),
            eq(opsEvents.state, input.expectedEvent.state),
            eq(opsEvents.updatedAt, new Date(input.expectedEvent.updatedAt))
          )
        )
        .returning({
          id: opsEvents.id,
        })

      if (updatedRows.length === 0) {
        throw new Error(`ops_event_concurrency_conflict:${input.nextEvent.id}`)
      }

      await tx.insert(truthRecords).values({
        id: truthRecordId,
        tenantId: input.truthRecord.tenantId,
        entityType: input.truthRecord.entityType,
        entityId: input.truthRecord.entityId,
        commandType: input.truthRecord.commandType,
        actorId: input.truthRecord.actorId,
        timestamp: input.truthRecord.timestamp,
        beforeState: input.truthRecord.beforeState,
        afterState: input.truthRecord.afterState,
        doctrineRef: input.truthRecord.doctrineRef,
        invariantRefs: [...(input.truthRecord.invariantRefs ?? [])],
        hash,
        metadata: {
          ...(input.truthRecord.metadata ?? {}),
          ...(input.truthRecord.linkage
            ? {
                executionLinkage: input.truthRecord.linkage,
              }
            : {}),
        },
      })
    })

    return truthRecordId
  }

  resetForTests(): void {
    // Postgres-backed store has no test reset path.
  }
}

const inMemoryOpsProjectionStore = new InMemoryOpsProjectionStore()

function selectOpsProjectionStore(): OpsProjectionStore {
  if (process.env.NODE_ENV === "test" || !hasBetterAuthRuntimeEnv()) {
    return inMemoryOpsProjectionStore
  }

  const runtime = getBetterAuthRuntime() as ReturnType<
    typeof getBetterAuthRuntime
  > & {
    db?: DatabaseClient
  }

  if (runtime.db) {
    return new DbOpsProjectionStore(runtime.db)
  }

  return inMemoryOpsProjectionStore
}

export async function readWorkspaceSnapshot(
  tenantId: string,
  options: ReadWorkspaceSnapshotOptions = {}
): Promise<WorkspaceSnapshot> {
  return selectOpsProjectionStore().readWorkspaceSnapshotWithOptions(
    tenantId,
    options
  )
}

export async function readOpsAuditFeed(
  tenantId: string,
  options: ReadOpsAuditFeedOptions = {}
): Promise<OpsAuditFeedResponse> {
  return selectOpsProjectionStore().readOpsAuditFeed(tenantId, options)
}

export async function readOpsCounterpartyFeed(
  tenantId: string
): Promise<OpsCounterpartyFeedResponse> {
  return selectOpsProjectionStore().readOpsCounterpartyFeed(tenantId)
}

export async function readOpsEventsWorkspaceFeed(
  tenantId: string,
  options: ReadWorkspaceSnapshotOptions = {}
): Promise<OpsEventsWorkspaceFeedResponse> {
  return selectOpsProjectionStore().readOpsEventsWorkspaceFeed(
    tenantId,
    options
  )
}

export async function readOpsEventProjection(
  tenantId: string,
  eventId: string
): Promise<OpsEventProjectionRecord | null> {
  return selectOpsProjectionStore().readEvent(tenantId, eventId)
}

export async function persistOpsMutation(
  input: PersistedOpsMutationInput
): Promise<string> {
  return selectOpsProjectionStore().persistMutation(input)
}

export function stageStateForAdvance(
  event: OpsEventProjectionRecord
): OpsEventProjectionRecord {
  const nextState = advanceOpsEventState(event.state)
  return {
    ...event,
    state: nextState,
    slaLabel: nextState === "closed" ? "Closed" : "Progressed",
    updatedAt: new Date().toISOString(),
  }
}

export function claimStateForActor(
  event: OpsEventProjectionRecord,
  actorId: string,
  actorLabel: string
): OpsEventProjectionRecord {
  const nextState = event.state === "draft" ? "assigned" : event.state
  return {
    ...event,
    state: nextState,
    ownerActorId: actorId,
    ownerLabel: actorLabel,
    updatedAt: new Date().toISOString(),
  }
}

export function __resetOpsProjectionStoreForTests(): void {
  inMemoryOpsProjectionStore.resetForTests()
}

export function __seedOpsProjectionStoreForTests(tenantId = "tenant-1"): void {
  inMemoryOpsProjectionStore.seedTenant(tenantId)
}
