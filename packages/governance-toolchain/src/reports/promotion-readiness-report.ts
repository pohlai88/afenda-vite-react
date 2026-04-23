import type {
  PromotionReadinessCheck,
  PromotionReadinessReport,
} from "../contracts/promotion-readiness.js"

export function buildPromotionReadinessReport(options: {
  readonly checks: readonly PromotionReadinessCheck[]
  readonly generatedAt: string
  readonly domainId?: PromotionReadinessReport["domainId"]
}): PromotionReadinessReport {
  const passCount = options.checks.filter(
    (check) => check.status === "pass"
  ).length
  const warnCount = options.checks.filter(
    (check) => check.status === "warn"
  ).length
  const failCount = options.checks.filter(
    (check) => check.status === "fail"
  ).length

  return {
    status: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
    generatedAt: options.generatedAt,
    domainId: options.domainId ?? "GOV-TRUTH-001",
    scorecard: {
      totalChecks: options.checks.length,
      passCount,
      warnCount,
      failCount,
      readyForPromotion: failCount === 0 && warnCount === 0,
    },
    checks: options.checks,
  }
}
