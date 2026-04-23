import { describe, expect, it } from "vitest"

import { HARDENING_PATCH_FILENAMES } from "../../scripts/verify-hardening-patch-order"
import { verifyHardeningPatches } from "../../scripts/verify-hardening-patches"

describe("sql/hardening patch set", () => {
  it("matches scripts/verify-hardening-patch-order.ts (no missing or stray patch_*.sql)", () => {
    expect(() => verifyHardeningPatches()).not.toThrow()
  })

  it("documents why patch_c is not immediately after patch_b", () => {
    const iB = HARDENING_PATCH_FILENAMES.indexOf(
      "patch_b_parties_canonical_name_normalized.sql"
    )
    const iC = HARDENING_PATCH_FILENAMES.indexOf("patch_c_gin_trgm_indexes.sql")
    const iD = HARDENING_PATCH_FILENAMES.indexOf(
      "patch_d_partial_unique_indexes.sql"
    )
    expect(iB).toBeLessThan(iD)
    expect(iD).toBeLessThan(iC)
  })
})
