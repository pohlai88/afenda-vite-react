import { describe, expect, it } from "vitest"

import type { AuditLog } from "../schema/audit-logs.schema"
import { buildAuditLog } from "../services/build-audit-log"
import { validateAuditLog } from "../services/validate-audit-log"
import { serializeAuditLog } from "../utils/serialize-audit-log"

describe("audit pipeline", () => {
  it("builds and validates a governed row with required resolution", () => {
    const row = buildAuditLog({
      tenantId: "00000000-0000-4000-8000-000000000001",
      action: "invoice.posted",
      actorType: "person",
      subjectType: "invoice",
      subjectId: "00000000-0000-4000-8000-000000000002",
      sourceChannel: "ui",
      resolutionRef: "resolution.invoice.posting-approved",
    })

    expect(row.actionCategory).toBe("billing")
    expect(row.riskLevel).toBe("high")
    expect(validateAuditLog(row)).toBe(row)
  })

  it("rejects UI actions without a known actor type", () => {
    expect(() =>
      buildAuditLog({
        tenantId: "00000000-0000-4000-8000-000000000001",
        action: "auth.login.succeeded",
        actorType: "unknown",
        subjectType: "session",
        subjectId: "x",
        sourceChannel: "ui",
      })
    ).toThrow(/actorType=unknown/)
  })

  it("builds shell.interaction.recorded for UI with system actor", () => {
    const row = buildAuditLog({
      tenantId: "00000000-0000-4000-8000-000000000001",
      action: "shell.interaction.recorded",
      actorType: "system",
      subjectType: "shell_interaction",
      subjectId: "shell_ix_1",
      sourceChannel: "ui",
      outcome: "success",
      metadata: {
        module: "apps/web",
        extra: { interactionPhase: "succeeded" },
      },
    })

    expect(row.actionCategory).toBe("shell-ui")
    expect(row.riskLevel).toBe("low")
  })

  it("serializes audit rows with ISO timestamps", () => {
    const row = {
      id: "00000000-0000-4000-8000-000000000099",
      tenantId: "00000000-0000-4000-8000-000000000001",
      action: "auth.login.succeeded",
      subjectType: "session",
      subjectId: "s1",
      recordedAt: new Date("2026-01-15T12:00:00.000Z"),
      occurredAt: new Date("2026-01-15T12:00:00.000Z"),
    } as unknown as AuditLog

    const json = serializeAuditLog(row)
    expect(json).toContain("2026-01-15T12:00:00.000Z")
  })
})
