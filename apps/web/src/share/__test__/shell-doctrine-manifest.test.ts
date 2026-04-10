/**
 * Regression snapshot for governed shell vocabulary lists (registry keys, slot ids, state keys).
 * Bump intentionally when doctrine changes; review diffs in CI.
 */
import { describe, expect, it } from "vitest"

import { serializeShellDoctrineManifest } from "@afenda/shadcn-ui/lib/constant/policy/shell/shell-doctrine-manifest"

describe("serializeShellDoctrineManifest", () => {
  it("matches snapshot for pretty JSON (vocabulary lists)", () => {
    expect(serializeShellDoctrineManifest(true)).toMatchSnapshot()
  })
})
