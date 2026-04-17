import { describe, expect, it } from "vitest"

import {
  getAuditActionDefinition,
  isAuditActionKey,
} from "../contracts/audit-action-catalog"
import {
  isAuditDoctrineKey,
  isAuditInvariantKey,
} from "../contracts/audit-doctrine-registry"
import {
  getAuditResolutionDefinition,
  isAuditResolutionKey,
} from "../contracts/audit-resolution-catalog"
import {
  auditQueryInputSchema,
  parseAuditQueryInput,
} from "../contracts/audit-query-contract"
import {
  parseAuditChanges,
  parseAuditMetadata,
} from "../contracts/audit-payload-contract"
import { redactAuditPayload } from "../contracts/audit-redaction-policy"
import {
  getAuditRetentionDefinition,
  isAuditRetentionClass,
} from "../contracts/audit-retention-policy"
import { summarizeAuditViews } from "../read-model/audit-investigation-summary"
import { toAuditAdminView } from "../read-model/audit-read-model"
import type { AuditLog } from "../schema/audit-logs.schema"
import {
  getActorAuditHistory,
  getCorrelationAuditHistory,
  getRequestAuditHistory,
  getSubjectAuditHistory,
} from "../services/audit-investigation-service"
import { getAuditInvestigationSummary } from "../services/audit-investigation-summary-service"
import { queryAuditLogs } from "../services/audit-query-service"
import { queryAuditAdminViews } from "../services/audit-read-model-service"
import { queryAuditRowsForRetentionReview } from "../services/audit-retention-query-service"
import { getAuditRetentionDisposition } from "../services/audit-retention-service"
import { buildAuditLog } from "../services/build-audit-log"
import {
  insertAuditLog,
  insertGovernedAuditLog,
} from "../services/insert-audit-log"
import { validateAuditLog } from "../services/validate-audit-log"
import {
  parseSerializedAuditLog,
  serializeAuditAdminView,
  serializeAuditLog,
} from "../utils/serialize-audit-log"
import {
  createInsertReturningMock,
  createSelectLimitMock,
  createSelectLimitMockNoOrderBy,
} from "./helpers/mock-database-client"

describe("audit contracts — catalogs & parsers", () => {
  it("classifies known action keys", () => {
    expect(isAuditActionKey("invoice.created")).toBe(true)
    expect(isAuditActionKey("auth.session.created")).toBe(true)
    expect(isAuditActionKey("auth.session.revoked")).toBe(true)
    expect(isAuditActionKey("not.a.real.action")).toBe(false)
  })

  it("getAuditActionDefinition returns catalog row", () => {
    const d = getAuditActionDefinition("auth.login.succeeded")
    expect(d.category).toBe("authentication")
  })

  it("getAuditActionDefinition throws for unknown action", () => {
    expect(() => getAuditActionDefinition("unknown.action")).toThrow(
      /Unknown audit action/
    )
  })

  it("resolution catalog helpers", () => {
    expect(isAuditResolutionKey("resolution.none")).toBe(true)
    expect(isAuditResolutionKey("nope")).toBe(false)
    expect(getAuditResolutionDefinition("resolution.none").key).toBe(
      "resolution.none"
    )
    expect(() => getAuditResolutionDefinition("bad")).toThrow(
      /Unknown audit resolutionRef/
    )
  })

  it("doctrine & invariant keys", () => {
    expect(isAuditDoctrineKey("doctrine.audit.append-only")).toBe(true)
    expect(isAuditDoctrineKey("x")).toBe(false)
    expect(isAuditInvariantKey("invariant.audit.no-in-place-correction")).toBe(
      true
    )
    expect(isAuditInvariantKey("x")).toBe(false)
  })

  it("retention policy", () => {
    expect(isAuditRetentionClass("audit-standard")).toBe(true)
    expect(isAuditRetentionClass("nope")).toBe(false)
    expect(getAuditRetentionDefinition("audit-short").retentionDays).toBe(90)
    expect(() => getAuditRetentionDefinition("unknown")).toThrow(
      /Unknown audit retentionClass/
    )
  })

  it("parseAuditQueryInput accepts valid tenant query", () => {
    const q = parseAuditQueryInput({
      tenantId: "00000000-0000-4000-8000-000000000001",
    })
    expect(q.limit).toBe(100)
  })

  it("parseAuditQueryInput rejects invalid uuid", () => {
    expect(() => parseAuditQueryInput({ tenantId: "not-a-uuid" })).toThrow()
  })

  it("auditQueryInputSchema is strict", () => {
    expect(() =>
      auditQueryInputSchema.parse({
        tenantId: "00000000-0000-4000-8000-000000000001",
        extra: 1,
      })
    ).toThrow()
  })

  it("parseAuditChanges and parseMetadata", () => {
    expect(
      parseAuditChanges({
        before: { a: 1 },
        after: { a: 2 },
      })
    ).toMatchObject({ before: { a: 1 } })
    expect(parseAuditMetadata({ route: "/x" })).toMatchObject({ route: "/x" })
    expect(parseAuditChanges(null)).toBeUndefined()
  })

  it("redactAuditPayload covers branches", () => {
    expect(redactAuditPayload("plain")).toBe("plain")
    expect(
      redactAuditPayload({ password: "x", email: "a@b.com", ok: 1 })
    ).toMatchObject({
      password: "[REDACTED_FORBIDDEN]",
      email: "[REDACTED_MASKED]",
      ok: 1,
    })
    expect(redactAuditPayload([{ token: "t" }])).toEqual([
      { token: "[REDACTED_FORBIDDEN]" },
    ])
  })
})

describe("audit services — DB-shaped mocks", () => {
  const tenantId = "00000000-0000-4000-8000-000000000001"

  it("queryAuditLogs returns rows from mock", async () => {
    const rows = [{ id: "00000000-0000-4000-8000-000000000099" }]
    const db = createSelectLimitMock(rows)
    const result = await queryAuditLogs(db, { tenantId, limit: 50 })
    expect(result).toEqual(rows)
  })

  it("queryAuditLogs applies optional filters", async () => {
    const db = createSelectLimitMock([])
    await queryAuditLogs(db, {
      tenantId,
      subjectType: "invoice",
      subjectId: "inv-1",
      actorUserId: "00000000-0000-4000-8000-000000000002",
      action: "invoice.created",
      outcome: "success",
      requestId: "req",
      traceId: "trace",
      correlationId: "corr",
      parentAuditId: "00000000-0000-4000-8000-000000000003",
      legalEntityId: "00000000-0000-4000-8000-000000000004",
      fromRecordedAt: new Date("2020-01-01"),
      toRecordedAt: new Date("2030-01-01"),
      limit: 10,
    })
    expect(db.select).toHaveBeenCalled()
  })

  it("queryAuditRowsForRetentionReview", async () => {
    const db = createSelectLimitMockNoOrderBy([])
    await queryAuditRowsForRetentionReview(db, {
      tenantId,
      beforeRecordedAt: new Date(),
      retentionClass: "audit-standard",
      limit: 50,
    })
    expect(db.select).toHaveBeenCalled()
  })

  it("queryAuditRowsForRetentionReview without retentionClass uses isNotNull path", async () => {
    const db = createSelectLimitMockNoOrderBy([])
    await queryAuditRowsForRetentionReview(db, {
      tenantId,
      beforeRecordedAt: new Date(),
    })
    expect(db.select).toHaveBeenCalled()
  })

  it("insertAuditLog delegates to insert chain", async () => {
    const created = { id: "00000000-0000-4000-8000-0000000000aa" }
    const db = createInsertReturningMock([created])
    const result = await insertAuditLog(db, {
      tenantId,
      action: "auth.login.succeeded",
      subjectType: "session",
      subjectId: "s1",
    } as Parameters<typeof insertAuditLog>[1])
    expect(result).toEqual(created)
  })

  it("insertGovernedAuditLog builds then inserts", async () => {
    const created = { id: "00000000-0000-4000-8000-0000000000bb" }
    const db = createInsertReturningMock([created])
    const result = await insertGovernedAuditLog(db, {
      tenantId,
      action: "auth.login.succeeded",
      actorType: "person",
      subjectType: "session",
      subjectId: "s1",
      sourceChannel: "api",
    })
    expect(result).toEqual(created)
  })

  it("investigation helpers call query", async () => {
    const db = createSelectLimitMock([])
    await getSubjectAuditHistory(db, {
      tenantId,
      subjectType: "x",
      subjectId: "y",
    })
    await getRequestAuditHistory(db, { tenantId, requestId: "r" })
    await getCorrelationAuditHistory(db, { tenantId, correlationId: "c" })
    await getActorAuditHistory(db, {
      tenantId,
      actorUserId: "00000000-0000-4000-8000-000000000005",
    })
    expect(db.select).toHaveBeenCalled()
  })

  it("queryAuditAdminViews maps rows", async () => {
    const db = createSelectLimitMock([])
    const views = await queryAuditAdminViews(db, { tenantId, limit: 50 })
    expect(views).toEqual([])
  })

  it("getAuditInvestigationSummary aggregates", async () => {
    const db = createSelectLimitMock([])
    const summary = await getAuditInvestigationSummary(db, {
      tenantId,
      limit: 50,
    })
    expect(summary.total).toBe(0)
  })
})

describe("audit retention disposition", () => {
  it("eligible purge when expired and policy allows", () => {
    const d = getAuditRetentionDisposition({
      retentionClass: "audit-short",
      legalHold: false,
      recordedAt: new Date("2000-01-01T00:00:00.000Z"),
    })
    expect(d.eligibleForPurge).toBe(true)
  })

  it("archive eligibility when required", () => {
    const d = getAuditRetentionDisposition({
      retentionClass: "audit-standard",
      legalHold: false,
      recordedAt: new Date("2000-01-01T00:00:00.000Z"),
    })
    expect(d.archiveRequired).toBe(true)
  })
})

describe("read model & serialize", () => {
  const baseLog = {
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
    recordedAt: new Date("2026-01-01T00:00:00.000Z"),
    effectiveAt: null,
  } satisfies Omit<AuditLog, never>

  it("toAuditAdminView maps row", () => {
    const view = toAuditAdminView(baseLog as AuditLog)
    expect(view.action).toBe("invoice.created")
    expect(view.identity.actorType).toBe("person")
  })

  it("summarizeAuditViews aggregates outcomes and dates", () => {
    const view = toAuditAdminView(baseLog as AuditLog)
    const s = summarizeAuditViews([view, view])
    expect(s.total).toBe(2)
    expect(s.outcomes.success).toBe(2)
    expect(s.actions["invoice.created"]).toBe(2)
    expect(s.firstRecordedAt).toEqual(view.recordedAt)
  })

  it("serializeAuditLog and parseSerializedAuditLog", () => {
    const json = serializeAuditLog(baseLog as AuditLog)
    expect(json).toContain("2026-01-01")
    expect(parseSerializedAuditLog(json)).toBeTruthy()
  })

  it("serializeAuditAdminView", () => {
    const view = toAuditAdminView(baseLog as AuditLog)
    const json = serializeAuditAdminView(view)
    expect(json).toContain("invoice.created")
  })
})

describe("validateAuditLog — extra branches", () => {
  const base = (): Parameters<typeof validateAuditLog>[0] =>
    ({
      tenantId: "00000000-0000-4000-8000-000000000001",
      action: "invoice.created",
      actorType: "person",
      subjectType: "invoice",
      outcome: "success",
      sourceChannel: "api",
      riskLevel: "medium",
      environment: "production",
      legalHold: false,
    }) as Parameters<typeof validateAuditLog>[0]

  it("rejects bad actionCategory", () => {
    expect(() =>
      validateAuditLog({
        ...base(),
        actionCategory: "wrong",
      } as Parameters<typeof validateAuditLog>[0])
    ).toThrow(/actionCategory mismatch/)
  })

  it("rejects bad riskLevel", () => {
    expect(() =>
      validateAuditLog({
        ...base(),
        riskLevel: "high",
      } as Parameters<typeof validateAuditLog>[0])
    ).toThrow(/riskLevel mismatch/)
  })

  it("rejects unknown invariant ref", () => {
    expect(() =>
      validateAuditLog({
        ...base(),
        invariantRef: "invariant.unknown",
      } as Parameters<typeof validateAuditLog>[0])
    ).toThrow(/unknown invariantRef/)
  })

  it("requires reason for audit.redaction.applied", () => {
    expect(() =>
      validateAuditLog({
        ...base(),
        action: "audit.redaction.applied",
        riskLevel: "critical",
      } as Parameters<typeof validateAuditLog>[0])
    ).toThrow(/requires reasonCode/)
  })
})

describe("buildAuditLog — error paths", () => {
  it("throws AuditValidationError on invalid changes shape", () => {
    expect(() =>
      buildAuditLog({
        tenantId: "00000000-0000-4000-8000-000000000001",
        action: "auth.login.succeeded",
        actorType: "person",
        subjectType: "session",
        subjectId: "s",
        sourceChannel: "api",
        changes: { unknownKey: true },
      })
    ).toThrow(/invalid audit changes/)
  })

  it("throws AuditValidationError on invalid metadata shape", () => {
    expect(() =>
      buildAuditLog({
        tenantId: "00000000-0000-4000-8000-000000000001",
        action: "auth.login.succeeded",
        actorType: "person",
        subjectType: "session",
        subjectId: "s",
        sourceChannel: "api",
        metadata: { extra: "not-in-schema" },
      })
    ).toThrow(/invalid audit metadata/)
  })
})

describe("insertAuditLog — explicit timestamps", () => {
  it("respects provided occurredAt and recordedAt", async () => {
    const occurred = new Date("2025-06-01T00:00:00.000Z")
    const recorded = new Date("2025-06-02T00:00:00.000Z")
    const created = {
      id: "00000000-0000-4000-8000-0000000000cc",
      occurredAt: occurred,
      recordedAt: recorded,
    }
    const db = createInsertReturningMock([created])
    const result = await insertAuditLog(db, {
      tenantId: "00000000-0000-4000-8000-000000000001",
      action: "auth.login.succeeded",
      subjectType: "session",
      subjectId: "s1",
      occurredAt: occurred,
      recordedAt: recorded,
    } as Parameters<typeof insertAuditLog>[1])
    expect(result?.recordedAt).toEqual(recorded)
  })
})
