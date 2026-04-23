import fs from "node:fs/promises"
import path from "node:path"

import type { AfendaConfig } from "../afenda-config.js"
import type { RepoGuardEvidenceReport } from "./repo-guard.js"

export type PromotionReadinessStatus = "pass" | "warn" | "fail"

export interface PromotionReadinessCheck {
  readonly key: string
  readonly title: string
  readonly status: PromotionReadinessStatus
  readonly message: string
  readonly evidence: readonly string[]
}

export interface PromotionReadinessReport {
  readonly status: PromotionReadinessStatus
  readonly generatedAt: string
  readonly domainId: "GOV-TRUTH-001"
  readonly scorecard: {
    readonly totalChecks: number
    readonly passCount: number
    readonly warnCount: number
    readonly failCount: number
    readonly readyForPromotion: boolean
  }
  readonly checks: readonly PromotionReadinessCheck[]
}

export async function evaluatePromotionReadiness(options: {
  readonly repoRoot: string
  readonly config: AfendaConfig
  readonly repoGuardReport: RepoGuardEvidenceReport
}): Promise<PromotionReadinessReport> {
  const generatedAt = new Date().toISOString()
  const checks: PromotionReadinessCheck[] = []

  checks.push(
    await evaluateArchitectureBindingCheck(options.repoRoot),
    evaluateGovernanceDomainPostureCheck(options.config),
    await evaluateMajorGuardrailCoverageCheck(options.repoRoot),
    await evaluateWaiverModelCheck(options.repoRoot, options.repoGuardReport),
    evaluateRepoGuardVerdictCheck(options.repoGuardReport),
    evaluateAdvisoryBacklogCheck(options.repoGuardReport),
    evaluateManualPromotionCriteriaCheck()
  )

  const passCount = checks.filter((check) => check.status === "pass").length
  const warnCount = checks.filter((check) => check.status === "warn").length
  const failCount = checks.filter((check) => check.status === "fail").length

  return {
    status: failCount > 0 ? "fail" : warnCount > 0 ? "warn" : "pass",
    generatedAt,
    domainId: "GOV-TRUTH-001",
    scorecard: {
      totalChecks: checks.length,
      passCount,
      warnCount,
      failCount,
      readyForPromotion: failCount === 0 && warnCount === 0,
    },
    checks,
  }
}

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

async function evaluateArchitectureBindingCheck(
  repoRoot: string
): Promise<PromotionReadinessCheck> {
  const requiredPaths = [
    "docs/architecture/adr/ADR-0008-repository-integrity-guard-architecture.md",
    "docs/architecture/atc/ATC-0005-repository-integrity-guard-baseline.md",
    "docs/architecture/governance/REPOSITORY_INTEGRITY_GUARD.md",
    "docs/architecture/governance/REPO_GUARDRAIL_TODO.md",
  ]
  const missing: string[] = []

  for (const relativePath of requiredPaths) {
    const exists = await fs
      .stat(path.join(repoRoot, relativePath))
      .then(() => true)
      .catch(() => false)
    if (!exists) {
      missing.push(relativePath)
    }
  }

  return {
    key: "architecture-binding",
    title: "Architecture binding",
    status: missing.length > 0 ? "fail" : "pass",
    message:
      missing.length > 0
        ? "Promotion cannot proceed while required ADR/ATC/doctrine surfaces are missing."
        : "ADR, ATC, doctrine, and roadmap surfaces are present.",
    evidence: missing.length > 0 ? missing : requiredPaths,
  }
}

function evaluateGovernanceDomainPostureCheck(
  config: AfendaConfig
): PromotionReadinessCheck {
  const domain = config.governance.domains.find(
    (item) => item.id === "GOV-TRUTH-001"
  )

  if (!domain) {
    return {
      key: "governance-domain-posture",
      title: "Governance domain posture",
      status: "fail",
      message: 'Configured governance domain "GOV-TRUTH-001" is missing.',
      evidence: [],
    }
  }

  const expected =
    domain.lifecycleStatus === "partial" &&
    domain.enforcementMaturity === "warned" &&
    domain.ciBehavior === "warn"

  return {
    key: "governance-domain-posture",
    title: "Governance domain posture",
    status: expected ? "pass" : "warn",
    message: expected
      ? "Promotion review is starting from the expected warn-first baseline."
      : "Governance domain posture no longer matches the expected warn-first pre-promotion state.",
    evidence: [
      `lifecycleStatus=${domain.lifecycleStatus}`,
      `enforcementMaturity=${domain.enforcementMaturity}`,
      `ciBehavior=${domain.ciBehavior}`,
    ],
  }
}

async function evaluateMajorGuardrailCoverageCheck(
  repoRoot: string
): Promise<PromotionReadinessCheck> {
  const requiredFiles = [
    "scripts/lib/placement-ownership-guard.ts",
    "scripts/lib/generated-artifact-authenticity-guard.ts",
    "scripts/lib/boundary-import-guard.ts",
    "scripts/lib/source-evidence-mismatch-guard.ts",
    "scripts/lib/duplicate-overlap-guard.ts",
    "scripts/lib/stronger-document-control-guard.ts",
    "scripts/lib/repo-guard-waivers.ts",
  ]
  const missing: string[] = []

  for (const relativePath of requiredFiles) {
    const exists = await fs
      .stat(path.join(repoRoot, relativePath))
      .then(() => true)
      .catch(() => false)
    if (!exists) {
      missing.push(relativePath)
    }
  }

  return {
    key: "major-guardrail-coverage",
    title: "Major guardrail coverage",
    status: missing.length > 0 ? "fail" : "pass",
    message:
      missing.length > 0
        ? "Promotion cannot proceed while major first-cut guardrail files are missing."
        : "All major roadmap guardrail slices are implemented as first-cut files.",
    evidence: missing.length > 0 ? missing : requiredFiles,
  }
}

async function evaluateWaiverModelCheck(
  repoRoot: string,
  repoGuardReport: RepoGuardEvidenceReport
): Promise<PromotionReadinessCheck> {
  const registryPath = repoGuardReport.waivers.registryPath
  const exists = await fs
    .stat(path.join(repoRoot, registryPath))
    .then(() => true)
    .catch(() => false)

  if (!exists) {
    return {
      key: "waiver-model",
      title: "Waiver model",
      status: "fail",
      message:
        "Promotion cannot proceed without the shared repo-guard waiver registry file.",
      evidence: [registryPath],
    }
  }

  if (
    !repoGuardReport.waivers.valid ||
    repoGuardReport.waivers.expiredWaiverCount > 0
  ) {
    return {
      key: "waiver-model",
      title: "Waiver model",
      status: "fail",
      message:
        "Promotion cannot proceed while the repo-guard waiver registry is invalid or expired.",
      evidence: [
        registryPath,
        `valid=${String(repoGuardReport.waivers.valid)}`,
        `expired=${String(repoGuardReport.waivers.expiredWaiverCount)}`,
      ],
    }
  }

  if (repoGuardReport.waivers.soonToExpireCount > 0) {
    return {
      key: "waiver-model",
      title: "Waiver model",
      status: "warn",
      message:
        "Waiver registry is valid, but one or more waivers are approaching expiry and should be reviewed before promotion.",
      evidence: [
        registryPath,
        `soonToExpire=${String(repoGuardReport.waivers.soonToExpireCount)}`,
      ],
    }
  }

  return {
    key: "waiver-model",
    title: "Waiver model",
    status: "pass",
    message:
      "Shared repo-guard waiver registry is present and currently valid.",
    evidence: [registryPath],
  }
}

function evaluateRepoGuardVerdictCheck(
  repoGuardReport: RepoGuardEvidenceReport
): PromotionReadinessCheck {
  return {
    key: "repo-guard-verdict",
    title: "Repo guard current verdict",
    status: repoGuardReport.status,
    message:
      repoGuardReport.status === "pass"
        ? "Latest repo-guard evidence is fully green."
        : repoGuardReport.status === "warn"
          ? "Latest repo-guard evidence still carries advisory drift that should be reviewed before promotion."
          : "Latest repo-guard evidence still contains blocking drift for promotion readiness.",
    evidence: [
      `status=${repoGuardReport.status}`,
      `warnCount=${String(repoGuardReport.summary.warnCount)}`,
      `failCount=${String(repoGuardReport.summary.failCount)}`,
    ],
  }
}

function evaluateAdvisoryBacklogCheck(
  repoGuardReport: RepoGuardEvidenceReport
): PromotionReadinessCheck {
  const advisoryCheck = repoGuardReport.checks.find(
    (check) => check.key === "stronger-document-control"
  )
  const advisoryCount =
    advisoryCheck?.findings.filter((finding) => !finding.waived).length ?? 0

  if (advisoryCount === 0) {
    return {
      key: "advisory-backlog",
      title: "Advisory backlog",
      status: "pass",
      message:
        "No active advisory backlog is visible in the current repo-guard evidence.",
      evidence: ["stronger-document-control=0"],
    }
  }

  return {
    key: "advisory-backlog",
    title: "Advisory backlog",
    status: "warn",
    message:
      "Advisory guardrails still report drift that should be reviewed before promotion.",
    evidence: [`stronger-document-control=${String(advisoryCount)}`],
  }
}

function evaluateManualPromotionCriteriaCheck(): PromotionReadinessCheck {
  return {
    key: "manual-promotion-criteria",
    title: "Manual promotion criteria",
    status: "warn",
    message:
      "False-positive rate, stable usage over a full cycle, and explicit promotion approval still require human review and cannot be proven statically.",
    evidence: [
      "full-cycle-stability=manual-review",
      "false-positive-rate=manual-review",
      "promotion-approval=manual-review",
    ],
  }
}
