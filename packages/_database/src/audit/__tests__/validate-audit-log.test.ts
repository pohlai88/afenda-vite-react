import { describe, expect, it } from "vitest"

import type { NewAuditLog } from "../schema/audit-logs.schema"
import { validateAuditLog } from "../services/validate-audit-log"

function baseRow(
  overrides: Partial<NewAuditLog> & Pick<NewAuditLog, "action" | "subjectType">
): NewAuditLog {
  return {
    tenantId: "00000000-0000-4000-8000-000000000001",
    actorType: "person",
    riskLevel: "medium",
    outcome: "success",
    sourceChannel: "api",
    environment: "production",
    legalHold: false,
    ...overrides,
  } as NewAuditLog
}

describe("validateAuditLog", () => {
  it("rejects unknown doctrine refs", () => {
    expect(() =>
      validateAuditLog(
        baseRow({
          action: "invoice.created",
          actionCategory: "billing",
          subjectType: "invoice",
          doctrineRef: "doctrine.unknown",
        })
      )
    ).toThrow(/unknown doctrineRef/)
  })

  it("rejects UI events with unknown actor type", () => {
    expect(() =>
      validateAuditLog(
        baseRow({
          action: "invoice.created",
          actionCategory: "billing",
          subjectType: "invoice",
          actorType: "unknown",
          sourceChannel: "ui",
        })
      )
    ).toThrow(/actorType=unknown/)
  })

  it("accepts valid resolution refs when required", () => {
    const row = validateAuditLog(
      baseRow({
        action: "invoice.posted",
        actionCategory: "billing",
        riskLevel: "high",
        subjectType: "invoice",
        resolutionRef: "resolution.invoice.posting-approved",
      })
    )

    expect(row.resolutionRef).toBe("resolution.invoice.posting-approved")
  })

  it("rejects actions that require resolutionRef when resolutionRef is missing", () => {
    expect(() =>
      validateAuditLog(
        baseRow({
          action: "invoice.posted",
          actionCategory: "billing",
          riskLevel: "high",
          subjectType: "invoice",
        })
      )
    ).toThrow(/requires resolutionRef/)
  })

  it("rejects unknown resolutionRef when resolution is required", () => {
    expect(() =>
      validateAuditLog(
        baseRow({
          action: "invoice.posted",
          actionCategory: "billing",
          riskLevel: "high",
          subjectType: "invoice",
          resolutionRef: "resolution.not-in-catalog",
        })
      )
    ).toThrow(/unknown resolutionRef/)
  })

  it("rejects empty tenantId", () => {
    expect(() =>
      validateAuditLog(
        baseRow({
          action: "invoice.created",
          actionCategory: "billing",
          subjectType: "invoice",
          tenantId: "" as unknown as NewAuditLog["tenantId"],
        })
      )
    ).toThrow(/tenantId is required/)
  })

  it("rejects empty subjectType", () => {
    expect(() =>
      validateAuditLog(
        baseRow({
          action: "invoice.created",
          actionCategory: "billing",
          subjectType: "" as unknown as NewAuditLog["subjectType"],
        })
      )
    ).toThrow(/subjectType is required/)
  })
})
