import type { RepoGuardReport } from "../contracts/repo-guard.js"

export function formatRepoGuardHumanReport(report: RepoGuardReport): string {
  const lines = [
    `Repository Integrity Guard: ${report.status.toUpperCase()}`,
    `Generated at: ${report.generatedAt}`,
    `Checks: ${String(report.summary.passCount)} pass, ${String(report.summary.warnCount)} warn, ${String(report.summary.failCount)} fail`,
    `Findings: ${String(report.summary.findingCount)}`,
    `Coverage: ${String(report.coverage.implementedCount)} implemented, ${String(report.coverage.partialCount)} partial, ${String(report.coverage.missingCount)} missing`,
    `Waivers: ${String(report.waivers.activeWaiverCount)} active, ${String(report.waivers.expiredWaiverCount)} expired, ${String(report.waivers.soonToExpireCount)} soon to expire`,
    "",
  ]

  for (const check of report.checks) {
    lines.push(`- ${check.status.toUpperCase()} ${check.title}`)
    for (const finding of check.findings.slice(0, 5)) {
      const suffix = finding.waived ? " (waived)" : ""
      lines.push(
        `  - [${finding.ruleId}] ${finding.message}${finding.filePath ? ` :: ${finding.filePath}` : ""}${suffix}`
      )
    }
  }

  return lines.join("\n")
}

export function formatRepoGuardMarkdownReport(report: RepoGuardReport): string {
  const lines = [
    "# Repository integrity guard",
    "",
    `- Status: \`${report.status}\``,
    `- Mode: \`${report.mode}\``,
    `- Contract binding: \`${report.contractBinding.adr}\` + \`${report.contractBinding.atc}\` (${report.contractBinding.status})`,
    `- Generated at: ${report.generatedAt}`,
    `- Waiver registry: \`${report.waivers.registryPath}\``,
    `- Waiver validity: \`${report.waivers.valid ? "valid" : "invalid"}\``,
    `- Active waivers: ${String(report.waivers.activeWaiverCount)}`,
    `- Expired waivers: ${String(report.waivers.expiredWaiverCount)}`,
    `- Soon to expire: ${String(report.waivers.soonToExpireCount)}`,
    `- Coverage implemented: ${String(report.coverage.implementedCount)}`,
    `- Coverage partial: ${String(report.coverage.partialCount)}`,
    `- Coverage missing: ${String(report.coverage.missingCount)}`,
    `- Pass: ${String(report.summary.passCount)}`,
    `- Warn: ${String(report.summary.warnCount)}`,
    `- Fail: ${String(report.summary.failCount)}`,
    `- Findings: ${String(report.summary.findingCount)}`,
    "",
    "## Coverage",
    "",
  ]

  for (const entry of report.coverage.entries) {
    lines.push(`### ${entry.title}`, "")
    lines.push(`- Coverage status: \`${entry.status}\``)
    lines.push(`- Area: \`${entry.area}\``)
    lines.push(`- Owner: \`${entry.owner}\``)
    lines.push(`- Enforcement: \`${entry.enforcement}\``)
    if (entry.checkKeys.length > 0) {
      lines.push(
        `- Check keys: ${entry.checkKeys.map((key) => `\`${key}\``).join(", ")}`
      )
    }
    if (entry.evidence.length > 0) {
      lines.push("- Evidence:")
      for (const evidence of entry.evidence) {
        lines.push(`  - \`${evidence}\``)
      }
    }
    lines.push(`- Notes: ${entry.notes}`, "")
  }

  lines.push("## Checks", "")

  for (const check of report.checks) {
    lines.push(`## ${check.title}`, "")
    lines.push(`- Status: \`${check.status}\``)
    lines.push(`- Source: \`${check.source}\``)

    if (check.findings.length === 0) {
      lines.push("- Findings: none", "")
      continue
    }

    lines.push("- Findings:")
    for (const finding of check.findings) {
      lines.push(
        `  - [${finding.severity}/${finding.ruleId}] ${finding.message}${finding.filePath ? ` (\`${finding.filePath}\`)` : ""}${finding.waived ? " [waived]" : ""}`
      )
      if (finding.suggestedFix) {
        lines.push(`    - Fix: ${finding.suggestedFix}`)
      }
      if (finding.evidence) {
        lines.push(`    - Evidence: ${finding.evidence}`)
      }
    }
    lines.push("")
  }

  return lines.join("\n")
}
