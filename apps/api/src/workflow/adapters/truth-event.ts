import {
  createEventEnvelopeV1,
  createExecutionLinkage,
  type EventEnvelopeV1,
  type ExecutionLinkage,
} from "@afenda/events"

import type { TruthRecordEnvelope } from "../../truth/truth-record.model.js"
import type { WorkflowExecutionContext } from "../core/contracts.js"

export function materializeWorkflowTransition<
  TPayload extends Record<string, unknown>,
>(input: {
  readonly context: WorkflowExecutionContext
  readonly truthRecord: TruthRecordEnvelope
  readonly eventType: string
  readonly eventPayload: TPayload
}): {
  readonly truthRecord: TruthRecordEnvelope
  readonly linkage: ExecutionLinkage
  readonly event: EventEnvelopeV1<TPayload>
} {
  const transitionPayload = {
    tenantId: input.truthRecord.tenantId,
    entityType: input.truthRecord.entityType,
    entityId: input.truthRecord.entityId,
    commandType: input.truthRecord.commandType,
    beforeState: input.truthRecord.beforeState,
    afterState: input.truthRecord.afterState,
    doctrineRef: input.truthRecord.doctrineRef ?? null,
    invariantRefs: [...(input.truthRecord.invariantRefs ?? [])].sort(),
    metadata: input.truthRecord.metadata ?? {},
  }

  const linkage = createExecutionLinkage({
    tenantId: input.context.tenantId,
    requestId: input.context.requestId,
    correlationId: input.context.correlationId,
    causationId: input.context.causationId,
    transitionPayload,
  })

  const truthRecord: TruthRecordEnvelope = {
    ...input.truthRecord,
    linkage,
    metadata: {
      ...(input.truthRecord.metadata ?? {}),
      executionLinkage: linkage,
    },
  }

  return {
    truthRecord,
    linkage,
    event: createEventEnvelopeV1({
      eventType: input.eventType,
      linkage,
      occurredAt: truthRecord.timestamp,
      payload: input.eventPayload,
    }),
  }
}
