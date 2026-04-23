import fs from "node:fs/promises"
import path from "node:path"

import {
  buildPromotionReadinessReport,
  formatPromotionReadinessHumanReport as formatPromotionReadinessHumanReportModel,
  formatPromotionReadinessMarkdownReport as formatPromotionReadinessMarkdownReportModel,
  promotionReadinessCheckCatalog,
  type PromotionReadinessCheck,
  type PromotionReadinessReport,
  type PromotionReadinessStatus,
} from "@afenda/governance-toolchain"

import type { AfendaConfig } from "../afenda-config.js"
import type { RepoGuardEvidenceReport } from "./repo-guard.js"

export type {
  PromotionReadinessCheck,
  PromotionReadinessReport,
  PromotionReadinessStatus,
} from "@afenda/governance-toolchain"

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
    evaluateCoverageModelCheck(options.repoGuardReport),
    await evaluateWaiverModelCheck(options.repoRoot, options.repoGuardReport),
    evaluateRepoGuardVerdictCheck(options.repoGuardReport),
    evaluateAdvisoryBacklogCheck(options.repoGuardReport),
    evaluateManualPromotionCriteriaCheck()
  )

  return buildPromotionReadinessReport({
    checks,
    generatedAt,
  })
}

export function formatPromotionReadinessHumanReport(
  report: PromotionReadinessReport
): string {
  return formatPromotionReadinessHumanReportModel(report)
}

export function formatPromotionReadinessMarkdownReport(
  report: PromotionReadinessReport
): string {
  return formatPromotionReadinessMarkdownReportModel(report)
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
    key: promotionReadinessCheckCatalog.architectureBinding.key,
    title: promotionReadinessCheckCatalog.architectureBinding.title,
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
      key: promotionReadinessCheckCatalog.governanceDomainPosture.key,
      title: promotionReadinessCheckCatalog.governanceDomainPosture.title,
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
    key: promotionReadinessCheckCatalog.governanceDomainPosture.key,
    title: promotionReadinessCheckCatalog.governanceDomainPosture.title,
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
    key: promotionReadinessCheckCatalog.majorGuardrailCoverage.key,
    title: promotionReadinessCheckCatalog.majorGuardrailCoverage.title,
    status: missing.length > 0 ? "fail" : "pass",
    message:
      missing.length > 0
        ? "Promotion cannot proceed while major first-cut guardrail files are missing."
        : "All major roadmap guardrail slices are implemented as first-cut files.",
    evidence: missing.length > 0 ? missing : requiredFiles,
  }
}

function evaluateCoverageModelCheck(
  repoGuardReport: RepoGuardEvidenceReport
): PromotionReadinessCheck {
  const { implementedCount, partialCount, missingCount } =
    repoGuardReport.coverage

  return {
    key: promotionReadinessCheckCatalog.coverageModel.key,
    title: promotionReadinessCheckCatalog.coverageModel.title,
    status: missingCount > 0 ? "warn" : "pass",
    message:
      missingCount > 0
        ? "Coverage reporting is present, but one or more planned repo-guard areas are still uncovered."
        : "Coverage reporting is present and every planned repo-guard area is classified as implemented or partial.",
    evidence: [
      `implemented=${String(implementedCount)}`,
      `partial=${String(partialCount)}`,
      `missing=${String(missingCount)}`,
    ],
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
      key: promotionReadinessCheckCatalog.waiverModel.key,
      title: promotionReadinessCheckCatalog.waiverModel.title,
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
      key: promotionReadinessCheckCatalog.waiverModel.key,
      title: promotionReadinessCheckCatalog.waiverModel.title,
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
      key: promotionReadinessCheckCatalog.waiverModel.key,
      title: promotionReadinessCheckCatalog.waiverModel.title,
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
    key: promotionReadinessCheckCatalog.waiverModel.key,
    title: promotionReadinessCheckCatalog.waiverModel.title,
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
    key: promotionReadinessCheckCatalog.repoGuardVerdict.key,
    title: promotionReadinessCheckCatalog.repoGuardVerdict.title,
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
      key: promotionReadinessCheckCatalog.advisoryBacklog.key,
      title: promotionReadinessCheckCatalog.advisoryBacklog.title,
      status: "pass",
      message:
        "No active advisory backlog is visible in the current repo-guard evidence.",
      evidence: ["stronger-document-control=0"],
    }
  }

  return {
    key: promotionReadinessCheckCatalog.advisoryBacklog.key,
    title: promotionReadinessCheckCatalog.advisoryBacklog.title,
    status: "warn",
    message:
      "Advisory guardrails still report drift that should be reviewed before promotion.",
    evidence: [`stronger-document-control=${String(advisoryCount)}`],
  }
}

function evaluateManualPromotionCriteriaCheck(): PromotionReadinessCheck {
  return {
    key: promotionReadinessCheckCatalog.manualPromotionCriteria.key,
    title: promotionReadinessCheckCatalog.manualPromotionCriteria.title,
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
