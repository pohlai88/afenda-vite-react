import { describe, expect, it } from "vitest"

import { buildDomainModuleEntryCounts } from "../utils/db-studio-utils"

describe("buildDomainModuleEntryCounts", () => {
  it("matches server-side domain_module aggregation", () => {
    expect(
      buildDomainModuleEntryCounts([
        { domain_module: "a" },
        { domain_module: "a" },
        { domain_module: "b" },
      ])
    ).toEqual({ a: 2, b: 1 })
  })
})
