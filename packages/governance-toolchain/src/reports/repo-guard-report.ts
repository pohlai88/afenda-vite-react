import type {
  RepoGuardCheckResult,
  RepoGuardContractBinding,
  RepoGuardReport,
} from "../contracts/repo-guard.js"
import type { RepoGuardWaiverReport } from "../contracts/repo-guard-waivers.js"

export function buildRepoGuardReport(options: {
  readonly checks: readonly RepoGuardCheckResult[]
  readonly mode: RepoGuardReport["mode"]
  readonly generatedAt: string
  readonly waivers: RepoGuardWaiverReport
  readonly coverage: RepoGuardReport["coverage"]
  readonly contractBinding: RepoGuardContractBinding
}): RepoGuardReport {
  const passCount = options.checks.filter(
    (check) => check.status === "pass"
  ).length
  const warnCount = options.checks.filter(
    (check) => check.status === "warn"
  ).length
  const failCount = options.checks.filter(
    (check) => check.status === "fail"
  ).length
  const findingCount = options.checks.reduce(
    (count, check) =>
      count + check.findings.filter((finding) => !finding.waived).length,
    0
  )

  return {
    status: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
    mode: options.mode,
    generatedAt: options.generatedAt,
    contractBinding: options.contractBinding,
    waivers: options.waivers,
    checks: options.checks,
    coverage: options.coverage,
    summary: {
      passCount,
      warnCount,
      failCount,
      findingCount,
    },
  }
}
