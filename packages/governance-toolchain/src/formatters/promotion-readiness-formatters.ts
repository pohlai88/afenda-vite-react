import type { PromotionReadinessReport } from "../contracts/promotion-readiness.js"

export function formatPromotionReadinessHumanReport(
  report: PromotionReadinessReport
): string {
  const lines = [
    `Repository Guard Promotion Readiness: ${report.status.toUpperCase()}`,
    `Generated at: ${report.generatedAt}`,
    `Checks: ${String(report.scorecard.passCount)} pass, ${String(report.scorecard.warnCount)} warn, ${String(report.scorecard.failCount)} fail`,
    `Ready for promotion: ${report.scorecard.readyForPromotion ? "yes" : "no"}`,
    "",
  ]

  for (const check of report.checks) {
    lines.push(`- ${check.status.toUpperCase()} ${check.title}`)
    lines.push(`  - ${check.message}`)
  }

  return lines.join("\n")
}

export function formatPromotionReadinessMarkdownReport(
  report: PromotionReadinessReport
): string {
  const lines = [
    "# Repository guard promotion readiness review",
    "",
    `- Domain: \`${report.domainId}\``,
    `- Status: \`${report.status}\``,
    `- Generated at: ${report.generatedAt}`,
    `- Total checks: ${String(report.scorecard.totalChecks)}`,
    `- Pass: ${String(report.scorecard.passCount)}`,
    `- Warn: ${String(report.scorecard.warnCount)}`,
    `- Fail: ${String(report.scorecard.failCount)}`,
    `- Ready for promotion: ${report.scorecard.readyForPromotion ? "yes" : "no"}`,
    "",
    "## Checks",
    "",
  ]

  for (const check of report.checks) {
    lines.push(`### ${check.title}`, "")
    lines.push(`- Status: \`${check.status}\``)
    lines.push(`- Message: ${check.message}`)
    if (check.evidence.length > 0) {
      lines.push("- Evidence:")
      for (const item of check.evidence) {
        lines.push(`  - ${item}`)
      }
    }
    lines.push("")
  }

  return lines.join("\n")
}
