import type { EventEnvelopeV1, ExecutionLinkage } from "@afenda/events"

export type {
  EventEnvelopeV1 as WorkflowEventEnvelopeV1,
  ExecutionLinkage,
} from "@afenda/events"

export interface WorkflowExecutionContext {
  readonly tenantId: string
  readonly actorId: string
  readonly actorLabel: string
  readonly requestId: string
  readonly correlationId: string
  readonly causationId: string
}

export interface WorkflowTransitionResult<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> {
  readonly truthRecordId: string
  readonly linkage: ExecutionLinkage
  readonly event: EventEnvelopeV1<TPayload>
}
