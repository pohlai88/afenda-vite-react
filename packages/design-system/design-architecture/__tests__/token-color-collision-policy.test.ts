import { describe, expect, it } from "vitest"

import {
  evaluateColorTokenCollisions,
  evaluateThemeColorCollisions,
  groupTokensByIdenticalValue,
} from "../src/tokenization/token-color-collision-policy"
import { themeTokenSource } from "../src/tokenization/token-source"
import type { ColorTokenRecord } from "../src/tokenization/token-types"

describe("token-color-collision-policy", () => {
  it("flags chart vs status primitives sharing one value as errors", () => {
    const record = {
      ...minimalColorRecordBase(),
      "chart-1": "oklch(50% 0.2 264)",
      info: "oklch(50% 0.2 264)",
    } satisfies ColorTokenRecord

    const findings = evaluateColorTokenCollisions({
      record,
      mode: "light",
      layer: "primitive",
    })
    expect(findings.some((f) => f.severity === "error")).toBe(true)
    expect(findings.some((f) => f.kind === "chart-status-signal-same-value")).toBe(true)
  })

  it("allows primary/ring/sidebar brand parity without chart/status mix", () => {
    const v = "oklch(45% 0.2 264)"
    const record = {
      ...minimalColorRecordBase(),
      primary: v,
      ring: v,
      "sidebar-primary": v,
      "sidebar-ring": v,
      "chart-1": "oklch(62% 0.19 264)",
      info: "oklch(58% 0.18 252)",
      success: "oklch(62% 0.16 145)",
      warning: "oklch(78% 0.16 75)",
    } satisfies ColorTokenRecord

    const findings = evaluateColorTokenCollisions({
      record,
      mode: "light",
      layer: "primitive",
    })
    expect(findings.filter((f) => f.severity === "error")).toHaveLength(0)
  })

  it("warns when secondary, muted, and accent share one value", () => {
    const v = "oklch(96% 0.01 264)"
    const record = {
      ...minimalColorRecordBase(),
      secondary: v,
      muted: v,
      accent: v,
    } satisfies ColorTokenRecord

    const findings = evaluateColorTokenCollisions({
      record,
      mode: "light",
      layer: "primitive",
    })
    expect(
      findings.some(
        (f) => f.severity === "warn" && f.kind === "secondary-muted-accent-collapsed",
      ),
    ).toBe(true)
  })

  it("themeTokenSource has no collision policy errors (primitive + derived)", () => {
    const { colors } = themeTokenSource
    const all = evaluateThemeColorCollisions({
      primitive: colors.primitive,
      derived: colors.derived,
    })
    const errors = all.filter((f) => f.severity === "error")
    expect(errors).toEqual([])
  })

  it("themeTokenSource collision warnings only use documented kinds", () => {
    const { colors } = themeTokenSource
    const all = evaluateThemeColorCollisions({
      primitive: colors.primitive,
      derived: colors.derived,
    })
    const warns = all.filter((f) => f.severity === "warn")
    expect(
      warns.every((w) =>
        ["secondary-muted-accent-collapsed", "table-header-same-as-surface-disabled"].includes(
          w.kind,
        ),
      ),
    ).toBe(true)
  })

  it("groupTokensByIdenticalValue groups by exact string", () => {
    const record = themeTokenSource.colors.primitive.light
    const groups = groupTokensByIdenticalValue(record)
    expect(groups.get("oklch(100% 0 0)")?.sort()).toEqual(["card", "popover"].sort())
    expect(groups.get("oklch(98.8% 0.006 185)")?.sort()).toEqual(
      ["background", "ring-offset"].sort(),
    )
  })
})

/** Minimal stub: only keys referenced in tests above need real strings; use theme source for integration. */
function minimalColorRecordBase(): ColorTokenRecord {
  return themeTokenSource.colors.primitive.light
}
