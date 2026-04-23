export type WorkspaceMetricTone = "neutral" | "success" | "warning" | "danger"
export type WorkspaceEventPriority = "critical" | "high" | "medium" | "low"
export type WorkspaceEventStatus =
  | "draft"
  | "assigned"
  | "in_progress"
  | "completed"
  | "closed"
export type WorkspaceCounterpartyHealth = "healthy" | "attention" | "blocked"

export interface WorkspaceMetric {
  readonly id: string
  readonly label: string
  readonly value: string
  readonly helper: string
  readonly tone: WorkspaceMetricTone
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
  readonly priority: WorkspaceEventPriority
  readonly status: WorkspaceEventStatus
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

export interface WorkspaceCounterparty {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly regionLabel: string
  readonly ownerLabel: string
  readonly channelLabel: string
  readonly responseLabel: string
  readonly health: WorkspaceCounterpartyHealth
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
