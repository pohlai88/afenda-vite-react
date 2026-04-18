/**
 * Side-effect imports so Vitest coverage includes declarative modules (schema, relations, views).
 * Logic is exercised elsewhere; this file only loads the graph for coverage completeness.
 */
import { describe, expect, it } from "vitest"

describe("package module graph (coverage load)", () => {
  it("loads schema, relations, views, queries, migrations, 7w1h-audit, studio exports", async () => {
    const mods = await Promise.all([
      import("../schema/index"),
      import("../relations/relations.schema"),
      import("../views/index"),
      import("../queries/index"),
      import("../migrations/index"),
      import("../7w1h-audit/index"),
      import("../studio/index"),
    ])
    expect(mods.length).toBe(7)
  })
})
