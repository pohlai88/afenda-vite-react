import { describe, expect, it } from "vitest"

import {
  normalizeHiddenContextBarActionIds,
  parseShellContextBarPreferences,
  serializeShellContextBarPreferences,
  shellContextBarPreferencesSchemaVersion,
} from "../services/shell-context-bar-preferences"

describe("shell context bar preferences", () => {
  it("normalizes hidden action ids against available action ids", () => {
    expect(
      normalizeHiddenContextBarActionIds(["a", "x"], ["a", "b", "c"])
    ).toEqual(["a"])
  })

  it("parses valid payloads and ignores unknown ids", () => {
    const raw = JSON.stringify({
      version: 1,
      hiddenActionIds: ["refresh", "unknown"],
    })

    expect(parseShellContextBarPreferences(raw, ["refresh", "audit"])).toEqual([
      "refresh",
    ])
  })

  it("falls back safely for invalid JSON or missing fields", () => {
    expect(parseShellContextBarPreferences("{", ["refresh"])).toEqual([])
    expect(
      parseShellContextBarPreferences(JSON.stringify({ version: 1 }), [
        "refresh",
      ])
    ).toEqual([])
  })

  it("serializes with schema version for forward migration", () => {
    expect(
      JSON.parse(serializeShellContextBarPreferences(["refresh"]))
    ).toEqual({
      version: shellContextBarPreferencesSchemaVersion,
      hiddenActionIds: ["refresh"],
    })
  })
})
