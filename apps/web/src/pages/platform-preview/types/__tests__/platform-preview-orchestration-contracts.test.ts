import { describe, expect, it } from "vitest"

import {
  truthCasesByChamber,
  truthChamberSeeds,
} from "../../data/platform-preview-truth-seed"
import {
  createTruthChamberViewModel,
  exposesForbiddenPublicKeys,
} from "../../services/platform-preview-orchestration-service"

describe("platform preview orchestration contracts", () => {
  it("defines exactly three cases per chamber and four rails per case", () => {
    for (const chamberId of Object.keys(truthCasesByChamber)) {
      const chamber =
        truthChamberSeeds[chamberId as keyof typeof truthChamberSeeds]

      expect(chamber.cases).toHaveLength(3)
      expect(truthCasesByChamber[chamber.chamberId]).toHaveLength(3)

      for (const entry of chamber.cases) {
        expect(entry.rails).toHaveLength(4)
      }
    }
  })

  it("builds deterministic public chamber models with no canonical leakage", () => {
    const first = createTruthChamberViewModel("controller")
    const second = createTruthChamberViewModel("controller")

    expect(first).toEqual(second)
    expect(exposesForbiddenPublicKeys(first)).toBe(false)
    expect(JSON.stringify(first)).not.toContain("finance_")
  })
})
