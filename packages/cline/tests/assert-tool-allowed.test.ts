import { describe, expect, it } from "vitest"

import { isSafeGovernedCommand } from "../src/plugins/features-sdk/guards/safe-command-policy.js"
import {
  ClineToolAccessError,
  assertToolAllowed,
  listAllowedToolsForMode,
} from "../src/plugins/features-sdk/mode/assert-tool-allowed.js"

describe("governed Cline tool gating", () => {
  it("allows guided operator to use verify", () => {
    expect(assertToolAllowed("guided_operator", "verify")).toMatchObject({
      name: "verify",
      command: "pnpm run feature-sync:verify",
    })
  })

  it("allows feature devops to use planning tools", () => {
    expect(assertToolAllowed("feature_devops", "report")).toMatchObject({
      name: "report",
      command: "pnpm run feature-sync:report",
    })
  })

  it("blocks tools outside the guided operator scope", () => {
    expect(() => assertToolAllowed("guided_operator", "report")).toThrowError(
      ClineToolAccessError
    )
  })

  it("allows architect commander to reach mutating scaffold execution", () => {
    expect(assertToolAllowed("architect_commander", "scaffold")).toMatchObject({
      name: "scaffold",
      mutating: true,
    })
  })

  it("returns the full guided operator allowlist", () => {
    expect(listAllowedToolsForMode("guided_operator")).toEqual([
      "quickstart",
      "release-check",
      "check",
      "doctor",
      "validate",
      "verify",
    ])
  })

  it("rejects shell-chained commands from the safety policy", () => {
    expect(
      isSafeGovernedCommand("pnpm run feature-sync:check && echo nope")
    ).toBe(false)
  })
})
