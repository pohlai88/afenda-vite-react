import type { SyncPackVerifyResult } from "@afenda/features-sdk/sync-pack"
import type { ClineConfidenceGrade } from "../mode/cline-mode-contract.js"

export function gradeVerifyConfidence(
  result: SyncPackVerifyResult
): ClineConfidenceGrade {
  if (result.errorCount > 0) {
    return "high"
  }

  if (result.warningCount > 0) {
    return "medium"
  }

  return "high"
}
