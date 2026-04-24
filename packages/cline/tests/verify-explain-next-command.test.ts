import { describe, expect, it } from "vitest"

import { createFindingRemediation } from "../../features-sdk/src/sync-pack/finding.js"
import {
  summarizeSyncPackVerifyResult,
  summarizeSyncPackVerifyStep,
  type SyncPackVerifyFinding,
} from "../../features-sdk/src/sync-pack/verify/index.js"
import { createModeAwareVerifyResponse } from "../src/plugins/features-sdk/explain/mode-aware-response.js"

function createFinding(
  step: "release-check" | "check" | "doctor" | "validate",
  severity: "error" | "warning",
  options: {
    readonly command?: string
  } = {}
): SyncPackVerifyFinding {
  return {
    step,
    severity,
    code: `${step}-${severity}`,
    message: `${step} ${severity}`,
    remediation: createFindingRemediation(`Fix ${step} ${severity}.`, {
      command: options.command,
    }),
  }
}

describe("governed Cline verify explanation", () => {
  it("summarizes verify failures and returns one exact next command", () => {
    const result = summarizeSyncPackVerifyResult([
      summarizeSyncPackVerifyStep("release-check", [
        createFinding("release-check", "error", {
          command: "pnpm run feature-sync:release-check",
        }),
      ]),
      summarizeSyncPackVerifyStep("check", []),
      summarizeSyncPackVerifyStep("doctor", []),
      summarizeSyncPackVerifyStep("validate", []),
    ])

    const response = createModeAwareVerifyResponse("guided_operator", result)

    expect(response.summary).toContain("Verify failed")
    expect(response.failedSteps).toEqual(["release-check"])
    expect(response.exactNextCommand).toBe(
      "pnpm run feature-sync:release-check"
    )
    expect(response.explanation).toContain("one exact next command")
  })

  it("falls back to the verify loop when the workflow is already green", () => {
    const result = summarizeSyncPackVerifyResult([
      summarizeSyncPackVerifyStep("release-check", []),
      summarizeSyncPackVerifyStep("check", []),
      summarizeSyncPackVerifyStep("doctor", []),
      summarizeSyncPackVerifyStep("validate", []),
    ])

    const response = createModeAwareVerifyResponse("guided_operator", result)

    expect(response.summary).toBe("Verify passed with no findings.")
    expect(response.exactNextCommand).toBe("pnpm run feature-sync:verify")
    expect(response.warningSteps).toEqual([])
  })

  it("ignores unsafe remediation commands and falls back to the governed step command", () => {
    const result = summarizeSyncPackVerifyResult([
      summarizeSyncPackVerifyStep("check", [
        createFinding("check", "error", {
          command: "pnpm run feature-sync:check && rm -rf .",
        }),
      ]),
      summarizeSyncPackVerifyStep("release-check", []),
      summarizeSyncPackVerifyStep("doctor", []),
      summarizeSyncPackVerifyStep("validate", []),
    ])

    const response = createModeAwareVerifyResponse("guided_operator", result)

    expect(response.exactNextCommand).toBe("pnpm run feature-sync:check")
    expect(response.explanation).toContain(
      "rejects unsafe remediation commands"
    )
  })
})
