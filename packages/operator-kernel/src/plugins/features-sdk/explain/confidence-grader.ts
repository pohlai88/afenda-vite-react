import type { SyncPackVerifyResult } from "@afenda/features-sdk/sync-pack"
import type { OperatorConfidenceGrade } from "../mode/operator-mode-contract.js"

export function gradeVerifyConfidence(
  result: SyncPackVerifyResult
): OperatorConfidenceGrade {
  if (result.errorCount > 0) {
    return "high"
  }

  if (result.warningCount > 0) {
    return "medium"
  }

  return "high"
}
