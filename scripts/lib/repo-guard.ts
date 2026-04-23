import { spawnSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

import type {
  AfendaConfig,
  GovernanceDomainDefinition,
} from "../afenda-config.js"
import { workspaceRoot } from "../afenda-config.js"
import { evaluateAfendaWorkspaceGovernance } from "./afenda-workspace-governance.js"
import { evaluateDocumentationGovernance } from "./doc-governance.js"
import {
  evaluateFilesystemGovernance,
  loadFilesystemGovernanceConfig,
} from "./filesystem-governance.js"
import { generateFileSurvivalReport } from "./file-survival-governance.js"
import {
  type GovernanceCheckExecution,
  type GovernanceDomainReport,
  readRootPackageScripts,
  writeJsonFile,
} from "./governance-spine.js"
import { evaluateBoundaryImportFindings } from "./boundary-import-guard.js"
import { evaluateDuplicateOverlapFindings } from "./duplicate-overlap-guard.js"
import {
  evaluateGeneratedArtifactGovernance,
  loadGeneratedArtifactGovernanceConfig,
} from "./generated-artifact-governance.js"
import { evaluateGeneratedArtifactAuthenticityFindings } from "./generated-artifact-authenticity-guard.js"
import { evaluateNamingConvention } from "./naming-convention.js"
import {
  buildPlacementOwnershipScopes,
  evaluatePlacementOwnershipFindings,
} from "./placement-ownership-guard.js"
import {
  applyRepoGuardWaivers,
  buildRepoGuardWaiverCheckResult,
  evaluateRepoGuardWaiverRegistry,
  loadRepoGuardWaiverRegistry,
  type RepoGuardWaiverReport,
} from "./repo-guard-waivers.js"
import { validateReviewedSurvivalForRollout } from "./reviewed-survival-governance.js"
import { evaluateStrongerDocumentControlFindings } from "./stronger-document-control-guard.js"
import { evaluateSourceEvidenceMismatchFindings } from "./source-evidence-mismatch-guard.js"
import {
  evaluateStorageGovernance,
  loadStorageGovernanceConfig,
} from "./storage-governance.js"

import type { RepoGuardPolicy } from "../repo-integrity/repo-guard-policy.js"
import {
  buildRepoGuardCoverage as buildRepoGuardCoverageModel,
  buildRepoGuardReport as buildRepoGuardReportModel,
  formatRepoGuardHumanReport as formatRepoGuardHumanReportModel,
  formatRepoGuardMarkdownReport as formatRepoGuardMarkdownReportModel,
  type RepoGuardCheckResult,
  type RepoGuardCliResult,
  type RepoGuardCoverageDefinition,
  type RepoGuardFinding,
  type RepoGuardMode,
  type RepoGuardReport,
  type RepoGuardStatus,
  statusFromRepoGuardFindings,
} from "@afenda/governance-toolchain"

export type {
  RepoGuardCheckResult,
  RepoGuardCliResult,
  RepoGuardCoverageDefinition,
  RepoGuardFinding,
  RepoGuardMode,
  RepoGuardReport,
  RepoGuardStatus,
} from "@afenda/governance-toolchain"

export interface RepoGuardEvidenceReport extends RepoGuardReport {
  readonly governanceDomain: GovernanceDomainReport
}

export interface RepoGuardGitEntry {
  readonly code: string
  readonly path: string
  readonly previousPath?: string
  readonly untracked: boolean
  readonly modifiedTracked: boolean
}

const repoGuardCoverageCatalog = [
  {
    id: "FOUND-FILESYSTEM",
    title: "Filesystem governance",
    area: "foundation",
    owner: "governance-toolchain",
    baselineStatus: "implemented",
    enforcement: "blocking",
    checkKeys: ["filesystem-governance"],
    evidence: ["scripts/check-filesystem-governance.ts"],
    notes: "Existing governance surface aggregated by repo guard.",
  },
  {
    id: "FOUND-GENERATED-GOVERNANCE",
    title: "Generated artifact governance",
    area: "foundation",
    owner: "governance-toolchain",
    baselineStatus: "implemented",
    enforcement: "blocking",
    checkKeys: ["generated-artifact-governance"],
    evidence: ["scripts/check-generated-artifact-governance.ts"],
    notes: "Existing governance surface aggregated by repo guard.",
  },
  {
    id: "FOUND-STORAGE",
    title: "Storage governance",
    area: "foundation",
    owner: "governance-toolchain",
    baselineStatus: "implemented",
    enforcement: "blocking",
    checkKeys: ["storage-governance"],
    evidence: ["scripts/check-storage-governance.ts"],
    notes: "Existing governance surface aggregated by repo guard.",
  },
  {
    id: "FOUND-NAMING",
    title: "Naming convention",
    area: "foundation",
    owner: "governance-toolchain",
    baselineStatus: "implemented",
    enforcement: "blocking",
    checkKeys: ["naming-convention"],
    evidence: ["scripts/check-naming-convention.ts"],
    notes: "Existing governance surface aggregated by repo guard.",
  },
  {
    id: "FOUND-DOC-GOVERNANCE",
    title: "Documentation governance",
    area: "foundation",
    owner: "docs-policy",
    baselineStatus: "implemented",
    enforcement: "blocking",
    checkKeys: ["documentation-governance"],
    evidence: ["scripts/check-doc-governance.ts"],
    notes: "Existing governance surface aggregated by repo guard.",
  },
  {
    id: "FOUND-WORKSPACE-TOPOLOGY",
    title: "Workspace and package topology",
    area: "foundation",
    owner: "governance-toolchain",
    baselineStatus: "implemented",
    enforcement: "blocking",
    checkKeys: ["workspace-topology"],
    evidence: ["scripts/check-afenda-config.ts"],
    notes: "Existing workspace topology governance aggregated by repo guard.",
  },
  {
    id: "FOUND-FILE-SURVIVAL",
    title: "File survival and reviewed survival",
    area: "foundation",
    owner: "governance-toolchain",
    baselineStatus: "implemented",
    enforcement: "blocking",
    checkKeys: ["file-survival"],
    evidence: ["scripts/lib/file-survival-governance.ts"],
    notes: "Existing file survival governance aggregated by repo guard.",
  },
  {
    id: "FOUND-DIRTY-FILE-SCAN",
    title: "Dirty file scan",
    area: "foundation",
    owner: "governance-toolchain",
    baselineStatus: "implemented",
    enforcement: "warned",
    checkKeys: ["dirty-file-scan"],
    evidence: ["scripts/lib/repo-guard.ts"],
    notes: "Native repo-guard hygiene scan.",
  },
  {
    id: "FOUND-WORKTREE-LEGITIMACY",
    title: "Working tree legitimacy",
    area: "foundation",
    owner: "governance-toolchain",
    baselineStatus: "implemented",
    enforcement: "warned",
    checkKeys: ["working-tree-legitimacy"],
    evidence: ["scripts/lib/repo-guard.ts"],
    notes: "Native repo-guard worktree trust check.",
  },
  {
    id: "RG-STRUCT-001",
    title: "Placement and ownership",
    area: "guardrail",
    owner: "governance-toolchain",
    baselineStatus: "partial",
    enforcement: "warned",
    checkKeys: ["placement-ownership"],
    evidence: ["scripts/lib/placement-ownership-guard.ts"],
    notes:
      "Implemented as a first cut; broader repo-wide ownership families still need follow-through.",
  },
  {
    id: "RG-TRUTH-002",
    title: "Generated artifact authenticity",
    area: "guardrail",
    owner: "governance-toolchain",
    baselineStatus: "partial",
    enforcement: "warned",
    checkKeys: ["generated-artifact-authenticity"],
    evidence: ["scripts/lib/generated-artifact-authenticity-guard.ts"],
    notes:
      "Implemented as a first cut; wider provenance coverage still needs follow-through.",
  },
  {
    id: "RG-STRUCT-003",
    title: "Boundary and import regression",
    area: "guardrail",
    owner: "governance-toolchain",
    baselineStatus: "partial",
    enforcement: "warned",
    checkKeys: ["boundary-import-regression"],
    evidence: ["scripts/lib/boundary-import-guard.ts"],
    notes:
      "Implemented as a first cut; package export enforcement is active, but full public-surface policy is still incomplete.",
  },
  {
    id: "RG-TRUTH-004",
    title: "Source and evidence mismatch",
    area: "guardrail",
    owner: "governance-toolchain",
    baselineStatus: "partial",
    enforcement: "warned",
    checkKeys: ["source-evidence-mismatch"],
    evidence: ["scripts/lib/source-evidence-mismatch-guard.ts"],
    notes:
      "Implemented as a first cut; source-to-evidence coverage remains intentionally narrow and high-confidence.",
  },
  {
    id: "RG-HYGIENE-005",
    title: "Duplicate and overlap hygiene",
    area: "guardrail",
    owner: "governance-toolchain",
    baselineStatus: "partial",
    enforcement: "advisory",
    checkKeys: ["duplicate-overlap"],
    evidence: ["scripts/lib/duplicate-overlap-guard.ts"],
    notes:
      "Implemented as a first cut; semantic overlap detection still needs follow-through.",
  },
  {
    id: "RG-ADVISORY-006",
    title: "Advanced document control",
    area: "guardrail",
    owner: "docs-policy",
    baselineStatus: "partial",
    enforcement: "advisory",
    checkKeys: ["stronger-document-control"],
    evidence: ["scripts/lib/stronger-document-control-guard.ts"],
    notes:
      "Implemented as a first cut; deeper doctrine-network validation still needs follow-through.",
  },
] as const satisfies readonly RepoGuardCoverageDefinition[]

export async function runRepoGuard(options: {
  readonly config: AfendaConfig
  readonly policy: RepoGuardPolicy
  readonly mode: RepoGuardMode
  readonly repoRoot?: string
}): Promise<RepoGuardCliResult> {
  const repoRoot = options.repoRoot ?? workspaceRoot
  const rootPackageScripts = await readRootPackageScripts(repoRoot)
  const generatedAt = new Date().toISOString()
  const checks = await Promise.all([
    evaluateFilesystemCheck(),
    evaluateGeneratedArtifactCheck(),
    evaluateGeneratedArtifactAuthenticityCheck(repoRoot, options.policy),
    evaluateStorageCheck(),
    evaluateNamingCheck(repoRoot, rootPackageScripts),
    evaluateDocumentationCheck(repoRoot),
    evaluateWorkspaceTopologyCheck(options.config, repoRoot),
    evaluateFileSurvivalCheck(options.config, repoRoot),
    evaluatePlacementOwnershipCheck(options.config, repoRoot, options.policy),
    evaluateBoundaryImportCheck(repoRoot, options.policy),
    evaluateSourceEvidenceMismatchCheck(repoRoot, options.policy),
    evaluateDuplicateOverlapCheck(repoRoot, options.policy),
    evaluateStrongerDocumentControlCheck(repoRoot, options.policy),
    evaluateDirtyFilesCheck(repoRoot, options.policy),
    evaluateWorkingTreeLegitimacyCheck(repoRoot, options.policy, options.mode),
  ])
  const nativeCheckKeys = checks
    .filter((check) => check.source === "native")
    .map((check) => check.key)
  const waiverRegistry = await loadRepoGuardWaiverRegistry(
    repoRoot,
    options.policy.waiverRegistryPath
  )
  const waiverReport = evaluateRepoGuardWaiverRegistry({
    registry: waiverRegistry,
    registryPath: options.policy.waiverRegistryPath,
    knownCheckKeys: nativeCheckKeys,
    referenceDate: new Date(generatedAt),
    soonToExpireDays: options.policy.waiverSoonToExpireDays,
  })
  const waivedChecks = checks.map((check) =>
    applyRepoGuardWaivers(check, waiverReport.applicableWaivers, generatedAt)
  )
  const report = buildRepoGuardReport(
    [...waivedChecks, buildRepoGuardWaiverCheckResult(waiverReport)],
    options.mode,
    generatedAt,
    waiverReport
  )

  return {
    report,
    exitCode: options.mode === "ci" && report.status === "fail" ? 1 : 0,
    humanOutput: formatRepoGuardHumanReport(report),
  }
}

export async function writeRepoGuardEvidence(options: {
  readonly policy: RepoGuardPolicy
  readonly report: RepoGuardReport
  readonly domain: GovernanceDomainDefinition
  readonly repoRoot?: string
}): Promise<RepoGuardEvidenceReport> {
  const repoRoot = options.repoRoot ?? workspaceRoot
  const evidenceReport = buildRepoGuardEvidenceReport(
    options.domain,
    options.report
  )
  const markdown = formatRepoGuardMarkdownReport(options.report)

  await writeJsonFile(
    path.join(repoRoot, options.domain.evidencePath),
    evidenceReport
  )
  await fs.mkdir(
    path.dirname(path.join(repoRoot, options.policy.reportMarkdownPath)),
    { recursive: true }
  )
  await fs.writeFile(
    path.join(repoRoot, options.policy.reportMarkdownPath),
    `${markdown}\n`,
    "utf8"
  )

  return evidenceReport
}

export function formatRepoGuardHumanReport(report: RepoGuardReport): string {
  return formatRepoGuardHumanReportModel(report)
}

export function formatRepoGuardMarkdownReport(report: RepoGuardReport): string {
  return formatRepoGuardMarkdownReportModel(report)
}

export function buildRepoGuardReport(
  checks: readonly RepoGuardCheckResult[],
  mode: RepoGuardMode,
  generatedAt: string,
  waivers: RepoGuardWaiverReport
): RepoGuardReport {
  return buildRepoGuardReportModel({
    checks,
    mode,
    generatedAt,
    waivers,
    coverage: buildRepoGuardCoverage(checks),
    contractBinding: {
      adr: "ADR-0008",
      atc: "ATC-0005",
      status: "bound",
    },
  })
}

export function buildRepoGuardCoverage(
  checks: readonly RepoGuardCheckResult[]
): RepoGuardReport["coverage"] {
  return buildRepoGuardCoverageModel(repoGuardCoverageCatalog, checks)
}

export function buildRepoGuardEvidenceReport(
  domain: GovernanceDomainDefinition,
  report: RepoGuardReport
): RepoGuardEvidenceReport {
  const governanceReport = buildRepoGuardGovernanceDomainReport(domain, report)
  return {
    ...report,
    governanceDomain: governanceReport,
  }
}

export function buildRepoGuardGovernanceDomainReport(
  domain: GovernanceDomainDefinition,
  report: RepoGuardReport
): GovernanceDomainReport {
  const domainViolations =
    report.status === "pass"
      ? []
      : report.checks
          .filter((check) => check.status !== "pass")
          .flatMap((check) =>
            check.findings
              .filter((finding) => !finding.waived)
              .slice(0, 25)
              .map((finding) => ({
                checkId: `repo-guard:${check.key}`,
                severity:
                  finding.severity === "error"
                    ? "error"
                    : finding.severity === "warn"
                      ? "warn"
                      : "info",
                message: `${check.title}: ${finding.message}${finding.filePath ? ` (${finding.filePath})` : ""}`,
              }))
          )

  return {
    domainId: domain.id,
    title: domain.title,
    owner: domain.owner,
    generatedAt: report.generatedAt,
    lifecycleStatus: domain.lifecycleStatus,
    enforcementMaturity: domain.enforcementMaturity,
    defaultSeverity: domain.defaultSeverity,
    tier: domain.tier,
    ciBehavior: domain.ciBehavior,
    localConfig: domain.localConfig,
    checks: [
      {
        id: domain.checks[0]?.id ?? "repo-guard",
        command:
          domain.checks[0]?.command ?? "pnpm run script:check-repo-guard",
        scriptPath:
          domain.checks[0]?.scriptPath ?? "scripts/check-repo-guard.ts",
        status: report.status === "fail" ? "failed" : "passed",
        exitCode: report.status === "fail" ? 1 : 0,
        durationMs: 0,
      } satisfies GovernanceCheckExecution,
    ],
    violations: domainViolations,
    evidenceComplete: true,
    driftDetected: report.status !== "pass",
    ciOutcome:
      report.status === "fail"
        ? domain.ciBehavior === "block"
          ? "blocked"
          : "warned"
        : report.status === "warn"
          ? "warned"
          : "passed",
  }
}

export function evaluateDirtyFileCandidates(
  filePaths: readonly string[],
  policy: RepoGuardPolicy
): readonly RepoGuardFinding[] {
  const findings: RepoGuardFinding[] = []

  for (const filePath of filePaths) {
    if (isIgnoredByPolicy(filePath, policy)) {
      continue
    }

    const lowerPath = filePath.toLowerCase()
    const fileName = path.basename(lowerPath)
    const stem = fileName.replace(/\.[^.]+$/u, "")
    const stemParts = stem.split(/[-_.\s]+/u).filter(Boolean)
    const edgeTokens = new Set(
      [stemParts.at(0), stemParts.at(-1)].filter((value): value is string =>
        Boolean(value)
      )
    )

    if (
      policy.highConfidenceBackupPatterns.some((pattern) =>
        pattern.test(lowerPath)
      )
    ) {
      findings.push({
        severity: "error",
        ruleId: "DIRTY-FILE-001",
        filePath,
        message: "High-confidence backup or temp artifact detected.",
        suggestedFix:
          "Delete or rename the file to its canonical tracked form.",
      })
      continue
    }

    if (policy.warnStemTokens.some((token) => edgeTokens.has(token))) {
      findings.push({
        severity: "warn",
        ruleId: "DIRTY-FILE-002",
        filePath,
        message:
          "Suspicious filename token detected; this looks like temporary or duplicate content.",
        suggestedFix:
          "Rename to a canonical subject or remove the stray artifact.",
      })
    }
  }

  return findings
}

export function evaluateWorkingTreeFindings(
  entries: readonly RepoGuardGitEntry[],
  policy: RepoGuardPolicy,
  mode: RepoGuardMode
): readonly RepoGuardFinding[] {
  const findings: RepoGuardFinding[] = []

  for (const entry of entries) {
    if (policy.ignoredWorkingTreePaths.includes(entry.path)) {
      continue
    }

    if (entry.untracked) {
      const suspicious = evaluateDirtyFileCandidates([entry.path], policy)
      if (suspicious.length > 0) {
        findings.push(
          ...suspicious.map((finding) => ({
            ...finding,
            ruleId: "WORKTREE-001",
            message: `Suspicious untracked file detected. ${finding.message}`,
          }))
        )
      }
      continue
    }

    if (
      entry.modifiedTracked &&
      matchesAnyPathPattern(entry.path, policy.protectedGeneratedPaths)
    ) {
      findings.push({
        severity: "error",
        ruleId: "WORKTREE-002",
        filePath: entry.path,
        message: "Protected generated surface is modified in the working tree.",
        suggestedFix:
          "Regenerate the surface from its canonical source or restore it.",
      })
      continue
    }

    if (mode === "human" && entry.modifiedTracked) {
      findings.push({
        severity: "warn",
        ruleId: "WORKTREE-003",
        filePath: entry.path,
        message: "Tracked file is modified in the working tree.",
      })
    }
  }

  return findings
}

async function evaluateFilesystemCheck(): Promise<RepoGuardCheckResult> {
  const config = loadFilesystemGovernanceConfig()
  const evaluation = evaluateFilesystemGovernance(config)
  const findings = evaluation.violations.map<RepoGuardFinding>((violation) => ({
    severity: "error",
    ruleId: `FS:${violation.rule}`,
    filePath: violation.path,
    message: violation.message,
  }))

  return {
    key: "filesystem-governance",
    title: "Filesystem governance",
    status: statusFromRepoGuardFindings(findings),
    source: "adapter",
    findings,
  }
}

async function evaluateGeneratedArtifactCheck(): Promise<RepoGuardCheckResult> {
  const config = loadGeneratedArtifactGovernanceConfig()
  const evaluation = evaluateGeneratedArtifactGovernance(config)
  const findings = evaluation.violations.map<RepoGuardFinding>((violation) => ({
    severity: "error",
    ruleId: `GEN:${violation.rule}`,
    filePath: violation.path,
    message: violation.message,
  }))

  return {
    key: "generated-artifact-governance",
    title: "Generated artifact governance",
    status: statusFromRepoGuardFindings(findings),
    source: "adapter",
    findings,
  }
}

async function evaluateGeneratedArtifactAuthenticityCheck(
  repoRoot: string,
  policy: RepoGuardPolicy
): Promise<RepoGuardCheckResult> {
  const trackedFiles = listGitFiles(repoRoot, ["ls-files"])
  const findings = await evaluateGeneratedArtifactAuthenticityFindings({
    repoRoot,
    trackedFiles,
    policy: policy.generatedAuthenticity,
  })

  return {
    key: "generated-artifact-authenticity",
    title: "Generated artifact authenticity",
    status: statusFromRepoGuardFindings(findings),
    source: "native",
    findings,
  }
}

async function evaluateStorageCheck(): Promise<RepoGuardCheckResult> {
  const config = loadStorageGovernanceConfig()
  const evaluation = evaluateStorageGovernance(config)
  const findings = evaluation.violations.map<RepoGuardFinding>((violation) => ({
    severity: "error",
    ruleId: `STORAGE:${violation.rule}`,
    filePath: violation.path,
    message: violation.message,
  }))

  return {
    key: "storage-governance",
    title: "Storage governance",
    status: statusFromRepoGuardFindings(findings),
    source: "adapter",
    findings,
  }
}

async function evaluateNamingCheck(
  repoRoot: string,
  rootPackageScripts: Record<string, string>
): Promise<RepoGuardCheckResult> {
  const result = evaluateNamingConvention(repoRoot, rootPackageScripts)
  const findings = [
    ...result.errors.map<RepoGuardFinding>((issue) => ({
      severity: "error",
      ruleId: `NAME:${issue.rule}`,
      filePath: issue.path,
      message: issue.message,
    })),
    ...result.warnings.map<RepoGuardFinding>((issue) => ({
      severity: "warn",
      ruleId: `NAME:${issue.rule}`,
      filePath: issue.path,
      message: issue.message,
    })),
  ]

  return {
    key: "naming-convention",
    title: "Naming convention",
    status: statusFromRepoGuardFindings(findings),
    source: "adapter",
    findings,
  }
}

async function evaluateDocumentationCheck(
  repoRoot: string
): Promise<RepoGuardCheckResult> {
  const issues = await evaluateDocumentationGovernance(repoRoot)
  const findings = issues.map<RepoGuardFinding>((issue) => ({
    severity: "error",
    ruleId: `DOC:${issue.rule}`,
    filePath: issue.path,
    message: issue.message,
  }))

  return {
    key: "documentation-governance",
    title: "Documentation governance",
    status: statusFromRepoGuardFindings(findings),
    source: "adapter",
    findings,
  }
}

async function evaluateWorkspaceTopologyCheck(
  config: AfendaConfig,
  repoRoot: string
): Promise<RepoGuardCheckResult> {
  const issues = await evaluateAfendaWorkspaceGovernance(config, repoRoot)
  const findings = issues.map<RepoGuardFinding>((issue) => ({
    severity: "error",
    ruleId: `TOPO:${issue.rule}`,
    filePath: issue.path,
    message: issue.message,
  }))

  return {
    key: "workspace-topology",
    title: "Workspace and package topology",
    status: statusFromRepoGuardFindings(findings),
    source: "adapter",
    findings,
  }
}

async function evaluateFileSurvivalCheck(
  config: AfendaConfig,
  repoRoot: string
): Promise<RepoGuardCheckResult> {
  const findings: RepoGuardFinding[] = []

  for (const rollout of config.fileSurvival.rollouts) {
    const report = generateFileSurvivalReport(rollout, {
      repoRoot,
      typescriptConfigPath: path.join(
        repoRoot,
        "apps/web/config/tsconfig/app.json"
      ),
    })
    const reviewedAudit = validateReviewedSurvivalForRollout(rollout, {
      repoRoot,
    })

    for (const finding of report.findings) {
      findings.push({
        severity: finding.ciBlocking ? "error" : "warn",
        ruleId: `SURVIVAL:${finding.ruleId}`,
        filePath: finding.path,
        message: finding.reason,
        evidence: `${rollout.id}:${finding.category}/${finding.confidence}`,
        suggestedFix: `${finding.recommendedAction} (${finding.approvedRemediation.kind})`,
      })
    }

    for (const issue of reviewedAudit.issues) {
      findings.push({
        severity: "error",
        ruleId: `SURVIVAL:reviewed-survival:${issue.code}`,
        filePath: issue.path,
        message: issue.message,
        evidence: rollout.id,
      })
    }
  }

  return {
    key: "file-survival",
    title: "File survival and reviewed survival",
    status: statusFromRepoGuardFindings(findings),
    source: "adapter",
    findings,
  }
}

async function evaluateDirtyFilesCheck(
  repoRoot: string,
  policy: RepoGuardPolicy
): Promise<RepoGuardCheckResult> {
  const trackedFiles = listGitFiles(repoRoot, ["ls-files"])
  const untrackedFiles = listGitFiles(repoRoot, [
    "ls-files",
    "--others",
    "--exclude-standard",
  ])
  const findings = evaluateDirtyFileCandidates(
    [...trackedFiles, ...untrackedFiles],
    policy
  )

  return {
    key: "dirty-file-scan",
    title: "Dirty file scan",
    status: statusFromRepoGuardFindings(findings),
    source: "native",
    findings,
  }
}

async function evaluateBoundaryImportCheck(
  repoRoot: string,
  policy: RepoGuardPolicy
): Promise<RepoGuardCheckResult> {
  const trackedFiles = listGitFiles(repoRoot, ["ls-files"])
  const findings = await evaluateBoundaryImportFindings({
    repoRoot,
    filePaths: trackedFiles,
    policy: policy.boundaryImport,
  })

  return {
    key: "boundary-import-regression",
    title: "Boundary and import regression",
    status: statusFromRepoGuardFindings(findings),
    source: "native",
    findings,
  }
}

async function evaluateSourceEvidenceMismatchCheck(
  repoRoot: string,
  policy: RepoGuardPolicy
): Promise<RepoGuardCheckResult> {
  const entries = readGitStatusEntries(repoRoot)
  const findings = evaluateSourceEvidenceMismatchFindings({
    entries,
    policy: policy.sourceEvidenceMismatch,
  })

  return {
    key: "source-evidence-mismatch",
    title: "Source and evidence mismatch",
    status: statusFromRepoGuardFindings(findings),
    source: "native",
    findings,
  }
}

async function evaluateDuplicateOverlapCheck(
  repoRoot: string,
  policy: RepoGuardPolicy
): Promise<RepoGuardCheckResult> {
  const trackedFiles = listGitFiles(repoRoot, ["ls-files"])
  const findings = evaluateDuplicateOverlapFindings({
    filePaths: trackedFiles,
    policy: policy.duplicateOverlap,
  })

  return {
    key: "duplicate-overlap",
    title: "Duplicate and overlap hygiene",
    status: statusFromRepoGuardFindings(findings),
    source: "native",
    findings,
  }
}

async function evaluateStrongerDocumentControlCheck(
  repoRoot: string,
  policy: RepoGuardPolicy
): Promise<RepoGuardCheckResult> {
  const trackedFiles = listGitFiles(repoRoot, ["ls-files"])
  const findings = await evaluateStrongerDocumentControlFindings({
    repoRoot,
    filePaths: trackedFiles,
    policy: policy.strongerDocumentControl,
  })

  return {
    key: "stronger-document-control",
    title: "Stronger document control",
    status: statusFromRepoGuardFindings(findings),
    source: "native",
    findings,
  }
}

async function evaluatePlacementOwnershipCheck(
  config: AfendaConfig,
  repoRoot: string,
  policy: RepoGuardPolicy
): Promise<RepoGuardCheckResult> {
  const allScopes = buildPlacementOwnershipScopes(
    config,
    policy.placementOwnershipStaticScopes
  )
  const trackedFiles = listGitFiles(repoRoot, ["ls-files"])
  const findings = evaluatePlacementOwnershipFindings({
    filePaths: trackedFiles,
    scopes: allScopes,
    ignoredPathPatterns: [
      ...policy.machineNoiseExcludePatterns,
      ...policy.placementOwnershipIgnorePatterns,
    ],
  })

  return {
    key: "placement-ownership",
    title: "Placement and ownership",
    status: statusFromRepoGuardFindings(findings),
    source: "native",
    findings,
  }
}

async function evaluateWorkingTreeLegitimacyCheck(
  repoRoot: string,
  policy: RepoGuardPolicy,
  mode: RepoGuardMode
): Promise<RepoGuardCheckResult> {
  const entries = readGitStatusEntries(repoRoot)
  const findings = evaluateWorkingTreeFindings(entries, policy, mode)

  return {
    key: "working-tree-legitimacy",
    title: "Working tree legitimacy",
    status: statusFromRepoGuardFindings(findings),
    source: "native",
    findings,
  }
}

function listGitFiles(
  repoRoot: string,
  args: readonly string[]
): readonly string[] {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || `git ${args.join(" ")} failed`)
  }

  return result.stdout
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((value) => toPosixPath(value))
}

function readGitStatusEntries(repoRoot: string): readonly RepoGuardGitEntry[] {
  const result = spawnSync("git", ["status", "--porcelain=v1"], {
    cwd: repoRoot,
    encoding: "utf8",
    shell: false,
  })

  if (result.status !== 0) {
    throw new Error(result.stderr || "git status failed")
  }

  return result.stdout
    .split(/\r?\n/u)
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const code = line.slice(0, 2)
      const rawPath = line.slice(3)
      const pathPart = rawPath.includes(" -> ")
        ? (rawPath.split(" -> ").at(-1) ?? rawPath)
        : rawPath
      const normalizedPath = toPosixPath(pathPart.trim())

      return {
        code,
        path: normalizedPath,
        previousPath: rawPath.includes(" -> ")
          ? toPosixPath(rawPath.split(" -> ")[0]!.trim())
          : undefined,
        untracked: code === "??",
        modifiedTracked: code !== "??" && code !== "",
      } satisfies RepoGuardGitEntry
    })
}

function isIgnoredByPolicy(filePath: string, policy: RepoGuardPolicy): boolean {
  return (
    matchesAnyPathPattern(filePath, policy.machineNoiseExcludePatterns) ||
    matchesAnyPathPattern(filePath, policy.protectedGeneratedPaths)
  )
}

function matchesAnyPathPattern(
  filePath: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) => {
    if (pattern.endsWith("/**")) {
      const prefix = pattern.slice(0, -3)
      if (filePath === prefix || filePath.startsWith(`${prefix}/`)) {
        return true
      }
    }

    return path.matchesGlob(filePath, pattern)
  })
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/")
}
