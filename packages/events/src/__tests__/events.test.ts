import { describe, expect, it } from "vitest"

import {
  createEventEnvelopeV1,
  createExecutionHash,
  createExecutionLinkage,
  hashEventEnvelopeV1,
  isEventEnvelopeV1,
  isExecutionLinkage,
  serializeEventEnvelopeV1,
} from "../index.js"

describe("@afenda/events", () => {
  it("creates stable execution hashes for equivalent payloads", () => {
    const left = createExecutionHash({
      afterState: { state: "assigned", owner: "Rhea" },
      beforeState: { state: "draft", owner: null },
    })
    const right = createExecutionHash({
      beforeState: { owner: null, state: "draft" },
      afterState: { owner: "Rhea", state: "assigned" },
    })

    expect(left).toBe(right)
  })

  it("creates versioned event envelopes with shared execution linkage", () => {
    const linkage = createExecutionLinkage({
      tenantId: "tenant-1",
      requestId: "req-1",
      transitionPayload: {
        entityId: "evt-4301",
        commandType: "ops.event.claim",
      },
    })

    const envelope = createEventEnvelopeV1({
      eventType: "ops.event.claimed",
      linkage,
      occurredAt: "2026-04-25T10:00:00.000Z",
      payload: {
        eventId: "evt-4301",
        nextState: "assigned",
      },
    })

    expect(isExecutionLinkage(linkage)).toBe(true)
    expect(isEventEnvelopeV1(envelope)).toBe(true)
    expect(envelope.version).toBe("v1")
    expect(envelope.linkage.requestId).toBe("req-1")
    expect(serializeEventEnvelopeV1(envelope)).toContain('"version": "v1"')
    expect(hashEventEnvelopeV1(envelope)).toMatch(/^[a-f0-9]{64}$/u)
  })
})
