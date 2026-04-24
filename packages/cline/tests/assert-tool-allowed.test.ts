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

  it("blocks tools that are not implemented in the phase-1 registry", () => {
    expect(() => assertToolAllowed("guided_operator", "report")).toThrowError(
      ClineToolAccessError
    )
  })

  it("returns the guided operator allowlist only for phase-1 tools", () => {
    expect(listAllowedToolsForMode("guided_operator")).toEqual([
      "quickstart",
      "verify",
      "check",
      "doctor",
    ])
  })

  it("rejects shell-chained commands from the safety policy", () => {
    expect(
      isSafeGovernedCommand("pnpm run feature-sync:check && echo nope")
    ).toBe(false)
  })
})
