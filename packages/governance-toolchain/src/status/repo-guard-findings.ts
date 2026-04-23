import type { RepoGuardFinding } from "../contracts/repo-guard.js"
import type { RepoGuardStatus } from "./status.js"

export function statusFromRepoGuardFindings(
  findings: readonly RepoGuardFinding[]
): RepoGuardStatus {
  const activeFindings = findings.filter((finding) => !finding.waived)
  if (activeFindings.some((finding) => finding.severity === "error")) {
    return "fail"
  }
  if (activeFindings.some((finding) => finding.severity === "warn")) {
    return "warn"
  }
  return "pass"
}
