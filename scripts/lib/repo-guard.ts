import { spawnSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

import type {
  AfendaConfig,
  GovernanceDomainDefinition,
} from "../config/afenda-config.js"
import { workspaceRoot } from "../config/afenda-config.js"
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
  evaluateDirtyFileCandidates,
  evaluateWorkingTreeFindings,
  formatRepoGuardHumanReport as formatRepoGuardHumanReportModel,
  formatRepoGuardMarkdownReport as formatRepoGuardMarkdownReportModel,
  repoGuardCoverageCatalog,
  type RepoGuardCheckResult,
  type RepoGuardCliResult,
  type RepoGuardDirtyFilePolicy,
  type RepoGuardFinding,
  type RepoGuardMode,
  type RepoGuardReport,
  type RepoGuardStatus,
  type RepoGuardWorkingTreePolicy,
  type RepoGuardWorktreeEntry,
  statusFromRepoGuardFindings,
} from "@afenda/governance-toolchain"

export type {
  RepoGuardCheckResult,
  RepoGuardCliResult,
  RepoGuardDirtyFilePolicy,
  RepoGuardFinding,
  RepoGuardMode,
  RepoGuardReport,
  RepoGuardStatus,
  RepoGuardWorkingTreePolicy,
  RepoGuardWorktreeEntry as RepoGuardGitEntry,
} from "@afenda/governance-toolchain"
export {
  evaluateDirtyFileCandidates,
  evaluateWorkingTreeFindings,
} from "@afenda/governance-toolchain"

export interface RepoGuardEvidenceReport extends RepoGuardReport {
  readonly governanceDomain: GovernanceDomainReport
}

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
          domain.checks[0]?.scriptPath ??
          "scripts/governance/check-repo-guard.ts",
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
    severity: issue.severity,
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

function readGitStatusEntries(
  repoRoot: string
): readonly RepoGuardWorktreeEntry[] {
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
      } satisfies RepoGuardWorktreeEntry
    })
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/")
}
