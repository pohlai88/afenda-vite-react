import type { ExecutionLinkage } from "@afenda/events"

export type TruthRecordEnvelope = {
  readonly tenantId: string
  readonly entityType: string
  readonly entityId: string
  readonly commandType: string
  readonly actorId: string
  readonly timestamp: Date
  readonly beforeState: Record<string, unknown> | null
  readonly afterState: Record<string, unknown> | null
  readonly doctrineRef?: string | null
  readonly invariantRefs?: readonly string[]
  readonly linkage?: ExecutionLinkage
  readonly metadata?: Record<string, unknown>
}
