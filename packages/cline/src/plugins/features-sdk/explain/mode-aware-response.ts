import type { SyncPackVerifyResult } from "@afenda/features-sdk/sync-pack"
import { assertSafeGovernedCommand } from "../guards/safe-command-policy.js"
import { listAllowedToolsForMode } from "../mode/assert-tool-allowed.js"
import type {
  ClineOperatorMode,
  ModeAwareVerifyResponse,
} from "../mode/cline-mode-contract.js"
import { gradeVerifyConfidence } from "./confidence-grader.js"
import { recommendNextCommand } from "./next-command-recommender.js"

function summarizeVerdict(result: SyncPackVerifyResult): string {
  if (result.verdict === "fail") {
    return `Verify failed with ${result.errorCount} errors and ${result.warningCount} warnings.`
  }

  if (result.verdict === "warn") {
    return `Verify completed with warnings only (${result.warningCount} warnings).`
  }

  return "Verify passed with no findings."
}

function buildExplanation(
  mode: ClineOperatorMode,
  result: SyncPackVerifyResult
): string {
  const failedSteps = result.steps.filter((step) => step.status === "fail")
  const warnedSteps = result.steps.filter((step) => step.status === "warn")

  const failedSummary =
    failedSteps.length > 0
      ? `Failed steps: ${failedSteps.map((step) => step.name).join(", ")}.`
      : "No failed steps."
  const warningSummary =
    warnedSteps.length > 0
      ? `Warning steps: ${warnedSteps.map((step) => step.name).join(", ")}.`
      : "No warning steps."

  if (mode === "guided_operator") {
    return `${failedSummary} ${warningSummary} Guided Operator returns one exact next command, rejects unsafe remediation commands, and does not bypass Sync-Pack gates.`
  }

  return `${failedSummary} ${warningSummary} This response stays bound to Sync-Pack as the truth engine.`
}

export function createModeAwareVerifyResponse(
  mode: ClineOperatorMode,
  result: SyncPackVerifyResult
): ModeAwareVerifyResponse {
  const exactNextCommand = recommendNextCommand(mode, result)
  assertSafeGovernedCommand(exactNextCommand, `Mode ${mode} next command`)

  return {
    mode,
    confidence: gradeVerifyConfidence(result),
    summary: summarizeVerdict(result),
    explanation: buildExplanation(mode, result),
    exactNextCommand,
    allowedTools: listAllowedToolsForMode(mode),
    failedSteps: result.steps
      .filter((step) => step.status === "fail")
      .map((step) => step.name),
    warningSteps: result.steps
      .filter((step) => step.status === "warn")
      .map((step) => step.name),
    result,
  }
}
