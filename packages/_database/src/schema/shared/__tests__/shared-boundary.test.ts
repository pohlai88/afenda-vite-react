/**
 * Vitest: `shared-boundary.schema.ts` / `enums.schema.ts` — Zod + `pgEnum` parity (see module annotation envelopes).
 */
import { describe, expect, it } from "vitest"

import * as SharedEnums from "../enums.schema"
import {
  sharedGenericStatusSchema,
  sharedMetadataRecordSchema,
  sharedTenantIdSchema,
  sharedUuidSchema,
  zodFromPgEnum,
} from "../shared-boundary.schema"

function isPgEnum(
  value: unknown
): value is { enumName?: string; enumValues: readonly string[] } {
  return (
    typeof value === "function" &&
    value !== null &&
    "enumValues" in value &&
    Array.isArray((value as { enumValues: unknown }).enumValues)
  )
}

describe("shared column primitives", () => {
  const validUuid = "018f1234-5678-7abc-8def-123456789abc"

  it("validates UUID and tenant id", () => {
    expect(sharedUuidSchema.safeParse(validUuid).success).toBe(true)
    expect(sharedUuidSchema.safeParse("not-a-uuid").success).toBe(false)
    expect(sharedTenantIdSchema.safeParse(validUuid).success).toBe(true)
  })

  it("accepts metadata records", () => {
    expect(sharedMetadataRecordSchema.safeParse({ a: 1, b: "x" }).success).toBe(
      true
    )
    expect(sharedMetadataRecordSchema.safeParse("oops").success).toBe(false)
  })
})

describe("zodFromPgEnum", () => {
  it("rejects unknown labels", () => {
    expect(sharedGenericStatusSchema.safeParse("not_a_status").success).toBe(
      false
    )
  })

  it("accepts every value on every shared pgEnum", () => {
    for (const [name, exp] of Object.entries(SharedEnums)) {
      if (!isPgEnum(exp)) continue
      const schema = zodFromPgEnum(exp)
      for (const v of exp.enumValues) {
        expect.soft(
          schema.safeParse(v).success,
          `${name} should accept ${String(v)}`
        ).toBe(true)
      }
    }
  })
})
