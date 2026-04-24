import { describe, expect, it } from "vitest"

import { createFindingRemediation } from "../../src/sync-pack/finding.js"
import {
  summarizeSyncPackVerifyResult,
  summarizeSyncPackVerifyStep,
  type SyncPackVerifyFinding,
} from "../../src/sync-pack/verify/index.js"

function createFinding(
  step: "release-check" | "check" | "doctor" | "validate",
  severity: "error" | "warning",
  code = `${step}-${severity}`
): SyncPackVerifyFinding {
  return {
    step,
    severity,
    code,
    message: `${step} ${severity}`,
    remediation:
      severity === "error"
        ? createFindingRemediation(`Fix ${step} ${severity}.`)
        : undefined,
  }
}

describe("Sync-Pack verify result orchestration", () => {
  it("returns pass when all steps are green", () => {
    const result = summarizeSyncPackVerifyResult([
      summarizeSyncPackVerifyStep("release-check", []),
      summarizeSyncPackVerifyStep("check", []),
      summarizeSyncPackVerifyStep("doctor", []),
      summarizeSyncPackVerifyStep("validate", []),
    ])

    expect(result.errorCount).toBe(0)
    expect(result.warningCount).toBe(0)
    expect(result.verdict).toBe("pass")
    expect(result.steps.map((step) => step.name)).toEqual([
      "release-check",
      "check",
      "doctor",
      "validate",
    ])
  })

  it("returns warn when only doctor warnings exist", () => {
    const result = summarizeSyncPackVerifyResult([
      summarizeSyncPackVerifyStep("release-check", []),
      summarizeSyncPackVerifyStep("check", []),
      summarizeSyncPackVerifyStep("doctor", [
        createFinding("doctor", "warning"),
      ]),
      summarizeSyncPackVerifyStep("validate", []),
    ])

    expect(result.errorCount).toBe(0)
    expect(result.warningCount).toBe(1)
    expect(result.verdict).toBe("warn")
    expect(result.steps[2]?.status).toBe("warn")
  })

  it("returns fail when any gate step has an error", () => {
    const result = summarizeSyncPackVerifyResult([
      summarizeSyncPackVerifyStep("release-check", [
        createFinding("release-check", "error"),
      ]),
      summarizeSyncPackVerifyStep("check", []),
      summarizeSyncPackVerifyStep("doctor", [
        createFinding("doctor", "warning"),
      ]),
      summarizeSyncPackVerifyStep("validate", []),
    ])

    expect(result.errorCount).toBe(1)
    expect(result.warningCount).toBe(1)
    expect(result.verdict).toBe("fail")
    expect(result.steps[0]?.status).toBe("fail")
  })

  it("preserves normalized remediation details in aggregated findings", () => {
    const result = summarizeSyncPackVerifyResult([
      summarizeSyncPackVerifyStep("release-check", [
        createFinding("release-check", "error", "missing-export-target"),
      ]),
      summarizeSyncPackVerifyStep("check", []),
      summarizeSyncPackVerifyStep("doctor", []),
      summarizeSyncPackVerifyStep("validate", []),
    ])

    expect(result.findings[0]).toMatchObject({
      step: "release-check",
      severity: "error",
      code: "missing-export-target",
      remediation: {
        action: "Fix release-check error.",
      },
    })
  })
})
