import { createHash, randomUUID } from "node:crypto"

export type ExecutionLinkage = {
  readonly tenantId: string
  readonly requestId: string
  readonly correlationId: string
  readonly causationId: string
  readonly executionHash: string
}

export type EventEnvelopeV1<
  TPayload extends Record<string, unknown> = Record<string, unknown>,
> = {
  readonly version: "v1"
  readonly eventType: string
  readonly linkage: ExecutionLinkage
  readonly occurredAt: string
  readonly payload: TPayload
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item))
  }

  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    )
  }

  return value
}

function normalizeTimestamp(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString()
  }

  return new Date(value).toISOString()
}

export function createExecutionHash(transitionPayload: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(canonicalize(transitionPayload)))
    .digest("hex")
}

export function createExecutionLinkage(input: {
  readonly tenantId: string
  readonly requestId: string
  readonly correlationId?: string
  readonly causationId?: string
  readonly transitionPayload: unknown
}): ExecutionLinkage {
  return {
    tenantId: input.tenantId,
    requestId: input.requestId,
    correlationId: input.correlationId ?? input.requestId,
    causationId: input.causationId ?? randomUUID(),
    executionHash: createExecutionHash(input.transitionPayload),
  }
}

export function createEventEnvelopeV1<
  TPayload extends Record<string, unknown>,
>(input: {
  readonly eventType: string
  readonly linkage: ExecutionLinkage
  readonly occurredAt: Date | string
  readonly payload: TPayload
}): EventEnvelopeV1<TPayload> {
  return {
    version: "v1",
    eventType: input.eventType,
    linkage: input.linkage,
    occurredAt: normalizeTimestamp(input.occurredAt),
    payload: input.payload,
  }
}

export function serializeEventEnvelopeV1(
  envelope: EventEnvelopeV1<Record<string, unknown>>
): string {
  return JSON.stringify(
    {
      ...envelope,
      payload: canonicalize(envelope.payload),
    },
    null,
    2
  )
}

export function hashEventEnvelopeV1(
  envelope: EventEnvelopeV1<Record<string, unknown>>
): string {
  return createHash("sha256")
    .update(
      JSON.stringify({
        ...envelope,
        payload: canonicalize(envelope.payload),
      })
    )
    .digest("hex")
}

export function isExecutionLinkage(value: unknown): value is ExecutionLinkage {
  return (
    isRecord(value) &&
    typeof value.tenantId === "string" &&
    typeof value.requestId === "string" &&
    typeof value.correlationId === "string" &&
    typeof value.causationId === "string" &&
    typeof value.executionHash === "string"
  )
}

export function isEventEnvelopeV1(
  value: unknown
): value is EventEnvelopeV1<Record<string, unknown>> {
  return (
    isRecord(value) &&
    value.version === "v1" &&
    typeof value.eventType === "string" &&
    typeof value.occurredAt === "string" &&
    isRecord(value.payload) &&
    isExecutionLinkage(value.linkage)
  )
}
