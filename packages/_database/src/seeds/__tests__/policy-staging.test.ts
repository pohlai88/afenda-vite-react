import { describe, expect, it } from "vitest"

import { checkStageAllowedForEnvironment } from "../policy"

describe("seed policy — staging", () => {
  it("allows tenant-fixture in staging without production-fixture flag", () => {
    const err = checkStageAllowedForEnvironment(
      "tenant-fixture",
      "staging",
      { allowProductionFixtures: false }
    )
    expect(err).toBeUndefined()
  })
})
