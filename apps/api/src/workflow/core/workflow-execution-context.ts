import type { WorkflowExecutionContext } from "./workflow-execution.contracts.js"

export function createWorkflowExecutionContext(input: {
  readonly tenantId: string
  readonly actorId: string
  readonly actorLabel: string
  readonly requestId?: string
  readonly correlationId?: string
  readonly causationId?: string
}): WorkflowExecutionContext {
  const requestId = input.requestId ?? crypto.randomUUID()

  return {
    tenantId: input.tenantId,
    actorId: input.actorId,
    actorLabel: input.actorLabel,
    requestId,
    correlationId: input.correlationId ?? requestId,
    causationId: input.causationId ?? crypto.randomUUID(),
  }
}
