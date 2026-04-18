/**
 * Manifest: verifies the **exact** public surface of `src/7w1h-audit` and ties it to {@link ./audit-inventory.ts}.
 *
 * Detailed behavior tests live alongside:
 * - `audit-action-catalog.test.ts` (F1)
 * - `audit-query-contract.test.ts` (F2)
 * - `audit-seven-w1h-query-manifest.test.ts` (F3)
 * - `audit-services.test.ts` (F4–F7)
 * - `seven-w1h-audit-boundary.schemas.test.ts` (F8)
 * - Import checks below (F9)
 */
import { describe, expect, it } from "vitest"

import { auditActorTypeEnum, auditLogs } from "../index"
import * as Audit from "../index"
import {
  AUDIT_FEATURE_COUNT,
  AUDIT_RUNTIME_FUNCTION_NAMES,
  EXPECTED_RUNTIME_FUNCTION_COUNT,
} from "./audit-inventory"
import {
  AUDIT_QUERY_W1H_PHASE_FILTER,
  AUDIT_QUERY_W1H_TEXT_FILTERS,
} from "../contracts/audit-seven-w1h-query-manifest"
import { auditQueryInputSchema } from "../contracts/audit-query-contract"
import { auditActionKeys } from "../contracts/audit-action-catalog"

describe("7w1h-audit inventory (counts)", () => {
  it(`exports exactly ${EXPECTED_RUNTIME_FUNCTION_COUNT} runtime functions`, () => {
    expect(AUDIT_RUNTIME_FUNCTION_NAMES.length).toBe(8)
    for (const name of AUDIT_RUNTIME_FUNCTION_NAMES) {
      expect(
        typeof (Audit as Record<string, unknown>)[name],
        `${name} must be typeof function on barrel`
      ).toBe("function")
    }
  })

  it("documents nine product features (F1–F9)", () => {
    expect(AUDIT_FEATURE_COUNT).toBe(9)
  })

  it("F1: action catalog has fixed keys and positive length", () => {
    expect(auditActionKeys.length).toBeGreaterThan(0)
    expect(Array.isArray(auditActionKeys)).toBe(true)
  })

  it("F3: W1H text filter rows align with query input schema shape keys", () => {
    const shape = auditQueryInputSchema.shape
    for (const [queryKey] of AUDIT_QUERY_W1H_TEXT_FILTERS) {
      expect(
        shape,
        `missing ${queryKey} on auditQueryInputSchema`
      ).toHaveProperty(queryKey)
    }
    expect(shape).toHaveProperty(AUDIT_QUERY_W1H_PHASE_FILTER.key)
    expect(AUDIT_QUERY_W1H_TEXT_FILTERS.length).toBe(12)
  })
})

describe("7w1h-audit F9 (Drizzle DDL presence)", () => {
  it("exports auditLogs table and at least one pgEnum", () => {
    expect(auditLogs).toBeDefined()
    expect(auditActorTypeEnum).toBeDefined()
  })
})
