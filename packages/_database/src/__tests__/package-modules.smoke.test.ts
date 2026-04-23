/**
 * Side-effect imports so Vitest coverage includes declarative modules (schema, relations, views).
 * Logic is exercised elsewhere; this file only loads the graph for coverage completeness.
 */
import { describe, expect, it } from "vitest"

const packageModuleGraphLoaders = [
  () => import("../schema/index"),
  () => import("../relations/relations.schema"),
  () => import("../views/index"),
  () => import("../queries/index"),
  () => import("../migrations/index"),
  () => import("../7w1h-audit/index"),
  () => import("../studio/index"),
] as const

describe("package module graph (coverage load)", () => {
  it(
    "loads schema, relations, views, queries, migrations, 7w1h-audit, studio exports",
    { timeout: 30_000 },
    async () => {
      // Load the heavy declarative graph deterministically so this coverage
      // guard stays stable under aggregate Turbo/Vitest pressure.
      const mods = []
      for (const loadModule of packageModuleGraphLoaders) {
        mods.push(await loadModule())
      }
      expect(mods.length).toBe(packageModuleGraphLoaders.length)
    }
  )
})
