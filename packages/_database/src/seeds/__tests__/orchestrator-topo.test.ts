import { describe, expect, it } from "vitest"

import type { SeedModule } from "../contract"
import { topologicalSortModules } from "../orchestrator"

describe("topologicalSortModules", () => {
  it("orders tenant-fixture before bootstrap when independent", () => {
    const a: SeedModule = {
      key: "bootstrap-a",
      description: "b",
      stage: "bootstrap",
      safeInProduction: true,
      async run() {},
    }
    const b: SeedModule = {
      key: "tenant-b",
      description: "t",
      stage: "tenant-fixture",
      safeInProduction: false,
      async run() {},
    }
    const ordered = topologicalSortModules([a, b])
    expect(ordered.map((m) => m.key)).toEqual(["tenant-b", "bootstrap-a"])
  })

  it("respects dependsOn edges", () => {
    const first: SeedModule = {
      key: "first",
      description: "f",
      stage: "bootstrap",
      safeInProduction: true,
      async run() {},
    }
    const second: SeedModule = {
      key: "second",
      description: "s",
      stage: "bootstrap",
      safeInProduction: true,
      dependsOn: ["first"],
      async run() {},
    }
    const ordered = topologicalSortModules([second, first])
    expect(ordered.map((m) => m.key)).toEqual(["first", "second"])
  })
})
