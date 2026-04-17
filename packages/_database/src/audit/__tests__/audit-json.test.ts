import { describe, expect, it } from "vitest"

import type { AuditLog } from "../schema/audit-logs.schema"
import { toAuditAdminView } from "../read-model/audit-read-model"
import { jsonWithIsoDates } from "../utils/audit-json"
import {
  parseSerializedAuditLog,
  serializeAuditAdminView,
  serializeAuditLog,
} from "../utils/serialize-audit-log"

describe("jsonWithIsoDates", () => {
  it("serializes Date values to ISO strings", () => {
    const d = new Date("2024-06-01T12:00:00.000Z")
    const s = jsonWithIsoDates({ at: d, n: 1 })
    expect(s).toContain("2024-06-01T12:00:00.000Z")
    expect(s).toContain('"n":1')
  })

  it("produces deterministic output for the same input", () => {
    const d = new Date("2024-06-01T12:00:00.000Z")
    const a = jsonWithIsoDates({ at: d })
    const b = jsonWithIsoDates({ at: d })
    expect(a).toBe(b)
  })
})

describe("serializeAuditLog / serializeAuditAdminView", () => {
  const row = {
    id: "00000000-0000-4000-8000-000000000010",
    tenantId: "00000000-0000-4000-8000-000000000001",
    legalEntityId: null,
    membershipId: null,
    authUserId: null,
    actorType: "person" as const,
    actorUserId: null,
    actorDisplay: null,
    actingAsUserId: null,
    action: "invoice.created",
    actionCategory: "billing",
    riskLevel: "medium" as const,
    subjectType: "invoice",
    subjectId: "inv-1",
    aggregateType: null,
    aggregateId: null,
    documentType: null,
    documentId: null,
    parentAuditId: null,
    changes: null,
    metadata: null,
    outcome: "success" as const,
    errorCode: null,
    sourceChannel: "api" as const,
    requestId: null,
    traceId: null,
    correlationId: null,
    causationId: null,
    commandId: null,
    sessionId: null,
    jobId: null,
    batchId: null,
    idempotencyKey: null,
    reasonCode: null,
    reasonText: null,
    environment: "production" as const,
    ipAddress: null,
    userAgent: null,
    doctrineRef: null,
    invariantRef: null,
    resolutionRef: null,
    aiModelVersion: null,
    aiPromptVersion: null,
    retentionClass: "audit-standard",
    legalHold: false,
    occurredAt: new Date("2026-01-01T00:00:00.000Z"),
    recordedAt: new Date("2026-01-02T00:00:00.000Z"),
    effectiveAt: null,
  } satisfies Omit<AuditLog, never>

  it("serializeAuditLog uses ISO dates and round-trips JSON.parse", () => {
    const json = serializeAuditLog(row as AuditLog)
    expect(json).toMatch(/2026-01-01T00:00:00\.000Z/)
    expect(json).toMatch(/2026-01-02T00:00:00\.000Z/)
    const parsed = parseSerializedAuditLog(json) as Record<string, unknown>
    expect(parsed.occurredAt).toBe("2026-01-01T00:00:00.000Z")
    expect(parsed.recordedAt).toBe("2026-01-02T00:00:00.000Z")
    expect(parsed.action).toBe("invoice.created")
  })

  it("serializeAuditAdminView matches row serialization date handling", () => {
    const view = toAuditAdminView(row as AuditLog)
    const json = serializeAuditAdminView(view)
    expect(json).toContain("2026-01-02T00:00:00.000Z")
    const parsed = JSON.parse(json) as Record<string, unknown>
    expect(parsed.recordedAt).toBe("2026-01-02T00:00:00.000Z")
  })
})
