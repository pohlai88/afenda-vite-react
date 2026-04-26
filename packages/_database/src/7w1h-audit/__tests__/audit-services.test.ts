/**
 * Vitest: 7W1H audit services — validate, build, insert, query (mocked DB).
 */
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { DatabaseClient } from "../../client"
import { auditActionKeys } from "../contracts/audit-action-catalog"
import {
  countAuditLogs,
  getAuditActorActivity,
  getAuditModuleActivity,
  getAuditSubjectHistory,
  queryAuditLogPage,
  queryAuditLogs,
} from "../services/audit-query-service"
import {
  buildAuditLog,
  type BuildAuditLogInput,
} from "../services/build-audit-log"
import {
  insertAuditLog,
  insertGovernedAuditLog,
} from "../services/insert-audit-log"
import { validateAuditLog } from "../services/validate-audit-log"

const tenantId = "018f1234-5678-7abc-8def-123456789abc"
const subjectType = "user"

function minimalValidRow(overrides: Record<string, unknown> = {}) {
  return {
    tenantId,
    subjectType,
    action: auditActionKeys[0],
    metadata: {},
    sevenW1h: {},
    sourceChannel: "api" as const,
    actorType: "person" as const,
    outcome: "success" as const,
    environment: "production" as const,
    occurredAt: new Date("2026-01-01T00:00:00.000Z"),
    recordedAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  }
}

describe("validateAuditLog", () => {
  it("returns the row when valid", () => {
    const row = minimalValidRow()
    expect(validateAuditLog(row)).toBe(row)
  })

  it("throws when tenantId missing", () => {
    expect(() => validateAuditLog(minimalValidRow({ tenantId: "" }))).toThrow(
      "tenantId is required"
    )
  })

  it("throws when subjectType missing", () => {
    expect(() =>
      validateAuditLog(minimalValidRow({ subjectType: "" }))
    ).toThrow("subjectType is required")
  })

  it("throws on unknown action", () => {
    expect(() =>
      validateAuditLog(minimalValidRow({ action: "not.a.real.action" }))
    ).toThrow("Unknown audit action")
  })

  it("throws when UI channel uses actorType unknown", () => {
    expect(() =>
      validateAuditLog(
        minimalValidRow({ sourceChannel: "ui", actorType: "unknown" })
      )
    ).toThrow("UI audit rows must not use actorType=unknown")
  })
})

describe("buildAuditLog", () => {
  it("fills metadata, sevenW1h, and timestamps", () => {
    const input: BuildAuditLogInput = {
      tenantId,
      subjectType,
      action: "auth.login.succeeded",
      metadata: {},
      sevenW1h: {},
    }
    const row = buildAuditLog(input)
    expect(row.metadata).toEqual({})
    expect(row.sevenW1h).toEqual({})
    expect(row.occurredAt).toBeInstanceOf(Date)
    expect(row.recordedAt).toBeInstanceOf(Date)
  })

  it("preserves explicit metadata and sevenW1h objects", () => {
    const row = buildAuditLog({
      tenantId,
      subjectType,
      action: "auth.user.updated",
      metadata: { k: 1 },
      sevenW1h: { where: { pathname: "/x" } },
    })
    expect(row.metadata).toEqual({ k: 1 })
    expect(row.sevenW1h).toEqual({ where: { pathname: "/x" } })
  })

  it("preserves explicit occurredAt and recordedAt", () => {
    const occurredAt = new Date("2025-06-01T12:00:00.000Z")
    const recordedAt = new Date("2025-06-01T12:01:00.000Z")
    const row = buildAuditLog({
      tenantId,
      subjectType,
      action: "auth.session.created",
      metadata: {},
      sevenW1h: {},
      occurredAt,
      recordedAt,
    })
    expect(row.occurredAt).toBe(occurredAt)
    expect(row.recordedAt).toBe(recordedAt)
  })

  it("writes computed change evidence into metadata", () => {
    const row = buildAuditLog({
      tenantId,
      subjectType,
      action: "auth.user.updated",
      changeEvidence: {
        previousValue: { password: "before", status: "draft" },
        nextValue: { password: "after", status: "active" },
      },
    })

    expect(row.metadata).toEqual({
      changeEvidence: {
        changes: [
          {
            field: "password",
            oldValue: "***",
            newValue: "***",
            masked: true,
          },
          {
            field: "status",
            oldValue: "draft",
            newValue: "active",
            masked: false,
          },
        ],
        previousValue: { password: "***", status: "draft" },
        nextValue: { password: "***", status: "active" },
      },
    })
  })
})

describe("insertAuditLog", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it("defaults metadata, sevenW1h, and timestamps when omitted", async () => {
    const created = { id: "01900000-0000-7000-8000-000000000010" }
    const returning = vi.fn().mockResolvedValue([created])
    const values = vi.fn().mockReturnValue({ returning })
    const insert = vi.fn().mockReturnValue({ values })
    const db = { insert } as unknown as DatabaseClient

    const base = minimalValidRow()
    const {
      metadata: _m,
      sevenW1h: _s,
      occurredAt: _o,
      recordedAt: _r,
      ...rest
    } = base
    await insertAuditLog(db, {
      ...rest,
      metadata: undefined,
      sevenW1h: undefined,
      occurredAt: undefined,
      recordedAt: undefined,
    } as unknown as Parameters<typeof insertAuditLog>[1])
    expect(values).toHaveBeenCalled()
  })

  it("inserts and returns the created row", async () => {
    const created = { id: "01900000-0000-7000-8000-000000000001" }
    const returning = vi.fn().mockResolvedValue([created])
    const values = vi.fn().mockReturnValue({ returning })
    const insert = vi.fn().mockReturnValue({ values })
    const db = { insert } as unknown as DatabaseClient

    const row = await insertAuditLog(db, minimalValidRow())
    expect(row).toBe(created)
    expect(insert).toHaveBeenCalled()
    expect(values).toHaveBeenCalled()
    expect(returning).toHaveBeenCalled()
  })

  it("throws when returning() is empty", async () => {
    const returning = vi.fn().mockResolvedValue([])
    const values = vi.fn().mockReturnValue({ returning })
    const insert = vi.fn().mockReturnValue({ values })
    const db = { insert } as unknown as DatabaseClient

    await expect(insertAuditLog(db, minimalValidRow())).rejects.toThrow(
      "expected one row from returning()"
    )
  })
})

describe("insertGovernedAuditLog", () => {
  it("delegates to buildAuditLog + insertAuditLog", async () => {
    const created = { id: "01900000-0000-7000-8000-000000000002" }
    const returning = vi.fn().mockResolvedValue([created])
    const values = vi.fn().mockReturnValue({ returning })
    const insert = vi.fn().mockReturnValue({ values })
    const db = { insert } as unknown as DatabaseClient

    const input: BuildAuditLogInput = {
      tenantId,
      subjectType,
      action: "auth.session.revoked",
      metadata: {},
      sevenW1h: {},
    }
    const row = await insertGovernedAuditLog(db, input)
    expect(row).toBe(created)
  })
})

describe("queryAuditLogs", () => {
  it("runs select with only tenantId (minimal filter path)", async () => {
    const rows: unknown[] = []
    const offset = vi.fn().mockResolvedValue(rows)
    const limit = vi.fn().mockReturnValue({ offset })
    const orderBy = vi.fn().mockReturnValue({ limit })
    const where = vi.fn().mockReturnValue({ orderBy })
    const from = vi.fn().mockReturnValue({ where })
    const select = vi.fn().mockReturnValue({ from })
    const db = { select } as unknown as DatabaseClient

    const result = await queryAuditLogs(db, {
      tenantId,
      limit: 25,
    })
    expect(result).toBe(rows)
    expect(limit).toHaveBeenCalledWith(25)
    expect(offset).toHaveBeenCalledWith(0)
  })

  it("runs select with optional filters", async () => {
    const rows = [{ id: "01900000-0000-7000-8000-000000000003" }]
    const offset = vi.fn().mockResolvedValue(rows)
    const limit = vi.fn().mockReturnValue({ offset })
    const orderBy = vi.fn().mockReturnValue({ limit })
    const where = vi.fn().mockReturnValue({ orderBy })
    const from = vi.fn().mockReturnValue({ where })
    const select = vi.fn().mockReturnValue({ from })
    const db = { select } as unknown as DatabaseClient

    const result = await queryAuditLogs(db, {
      tenantId,
      subjectType: "tenant",
      subjectId: "sub-1",
      actorUserId: "018f1234-5678-7abc-8def-123456789abd",
      action: "auth.login.succeeded",
      outcome: "success",
      requestId: "req-1",
      traceId: "trace-1",
      correlationId: "corr-1",
      fromRecordedAt: new Date("2026-01-01"),
      toRecordedAt: new Date("2026-12-31"),
      w1hWherePathname: "/app",
      w1hHowMechanism: "click",
      w1hHowInteractionPhase: "succeeded",
      offset: 10,
      limit: 50,
    })

    expect(result).toBe(rows)
    expect(select).toHaveBeenCalled()
    expect(from).toHaveBeenCalled()
    expect(where).toHaveBeenCalled()
    expect(orderBy).toHaveBeenCalled()
    expect(limit).toHaveBeenCalledWith(50)
    expect(offset).toHaveBeenCalledWith(10)
  })
})

describe("audit query helpers", () => {
  it("counts matching audit logs", async () => {
    const where = vi.fn().mockResolvedValue([{ total: 7 }])
    const from = vi.fn().mockReturnValue({ where })
    const select = vi.fn().mockReturnValue({ from })
    const db = { select } as unknown as DatabaseClient

    await expect(
      countAuditLogs(db, {
        tenantId,
      })
    ).resolves.toBe(7)
  })

  it("returns rows with total for paged queries", async () => {
    const rows = [{ id: "01900000-0000-7000-8000-000000000004" }]

    const offset = vi.fn().mockResolvedValue(rows)
    const limit = vi.fn().mockReturnValue({ offset })
    const orderBy = vi.fn().mockReturnValue({ limit })
    const whereRows = vi.fn().mockReturnValue({ orderBy })
    const fromRows = vi.fn().mockReturnValue({ where: whereRows })

    const whereCount = vi.fn().mockResolvedValue([{ total: 1 }])
    const fromCount = vi.fn().mockReturnValue({ where: whereCount })

    const select = vi
      .fn()
      .mockReturnValueOnce({ from: fromRows })
      .mockReturnValueOnce({ from: fromCount })
    const db = { select } as unknown as DatabaseClient

    await expect(
      queryAuditLogPage(db, {
        tenantId,
        limit: 20,
      })
    ).resolves.toEqual({
      entries: rows,
      total: 1,
    })
  })

  it("maps history and activity helpers onto the paged query surface", async () => {
    const page = {
      entries: [{ id: "01900000-0000-7000-8000-000000000005" }],
      total: 1,
    }

    const offset1 = vi.fn().mockResolvedValue(page.entries)
    const limit1 = vi.fn().mockReturnValue({ offset: offset1 })
    const orderBy1 = vi.fn().mockReturnValue({ limit: limit1 })
    const whereRows1 = vi.fn().mockReturnValue({ orderBy: orderBy1 })
    const fromRows1 = vi.fn().mockReturnValue({ where: whereRows1 })
    const whereCount1 = vi.fn().mockResolvedValue([{ total: 1 }])
    const fromCount1 = vi.fn().mockReturnValue({ where: whereCount1 })

    const offset2 = vi.fn().mockResolvedValue(page.entries)
    const limit2 = vi.fn().mockReturnValue({ offset: offset2 })
    const orderBy2 = vi.fn().mockReturnValue({ limit: limit2 })
    const whereRows2 = vi.fn().mockReturnValue({ orderBy: orderBy2 })
    const fromRows2 = vi.fn().mockReturnValue({ where: whereRows2 })
    const whereCount2 = vi.fn().mockResolvedValue([{ total: 1 }])
    const fromCount2 = vi.fn().mockReturnValue({ where: whereCount2 })

    const offset3 = vi.fn().mockResolvedValue(page.entries)
    const limit3 = vi.fn().mockReturnValue({ offset: offset3 })
    const orderBy3 = vi.fn().mockReturnValue({ limit: limit3 })
    const whereRows3 = vi.fn().mockReturnValue({ orderBy: orderBy3 })
    const fromRows3 = vi.fn().mockReturnValue({ where: whereRows3 })
    const whereCount3 = vi.fn().mockResolvedValue([{ total: 1 }])
    const fromCount3 = vi.fn().mockReturnValue({ where: whereCount3 })

    const select = vi
      .fn()
      .mockReturnValueOnce({ from: fromRows1 })
      .mockReturnValueOnce({ from: fromCount1 })
      .mockReturnValueOnce({ from: fromRows2 })
      .mockReturnValueOnce({ from: fromCount2 })
      .mockReturnValueOnce({ from: fromRows3 })
      .mockReturnValueOnce({ from: fromCount3 })
    const db = { select } as unknown as DatabaseClient

    await expect(
      getAuditSubjectHistory(db, {
        tenantId,
        subjectType: "user",
        subjectId: "sub-1",
      })
    ).resolves.toEqual(page)

    await expect(
      getAuditActorActivity(db, {
        tenantId,
        actorUserId: "018f1234-5678-7abc-8def-123456789abd",
      })
    ).resolves.toEqual(page)

    await expect(
      getAuditModuleActivity(db, {
        tenantId,
        targetModule: "finance",
      })
    ).resolves.toEqual(page)
  })
})
