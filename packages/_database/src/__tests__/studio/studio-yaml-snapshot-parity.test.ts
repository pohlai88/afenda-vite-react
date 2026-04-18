import { describe, expect, it } from "vitest"

import { getBusinessGlossarySnapshot } from "../../studio/business-glossary"
import { getTruthGovernanceSnapshot } from "../../studio/truth-governance"

describe("Studio committed snapshots", () => {
  it("loads the glossary snapshot", () => {
    const snapshot = getBusinessGlossarySnapshot()

    expect(snapshot.document_kind).toBe("business_glossary_snapshot")
    expect(snapshot.package).toBe("@afenda/database")
  })

  it("loads the truth governance snapshot", () => {
    const snapshot = getTruthGovernanceSnapshot()

    expect(snapshot.document_kind).toBe("database_truth_governance_snapshot")
    expect(snapshot.package).toBe("@afenda/database")
  })
})
