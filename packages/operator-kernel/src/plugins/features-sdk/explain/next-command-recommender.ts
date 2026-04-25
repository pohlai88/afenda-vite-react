import type { SyncPackVerifyResult } from "@afenda/features-sdk/sync-pack"
import { isSafeGovernedCommand } from "../guards/safe-command-policy.js"
import type { OperatorMode } from "../mode/operator-mode-contract.js"

const verifyStepCommandMap = {
  "release-check": "pnpm run feature-sync:release-check",
  check: "pnpm run feature-sync:check",
  doctor: "pnpm run feature-sync:doctor",
  validate: "pnpm run feature-sync:validate",
} as const

export function recommendNextCommand(
  mode: OperatorMode,
  result: SyncPackVerifyResult
): string {
  const failedStep = result.steps.find((step) => step.status === "fail")
  const firstErrorFinding =
    failedStep?.findings.find((finding) => finding.severity === "error") ??
    result.findings.find((finding) => finding.severity === "error")

  if (
    firstErrorFinding?.remediation?.command &&
    isSafeGovernedCommand(firstErrorFinding.remediation.command)
  ) {
    return firstErrorFinding.remediation.command
  }

  if (firstErrorFinding) {
    return verifyStepCommandMap[firstErrorFinding.step]
  }

  const warnedStep = result.steps.find((step) => step.status === "warn")
  const firstWarningFinding =
    warnedStep?.findings.find((finding) => finding.severity === "warning") ??
    result.findings.find((finding) => finding.severity === "warning")

  if (
    firstWarningFinding?.remediation?.command &&
    isSafeGovernedCommand(firstWarningFinding.remediation.command)
  ) {
    return firstWarningFinding.remediation.command
  }

  if (firstWarningFinding) {
    return verifyStepCommandMap[firstWarningFinding.step]
  }

  return mode === "guided_operator"
    ? "pnpm run feature-sync:verify"
    : "pnpm run feature-sync"
}
