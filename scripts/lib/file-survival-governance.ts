import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import * as ts from "typescript"

import type {
  FileSurvivalClaimedRole,
  FileSurvivalRolloutDefinition,
} from "../afenda-config.js"
import {
  FILE_SURVIVAL_ROLE_PRECEDENCE,
  assert,
  toPosixPath,
  workspaceRoot,
} from "../afenda-config.js"

export type FileSurvivalEvidenceRole =
  | "direct-consumer:route-owner"
  | "direct-consumer:shared-component"
  | "direct-consumer:runtime-orchestrator"
  | "direct-consumer:registry"
  | "direct-consumer:page-local-composition"
  | "direct-consumer:editorial-content"
  | "pass-through-only"
  | "reachable-from-registry"
  | "reachable-from-router"
  | "reachable-from-layout-or-home-loader"
  | "reachable-from-route-owner"
  | "shared-multi-consumer"
  | "no-evidence"

export type FileSurvivalBasis =
  | "configured-runtime-owner"
  | "reachable-from-registry"
  | "reachable-from-router"
  | "reachable-from-layout-or-home-loader"
  | "page-local-child-of-route-owner"
  | "content-owned-by-page"
  | "shared-root-multi-consumer"
  | "reviewed-exception"

export type FileSurvivalFindingCategory =
  | "dead"
  | "wrapper"
  | "weak-boundary"
  | "shared-single-use"
  | "unknown-role-consumed"
  | "unknown-role-unconsumed"
  | "unknown-role-protected-scope"
  | "empty-folder"

export type FileSurvivalFindingConfidence = "high" | "medium" | "low"
export type FileSurvivalFindingSeverity = "advisory" | "warning" | "error"
export type FileSurvivalSourceTool = "file-survival-audit"
export type FileSurvivalReportTrust = "trusted" | "caution" | "degraded"
export type FileSurvivalRolloutStatus = "pass" | "review" | "blocked"

export type FileSurvivalRecommendedAction =
  | "delete"
  | "inline"
  | "move-local"
  | "merge-with-owner"
  | "keep-reviewed"
export type FileSurvivalOwnerSource = "config" | "fallback"

export interface FileSurvivalApprovedRemediation {
  readonly kind: FileSurvivalRecommendedAction
  readonly targetZone: string | null
  readonly autofixEligible: boolean
  readonly requiresHumanReview: boolean
}

export interface FileSurvivalFindingEvidence {
  readonly evidenceRole: readonly FileSurvivalEvidenceRole[]
  readonly survivalBasis: readonly FileSurvivalBasis[]
  readonly importerCount: number
  readonly importers: readonly string[]
  readonly notes?: readonly string[]
}

export interface FileSurvivalFinding {
  readonly category: FileSurvivalFindingCategory
  readonly confidence: FileSurvivalFindingConfidence
  readonly severity: FileSurvivalFindingSeverity
  readonly sourceTool: FileSurvivalSourceTool
  readonly ruleId: string
  readonly ruleName: string
  readonly path: string
  readonly slice: string
  readonly owner: string
  readonly ownerSource: FileSurvivalOwnerSource
  readonly protectedScopeIds: readonly string[]
  readonly inferredRole: FileSurvivalClaimedRole | "empty-folder"
  readonly whyIllegal: string
  readonly approvedRemediation: FileSurvivalApprovedRemediation
  readonly ciBlocking: boolean
  readonly evidenceRole: readonly FileSurvivalEvidenceRole[]
  readonly survivalBasis: readonly FileSurvivalBasis[]
  readonly importerCount: number
  readonly importers: readonly string[]
  readonly evidence: FileSurvivalFindingEvidence
  readonly reason: string
  readonly recommendedAction: FileSurvivalRecommendedAction
  readonly notes?: readonly string[]
}

export interface FileSurvivalScopeSummary {
  readonly root: string
  readonly sharedRoots: readonly string[]
  readonly runtimeOwners: readonly string[]
  readonly protectedScopes: readonly {
    readonly id: string
    readonly roots: readonly string[]
  }[]
  readonly ignoredBuckets: readonly string[]
}

export interface FileSurvivalResolverStats {
  readonly unresolvedImportCount: number
  readonly unresolvedImports: readonly {
    readonly importer: string
    readonly specifier: string
  }[]
  readonly ignoredAssetImportCount: number
  readonly ignoredAssetImports: readonly {
    readonly importer: string
    readonly specifier: string
  }[]
  readonly integrityStatus: "ok" | "warning" | "degraded"
  readonly warningThreshold: number
}

export interface FileSurvivalStats {
  readonly scannedFileCount: number
  readonly ignoredFileCount: number
  readonly scannedDirectoryCount: number
  readonly exceptionCount: number
  readonly findingCount: number
  readonly findingsByCategory: Readonly<
    Record<FileSurvivalFindingCategory, number>
  >
  readonly findingsByConfidence: Readonly<
    Record<FileSurvivalFindingConfidence, number>
  >
  readonly findingsBySeverity: Readonly<
    Record<FileSurvivalFindingSeverity, number>
  >
  readonly scannedFilesByRole: Readonly<Record<FileSurvivalClaimedRole, number>>
  readonly scannedFilesByOwnerSource: Readonly<
    Record<FileSurvivalOwnerSource, number>
  >
}

export interface FileSurvivalOwnerCoverage {
  readonly configOwnedCount: number
  readonly fallbackOwnedCount: number
  readonly fallbackOwnedPaths: readonly string[]
}

export interface FileSurvivalOwnerAccountabilityEntry {
  readonly owner: string
  readonly ownerSource: FileSurvivalOwnerSource
  readonly findingCount: number
  readonly blockingFindingCount: number
  readonly severityCounts: Readonly<Record<FileSurvivalFindingSeverity, number>>
  readonly topPaths: readonly string[]
}

export interface FileSurvivalRemediationMatrixEntry {
  readonly kind: FileSurvivalRecommendedAction
  readonly findingCount: number
  readonly blockingFindingCount: number
  readonly owners: readonly string[]
  readonly topPaths: readonly string[]
}

export interface FileSurvivalReport {
  readonly rolloutId: string
  readonly rolloutMode: FileSurvivalRolloutDefinition["blockingPolicy"]["rolloutMode"]
  readonly rolloutStatus: FileSurvivalRolloutStatus
  readonly reportTrust: FileSurvivalReportTrust
  readonly generatedAt: string
  readonly scope: FileSurvivalScopeSummary
  readonly stats: FileSurvivalStats
  readonly ownerCoverage: FileSurvivalOwnerCoverage
  readonly ownerAccountability: readonly FileSurvivalOwnerAccountabilityEntry[]
  readonly remediationMatrix: readonly FileSurvivalRemediationMatrixEntry[]
  readonly resolver: FileSurvivalResolverStats
  readonly reviewedExceptions: readonly string[]
  readonly findings: readonly FileSurvivalFinding[]
}

export interface GenerateFileSurvivalReportOptions {
  readonly repoRoot?: string
  readonly typescriptConfigPath?: string
  readonly generatedAt?: Date
}

type WrapperSubtype = "re-export-only" | "pass-through-only" | null

type InternalCandidateRole = FileSurvivalClaimedRole | "styling-asset" | "test"

interface FileAnalysis {
  readonly path: string
  readonly scopeRelativePath: string
  readonly sourceKind: "code" | "ignored"
  readonly claimedRole: FileSurvivalClaimedRole
  readonly slice: string
  readonly owner: string
  readonly ownerSource: FileSurvivalOwnerSource
  readonly protectedScopeIds: readonly string[]
  readonly candidateRoles: readonly InternalCandidateRole[]
  readonly directDependencies: readonly string[]
  readonly directImporters: readonly string[]
  readonly routeOwnerConsumers: readonly string[]
  readonly runtimeOwnerConsumers: readonly string[]
  readonly registryConsumers: readonly string[]
  readonly routerConsumers: readonly string[]
  readonly layoutOrHomeConsumers: readonly string[]
  readonly evidenceRole: readonly FileSurvivalEvidenceRole[]
  readonly survivalBasis: readonly FileSurvivalBasis[]
  readonly wrapperSubtype: WrapperSubtype
  readonly lineCount: number
  readonly topLevelStatementCount: number
  readonly significantStatementCount: number
  readonly exportedDeclarationCount: number
  readonly meaningfulBoundarySignals: readonly string[]
  readonly isVerySmall: boolean
  readonly isTrivialExportSurface: boolean
  readonly isReviewedException: boolean
  readonly notes: readonly string[]
}

interface ParsedModuleData {
  readonly directDependencies: readonly string[]
  readonly unresolvedInternalSpecifiers: readonly string[]
  readonly ignoredUnresolvedInternalSpecifiers: readonly string[]
  readonly wrapperSubtype: WrapperSubtype
  readonly lineCount: number
  readonly topLevelStatementCount: number
  readonly significantStatementCount: number
  readonly exportedDeclarationCount: number
  readonly meaningfulBoundarySignals: readonly string[]
}

interface ResolverContext {
  readonly compilerOptions: ts.CompilerOptions
  readonly moduleResolutionHost: ts.ModuleResolutionHost
}

const CATEGORY_ORDER: readonly FileSurvivalFindingCategory[] = [
  "dead",
  "wrapper",
  "weak-boundary",
  "shared-single-use",
  "unknown-role-protected-scope",
  "unknown-role-consumed",
  "unknown-role-unconsumed",
  "empty-folder",
]

const CONFIDENCE_ORDER: readonly FileSurvivalFindingConfidence[] = [
  "high",
  "medium",
  "low",
]

const SEVERITY_ORDER: readonly FileSurvivalFindingSeverity[] = [
  "error",
  "warning",
  "advisory",
]

const ROLE_ORDER = [...FILE_SURVIVAL_ROLE_PRECEDENCE]

const LOCAL_COMPOSITION_SIGNAL_PATTERN =
  /(section|hero|rail|panel|motion|layers|cta|footer|close)/i

const BOUNDARY_SIGNAL_PATTERN =
  /(provider|boundary|layout|loading|fallback|routes|registry|config|theme|shell)/i

export function generateFileSurvivalReport(
  rollout: FileSurvivalRolloutDefinition,
  options: GenerateFileSurvivalReportOptions = {}
): FileSurvivalReport {
  const repoRoot = options.repoRoot ?? workspaceRoot
  const generatedAt = (options.generatedAt ?? new Date()).toISOString()
  const scopeRootAbsolutePath = path.join(repoRoot, rollout.scopeRoot)
  const typescriptConfigPath =
    options.typescriptConfigPath ??
    path.join(repoRoot, "apps/web/config/tsconfig/app.json")
  const resolver = createResolverContext(typescriptConfigPath)

  const collected = collectScopeEntries({
    scopeRootAbsolutePath,
    ignorePatterns: rollout.ignore,
    repoRoot,
  })

  const relevantFiles = collected.files.filter((filePath) =>
    isGovernedSourceFile(filePath)
  )
  const relevantFilePathSet = new Set(relevantFiles)
  const sharedRootSet = new Set(rollout.sharedRoots.map(normalizeWorkspacePath))
  const runtimeOwnerSet = new Set(
    rollout.runtimeOwners.map((item) => normalizeWorkspacePath(item))
  )
  const reviewedExceptionSet = new Set(
    rollout.reviewedExceptions.map((item) => normalizeWorkspacePath(item))
  )

  const parsedModules = new Map<string, ParsedModuleData>()
  const unresolvedImports: Array<{ importer: string; specifier: string }> = []
  const ignoredAssetImports: Array<{ importer: string; specifier: string }> = []

  for (const filePath of relevantFiles) {
    const absoluteFilePath = path.join(repoRoot, filePath)
    const parsedModule = parseModule({
      absoluteFilePath,
      filePath,
      repoRoot,
      resolver,
      relevantFilePathSet,
      sharedRootSet,
    })
    parsedModules.set(filePath, parsedModule)

    for (const unresolvedSpecifier of parsedModule.unresolvedInternalSpecifiers) {
      unresolvedImports.push({
        importer: filePath,
        specifier: unresolvedSpecifier,
      })
    }
    for (const ignoredSpecifier of parsedModule.ignoredUnresolvedInternalSpecifiers) {
      ignoredAssetImports.push({
        importer: filePath,
        specifier: ignoredSpecifier,
      })
    }
  }

  const directImportersByFile = buildDirectImporters(parsedModules)
  const routeOwnerPaths = relevantFiles.filter(
    (filePath) =>
      claimedRoleForPath({
        filePath,
        scopeRootWorkspacePath: rollout.scopeRoot,
        sharedRootSet,
        runtimeOwnerSet,
        rolePatterns: rollout.rolePatterns,
        rolePrecedence: rollout.rolePrecedence,
      }).claimedRole === "route-owner"
  )
  const runtimeOwnerPaths = relevantFiles.filter((filePath) =>
    runtimeOwnerSet.has(filePath)
  )
  const registryPaths = runtimeOwnerPaths.filter((filePath) =>
    path.basename(filePath).includes("registry")
  )
  const routerPaths = runtimeOwnerPaths.filter((filePath) =>
    path.basename(filePath).includes("routes")
  )
  const layoutOrHomePaths = runtimeOwnerPaths.filter((filePath) =>
    /(layout|configured-home|random-home)/.test(path.basename(filePath))
  )

  const reachabilityFromRouteOwners = computeForwardReachability(
    routeOwnerPaths,
    parsedModules
  )
  const reachabilityFromRuntimeOwners = computeForwardReachability(
    runtimeOwnerPaths,
    parsedModules
  )
  const reachabilityFromRegistries = computeForwardReachability(
    registryPaths,
    parsedModules
  )
  const reachabilityFromRouters = computeForwardReachability(
    routerPaths,
    parsedModules
  )
  const reachabilityFromLayoutOrHome = computeForwardReachability(
    layoutOrHomePaths,
    parsedModules
  )

  const analyses = new Map<string, FileAnalysis>()
  const reportTrust = inferReportTrust(
    unresolvedImports.length,
    rollout.resolverUnresolvedWarningThreshold
  )

  for (const filePath of relevantFiles) {
    const claimedRoleData = claimedRoleForPath({
      filePath,
      scopeRootWorkspacePath: rollout.scopeRoot,
      sharedRootSet,
      runtimeOwnerSet,
      rolePatterns: rollout.rolePatterns,
      rolePrecedence: rollout.rolePrecedence,
    })
    const parsedModule = parsedModules.get(filePath)
    assert(parsedModule, `Missing parsed module for ${filePath}.`)

    const routeOwnerConsumers = sortStrings([
      ...(reachabilityFromRouteOwners.get(filePath) ?? new Set<string>()),
    ])
    const runtimeOwnerConsumers = sortStrings([
      ...(reachabilityFromRuntimeOwners.get(filePath) ?? new Set<string>()),
    ])
    const registryConsumers = sortStrings([
      ...(reachabilityFromRegistries.get(filePath) ?? new Set<string>()),
    ])
    const routerConsumers = sortStrings([
      ...(reachabilityFromRouters.get(filePath) ?? new Set<string>()),
    ])
    const layoutOrHomeConsumers = sortStrings([
      ...(reachabilityFromLayoutOrHome.get(filePath) ?? new Set<string>()),
    ])

    const directImporters = sortStrings([
      ...(directImportersByFile.get(filePath) ?? new Set<string>()),
    ])
    const slice = inferSlice(filePath)
    const protectedScopeIds = inferProtectedScopeIds(filePath, rollout)
    const ownerResolution = inferOwner({
      filePath,
      inferredRole: claimedRoleData.claimedRole,
      rollout,
    })

    const evidenceRole = inferEvidenceRoles({
      filePath,
      claimedRole: claimedRoleData.claimedRole,
      directImporters,
      routeOwnerConsumers,
      runtimeOwnerConsumers,
      registryConsumers,
      routerConsumers,
      layoutOrHomeConsumers,
      wrapperSubtype: parsedModule.wrapperSubtype,
      directImportersByClaimedRole: directImporters.map(
        (importerPath) =>
          claimedRoleForPath({
            filePath: importerPath,
            scopeRootWorkspacePath: rollout.scopeRoot,
            sharedRootSet,
            runtimeOwnerSet,
            rolePatterns: rollout.rolePatterns,
            rolePrecedence: rollout.rolePrecedence,
          }).claimedRole
      ),
    })

    const survivalBasis = inferSurvivalBasis({
      filePath,
      claimedRole: claimedRoleData.claimedRole,
      routeOwnerConsumers,
      registryConsumers,
      routerConsumers,
      layoutOrHomeConsumers,
      runtimeOwnerSet,
      sharedRootSet,
      routeOwnerConsumerCount: routeOwnerConsumers.length,
      reviewedExceptionSet,
    })

    analyses.set(filePath, {
      path: filePath,
      scopeRelativePath: toPosixPath(
        path.relative(rollout.scopeRoot, filePath)
      ),
      sourceKind: "code",
      claimedRole: claimedRoleData.claimedRole,
      slice,
      owner: ownerResolution.owner,
      ownerSource: ownerResolution.source,
      protectedScopeIds,
      candidateRoles: claimedRoleData.candidateRoles,
      directDependencies: parsedModule.directDependencies,
      directImporters,
      routeOwnerConsumers,
      runtimeOwnerConsumers,
      registryConsumers,
      routerConsumers,
      layoutOrHomeConsumers,
      evidenceRole,
      survivalBasis,
      wrapperSubtype: parsedModule.wrapperSubtype,
      lineCount: parsedModule.lineCount,
      topLevelStatementCount: parsedModule.topLevelStatementCount,
      significantStatementCount: parsedModule.significantStatementCount,
      exportedDeclarationCount: parsedModule.exportedDeclarationCount,
      meaningfulBoundarySignals: parsedModule.meaningfulBoundarySignals,
      isVerySmall:
        parsedModule.lineCount <= 20 &&
        parsedModule.significantStatementCount <= 3,
      isTrivialExportSurface:
        parsedModule.exportedDeclarationCount <= 1 &&
        parsedModule.significantStatementCount <= 2,
      isReviewedException: reviewedExceptionSet.has(filePath),
      notes: parsedModule.unresolvedInternalSpecifiers.map(
        (specifier) => `Unresolved internal import: ${specifier}`
      ),
    })
  }

  const findings = [
    ...collectFileFindings(analyses, {
      blockingPolicy: rollout.blockingPolicy,
      reportTrust,
    }),
    ...collectEmptyFolderFindings({
      allDirectories: collected.directories,
      allFiles: collected.files,
      ignorePatterns: rollout.ignore,
      repoRoot,
      scopeRoot: rollout.scopeRoot,
      rollout,
    }),
  ].sort(compareFindings)

  const stats = buildStats({
    analyses,
    findings,
    ignoredFileCount: collected.ignoredFiles.length,
    scannedDirectoryCount: collected.directories.length,
    reviewedExceptionCount: countMatchingReviewedExceptions(
      reviewedExceptionSet,
      relevantFilePathSet
    ),
  })
  const ownerCoverage = buildOwnerCoverage(analyses)
  const ownerAccountability = buildOwnerAccountability(findings)
  const remediationMatrix = buildRemediationMatrix(findings)

  const resolverStats: FileSurvivalResolverStats = {
    unresolvedImportCount: unresolvedImports.length,
    unresolvedImports: unresolvedImports.sort((left, right) => {
      const importerComparison = left.importer.localeCompare(right.importer)
      return importerComparison !== 0
        ? importerComparison
        : left.specifier.localeCompare(right.specifier)
    }),
    ignoredAssetImportCount: ignoredAssetImports.length,
    ignoredAssetImports: ignoredAssetImports.sort((left, right) => {
      const importerComparison = left.importer.localeCompare(right.importer)
      return importerComparison !== 0
        ? importerComparison
        : left.specifier.localeCompare(right.specifier)
    }),
    integrityStatus: inferResolverIntegrityStatus(reportTrust),
    warningThreshold: rollout.resolverUnresolvedWarningThreshold,
  }

  const rolloutStatus = inferRolloutStatus({
    findings,
    reportTrust,
  })

  return {
    rolloutId: rollout.id,
    rolloutMode: rollout.blockingPolicy.rolloutMode,
    rolloutStatus,
    reportTrust,
    generatedAt,
    scope: {
      root: normalizeWorkspacePath(rollout.scopeRoot),
      sharedRoots: sortStrings([...sharedRootSet]),
      runtimeOwners: sortStrings([...runtimeOwnerSet]),
      protectedScopes: rollout.protectedScopes.map((protectedScope) => ({
        id: protectedScope.id,
        roots: sortStrings(protectedScope.roots.map(normalizeWorkspacePath)),
      })),
      ignoredBuckets: [...rollout.ignore].sort((left, right) =>
        left.localeCompare(right)
      ),
    },
    stats,
    ownerCoverage,
    ownerAccountability,
    remediationMatrix,
    resolver: resolverStats,
    reviewedExceptions: sortStrings(
      [...reviewedExceptionSet].filter((item) => relevantFilePathSet.has(item))
    ),
    findings,
  }
}

export function renderFileSurvivalMarkdownReport(
  report: FileSurvivalReport
): string {
  const lines = [
    `# File Survival Governance Report — ${report.rolloutId}`,
    "",
    "## Scope",
    "",
    `- Root: \`${report.scope.root}\``,
    `- Shared roots: ${formatInlineCodeList(report.scope.sharedRoots)}`,
    `- Runtime owners: ${formatInlineCodeList(report.scope.runtimeOwners)}`,
    `- Protected scopes: ${report.scope.protectedScopes.length > 0 ? report.scope.protectedScopes.map((scope) => `\`${scope.id}\``).join(", ") : "none"}`,
    `- Ignored buckets: ${formatInlineCodeList(report.scope.ignoredBuckets)}`,
    "",
    "## Summary",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Rollout mode: ${report.rolloutMode}`,
    `- Rollout status: ${report.rolloutStatus}`,
    `- Report trust: ${report.reportTrust}`,
    `- Scanned files: ${String(report.stats.scannedFileCount)}`,
    `- Ignored files: ${String(report.stats.ignoredFileCount)}`,
    `- Scanned directories: ${String(report.stats.scannedDirectoryCount)}`,
    `- Findings: ${String(report.stats.findingCount)}`,
    `- Reviewed exceptions: ${String(report.stats.exceptionCount)}`,
    `- Owner truth coverage: ${String(report.ownerCoverage.configOwnedCount)} config-owned / ${String(report.ownerCoverage.fallbackOwnedCount)} fallback-owned`,
    `- Unresolved imports: ${String(report.resolver.unresolvedImportCount)}`,
    `- Ignored asset imports: ${String(report.resolver.ignoredAssetImportCount)}`,
    `- Resolver integrity: ${report.resolver.integrityStatus}`,
    "",
    "### By Category",
    "",
    ...CATEGORY_ORDER.map(
      (category) =>
        `- \`${category}\`: ${String(report.stats.findingsByCategory[category])}`
    ),
    "",
    "### By Confidence",
    "",
    ...CONFIDENCE_ORDER.map(
      (confidence) =>
        `- \`${confidence}\`: ${String(
          report.stats.findingsByConfidence[confidence]
        )}`
    ),
    "",
    "### By Severity",
    "",
    ...SEVERITY_ORDER.map(
      (severity) =>
        `- \`${severity}\`: ${String(report.stats.findingsBySeverity[severity])}`
    ),
    "",
    "### By Inferred Role",
    "",
    ...ROLE_ORDER.map(
      (role) =>
        `- \`${role}\`: ${String(report.stats.scannedFilesByRole[role])}`
    ),
    "",
    "### By Owner Source",
    "",
    `- \`config\`: ${String(report.stats.scannedFilesByOwnerSource.config)}`,
    `- \`fallback\`: ${String(report.stats.scannedFilesByOwnerSource.fallback)}`,
  ]

  if (report.reportTrust !== "trusted") {
    lines.push(
      "",
      "## Resolver Integrity Warning",
      "",
      report.reportTrust === "degraded"
        ? `- Unresolved import count ${String(report.resolver.unresolvedImportCount)} exceeded warning threshold ${String(report.resolver.warningThreshold)}.`
        : `- ${String(report.resolver.unresolvedImportCount)} unresolved imports were detected, but remain within warning threshold ${String(report.resolver.warningThreshold)}.`,
      `- Report trust is currently \`${report.reportTrust}\`.`,
      "- Findings may be incomplete until unresolved internal imports are fixed.",
      ""
    )
  }

  if (report.resolver.ignoredAssetImportCount > 0) {
    lines.push(
      "",
      "## Ignored Asset Imports",
      "",
      `- ${String(report.resolver.ignoredAssetImportCount)} ignored asset import(s) were excluded from resolver trust scoring.`,
      `- First ignored imports (${String(Math.min(report.resolver.ignoredAssetImports.length, 10))} shown):`
    )
    for (const ignoredImport of report.resolver.ignoredAssetImports.slice(
      0,
      10
    )) {
      lines.push(
        `  - \`${ignoredImport.importer}\` -> \`${ignoredImport.specifier}\``
      )
    }
  }

  lines.push(
    "",
    "## Release Control",
    "",
    `- Rollout status: \`${report.rolloutStatus}\``,
    `- Blocking findings: ${String(report.findings.filter((finding) => finding.ciBlocking).length)}`,
    `- Blocking owners: ${
      report.ownerAccountability
        .filter((entry) => entry.blockingFindingCount > 0)
        .map(
          (entry) =>
            `\`${entry.owner}\` (${String(entry.blockingFindingCount)})`
        )
        .join(", ") || "none"
    }`,
    "",
    "## High-confidence Delete Candidates",
    "",
    ...renderFindingList(
      report.findings.filter(
        (finding) =>
          finding.confidence === "high" &&
          (finding.category === "dead" || finding.category === "empty-folder")
      ),
      "- No current high-confidence delete candidates."
    ),
    "",
    "## Wrapper / Indirection Candidates",
    "",
    ...renderFindingList(
      report.findings.filter((finding) => finding.category === "wrapper"),
      "- No wrapper or indirection candidates."
    ),
    "",
    "## Shared-layer Demotion Candidates",
    "",
    ...renderFindingList(
      report.findings.filter(
        (finding) =>
          finding.category === "shared-single-use" ||
          finding.category === "weak-boundary"
      ),
      "- No shared-layer demotion candidates."
    ),
    "",
    "## Remediation Matrix",
    "",
    ...renderRemediationMatrix(report.remediationMatrix),
    "",
    "## Owner Accountability Queue",
    "",
    ...renderOwnerAccountabilityList(report.ownerAccountability),
    "",
    "## Unknown-role In Protected Scopes",
    "",
    ...renderFindingList(
      report.findings.filter(
        (finding) => finding.category === "unknown-role-protected-scope"
      ),
      "- No protected-scope unknown-role files."
    ),
    "",
    "## Unknown-role With Consumers",
    "",
    ...renderFindingList(
      report.findings.filter(
        (finding) => finding.category === "unknown-role-consumed"
      ),
      "- No actively consumed unknown-role files."
    ),
    "",
    "## Unknown-role Without Consumers",
    "",
    ...renderFindingList(
      report.findings.filter(
        (finding) => finding.category === "unknown-role-unconsumed"
      ),
      "- No unconsumed unknown-role files."
    ),
    "",
    "## Reviewed Exceptions",
    ""
  )

  if (report.reviewedExceptions.length === 0) {
    lines.push("- No reviewed exceptions matched this rollout.")
  } else {
    for (const reviewedException of report.reviewedExceptions) {
      lines.push(`- \`${reviewedException}\``)
    }
  }

  lines.push("", "## Appendix", "")

  if (report.ownerCoverage.fallbackOwnedPaths.length > 0) {
    lines.splice(
      lines.length - 2,
      0,
      "",
      "## Owner Fallback Queue",
      "",
      `- ${String(report.ownerCoverage.fallbackOwnedCount)} file(s) rely on heuristic owner fallback instead of config owner truth.`,
      ...report.ownerCoverage.fallbackOwnedPaths
        .slice(0, 15)
        .map((filePath) => `- \`${filePath}\``)
    )
  }

  if (report.resolver.unresolvedImports.length === 0) {
    lines.push("- Unresolved imports: none")
  } else {
    lines.push(
      `- First unresolved imports (${String(Math.min(report.resolver.unresolvedImports.length, 10))} shown):`
    )
    for (const unresolvedImport of report.resolver.unresolvedImports.slice(
      0,
      10
    )) {
      lines.push(
        `  - \`${unresolvedImport.importer}\` -> \`${unresolvedImport.specifier}\``
      )
    }
  }

  return `${lines.join("\n")}\n`
}

export function renderFileSurvivalHtmlPreview(
  report: FileSurvivalReport
): string {
  const serializedReport = JSON.stringify(report).replace(/</g, "\\u003c")

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Architecture Verdict Dashboard — ${escapeHtml(report.rolloutId)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f2ede3;
        --paper: #fffaf1;
        --panel: rgba(255, 250, 241, 0.84);
        --panel-strong: rgba(255, 248, 236, 0.98);
        --ink: #17211c;
        --muted: #57645c;
        --line: rgba(23, 33, 28, 0.12);
        --line-strong: rgba(23, 33, 28, 0.24);
        --accent: #0d7a52;
        --accent-soft: rgba(13, 122, 82, 0.1);
        --warning: #b26b00;
        --warning-soft: rgba(178, 107, 0, 0.11);
        --danger: #a53a22;
        --danger-soft: rgba(165, 58, 34, 0.11);
        --shadow: 0 18px 48px rgba(23, 33, 28, 0.08);
      }

      * { box-sizing: border-box; }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: "Segoe UI", "IBM Plex Sans", sans-serif;
        color: var(--ink);
        background:
          radial-gradient(circle at top left, rgba(13, 122, 82, 0.12), transparent 28%),
          radial-gradient(circle at top right, rgba(178, 107, 0, 0.12), transparent 25%),
          linear-gradient(180deg, #f7f1e6 0%, var(--bg) 100%);
      }

      .shell {
        width: min(1440px, calc(100vw - 32px));
        margin: 24px auto 40px;
      }

      .hero {
        position: relative;
        overflow: hidden;
        padding: 28px;
        border: 1px solid var(--line);
        border-radius: 28px;
        background: linear-gradient(135deg, rgba(255,255,255,0.82), rgba(255,249,239,0.94));
        box-shadow: var(--shadow);
      }

      .hero::after {
        content: "";
        position: absolute;
        inset: auto -6% -38% auto;
        width: 420px;
        height: 420px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(13,122,82,0.1), transparent 70%);
        pointer-events: none;
      }

      .eyebrow {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        border-radius: 999px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.7);
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      h1 {
        margin: 18px 0 10px;
        font-size: clamp(34px, 5vw, 58px);
        line-height: 0.96;
        letter-spacing: -0.05em;
        max-width: 11ch;
      }

      .hero-copy {
        max-width: 72ch;
        color: var(--muted);
        font-size: 15px;
        line-height: 1.6;
      }

      .hero-grid,
      .summary-grid,
      .board,
      .workspace {
        display: grid;
        gap: 16px;
      }

      .hero-grid {
        margin-top: 24px;
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }

      .summary-grid {
        margin-top: 20px;
        grid-template-columns: repeat(5, minmax(0, 1fr));
      }

      .board {
        margin-top: 20px;
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .workspace {
        margin-top: 22px;
        grid-template-columns: minmax(360px, 1.3fr) minmax(360px, 0.9fr);
        align-items: start;
      }

      .card,
      .lane,
      .panel {
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--panel);
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow);
      }

      .card,
      .panel {
        padding: 18px;
      }

      .card-label,
      .panel-label {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .card-value {
        margin-top: 12px;
        font-size: 42px;
        line-height: 1;
        letter-spacing: -0.06em;
      }

      .card-meta {
        margin-top: 8px;
        color: var(--muted);
        font-size: 13px;
      }

      .lane {
        padding: 18px;
      }

      .lane h2,
      .panel h2 {
        margin: 10px 0 16px;
        font-size: 18px;
        letter-spacing: -0.03em;
      }

      .lane-list,
      .finding-list,
      .meta-list {
        display: grid;
        gap: 10px;
      }

      .lane-item,
      .finding-item {
        border: 1px solid var(--line);
        border-radius: 18px;
        background: rgba(255,255,255,0.58);
      }

      .lane-item {
        padding: 12px 14px;
      }

      .lane-item strong {
        display: block;
        font-size: 13px;
      }

      .lane-item span {
        display: block;
        margin-top: 4px;
        color: var(--muted);
        font-size: 12px;
        line-height: 1.45;
      }

      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 18px 0 16px;
      }

      .chip {
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.72);
        color: var(--ink);
        border-radius: 999px;
        padding: 8px 12px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
      }

      .chip.active {
        background: var(--ink);
        color: #fffaf1;
        border-color: var(--ink);
      }

      .finding-item {
        display: block;
        width: 100%;
        text-align: left;
        padding: 16px;
        cursor: pointer;
        transition: transform 140ms ease, border-color 140ms ease, background 140ms ease;
      }

      .finding-item:hover,
      .finding-item:focus-visible,
      .finding-item.active {
        transform: translateY(-1px);
        border-color: var(--line-strong);
        background: rgba(255,255,255,0.9);
        outline: none;
      }

      .finding-head {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
      }

      .finding-path {
        font-size: 14px;
        line-height: 1.45;
        word-break: break-word;
      }

      .finding-reason {
        margin-top: 10px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.5;
      }

      .badge-row,
      .tag-row {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .badge,
      .tag {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.02em;
        border: 1px solid transparent;
      }

      .badge.wrapper,
      .tag.delete {
        background: var(--danger-soft);
        color: var(--danger);
        border-color: rgba(165,58,34,0.18);
      }

      .badge.weak-boundary,
      .tag.merge-with-owner {
        background: var(--warning-soft);
        color: var(--warning);
        border-color: rgba(178,107,0,0.18);
      }

      .badge.shared-single-use,
      .tag.move-local {
        background: rgba(69, 113, 217, 0.1);
        color: #27407d;
        border-color: rgba(39, 64, 125, 0.18);
      }

      .badge.dead,
      .badge.empty-folder {
        background: rgba(122, 14, 40, 0.1);
        color: #7a0e28;
        border-color: rgba(122, 14, 40, 0.18);
      }

      .badge.unknown-role-consumed,
      .badge.unknown-role-unconsumed,
      .badge.unknown-role-protected-scope,
      .tag.keep-reviewed {
        background: rgba(67, 50, 122, 0.1);
        color: #43327a;
        border-color: rgba(67, 50, 122, 0.18);
      }

      .badge.blocked,
      .tag.blocked {
        background: rgba(122, 14, 40, 0.12);
        color: #7a0e28;
        border-color: rgba(122, 14, 40, 0.18);
      }

      .badge.review,
      .tag.review,
      .badge.caution,
      .tag.caution {
        background: var(--warning-soft);
        color: var(--warning);
        border-color: rgba(178,107,0,0.18);
      }

      .badge.pass,
      .tag.pass,
      .badge.trusted,
      .tag.trusted {
        background: var(--accent-soft);
        color: var(--accent);
        border-color: rgba(13,122,82,0.18);
      }

      .badge.degraded,
      .tag.degraded {
        background: rgba(122, 14, 40, 0.12);
        color: #7a0e28;
        border-color: rgba(122, 14, 40, 0.18);
      }

      .badge.high { box-shadow: inset 0 0 0 1px rgba(165,58,34,0.22); }
      .badge.medium { box-shadow: inset 0 0 0 1px rgba(178,107,0,0.22); }
      .badge.low { box-shadow: inset 0 0 0 1px rgba(23,33,28,0.12); }
      .badge.error,
      .tag.error {
        background: rgba(122, 14, 40, 0.12);
        color: #7a0e28;
        border-color: rgba(122, 14, 40, 0.18);
      }
      .badge.warning,
      .tag.warning {
        background: var(--warning-soft);
        color: var(--warning);
        border-color: rgba(178,107,0,0.18);
      }
      .badge.advisory,
      .tag.advisory {
        background: var(--accent-soft);
        color: var(--accent);
        border-color: rgba(13,122,82,0.18);
      }

      .inline-code {
        font-family: Consolas, "SFMono-Regular", monospace;
        font-size: 12px;
      }

      .lineage {
        display: grid;
        gap: 14px;
      }

      .lineage-segment {
        position: relative;
        padding: 14px;
        border-radius: 18px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.66);
      }

      .lineage-segment:not(:last-child)::after {
        content: "";
        position: absolute;
        left: 26px;
        bottom: -14px;
        width: 2px;
        height: 14px;
        background: linear-gradient(180deg, rgba(23,33,28,0.25), transparent);
      }

      .segment-title {
        margin: 0 0 10px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
      }

      .segment-value {
        font-size: 14px;
        line-height: 1.55;
      }

      .list-reset {
        list-style: none;
        margin: 0;
        padding: 0;
      }

      .list-reset li + li {
        margin-top: 8px;
      }

      .note {
        margin-top: 14px;
        padding: 12px 14px;
        border-radius: 16px;
        border: 1px solid var(--line);
        background: rgba(255,255,255,0.56);
        color: var(--muted);
        font-size: 13px;
        line-height: 1.5;
      }

      .resolver-banner {
        margin-top: 18px;
        padding: 14px 16px;
        border-radius: 18px;
        border: 1px solid rgba(178,107,0,0.2);
        background: var(--warning-soft);
        color: #6e4700;
      }

      .resolver-banner strong {
        display: block;
        margin-bottom: 4px;
      }

      .empty-state {
        padding: 18px;
        border: 1px dashed var(--line-strong);
        border-radius: 18px;
        color: var(--muted);
        background: rgba(255,255,255,0.45);
      }

      @media (max-width: 1080px) {
        .hero-grid,
        .summary-grid,
        .board,
        .workspace {
          grid-template-columns: 1fr 1fr;
        }
      }

      @media (max-width: 760px) {
        .shell {
          width: min(100vw - 20px, 100%);
          margin-top: 12px;
        }

        .hero,
        .card,
        .lane,
        .panel {
          border-radius: 20px;
        }

        .hero-grid,
        .summary-grid,
        .board,
        .workspace {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main class="shell">
      <section class="hero">
        <div class="eyebrow">Governance Surface · Architecture Verdict</div>
        <div id="release-strip" class="toolbar" style="margin-top: 16px;"></div>
        <h1>Verdict first. Lineage second.</h1>
        <p class="hero-copy">
          This is a verdict dashboard for the last human guardrail. Each finding carries a law identifier,
          severity, owner, slice, approved path, and supporting lineage evidence. The graph is not the verdict.
          The graph is the proof behind the verdict.
        </p>
        <div class="hero-grid">
          <article class="card">
            <div class="card-label">Rollout</div>
            <div class="card-value" id="hero-rollout"></div>
            <div class="card-meta" id="hero-generated-at"></div>
          </article>
          <article class="card">
            <div class="card-label">Rollout Status</div>
            <div class="card-value" id="hero-status"></div>
            <div class="card-meta" id="hero-mode"></div>
          </article>
          <article class="card">
            <div class="card-label">Report Trust</div>
            <div class="card-value" id="hero-trust"></div>
            <div class="card-meta" id="hero-unresolved"></div>
          </article>
          <article class="card">
            <div class="card-label">Governance Findings</div>
            <div class="card-value" id="hero-findings"></div>
            <div class="card-meta" id="hero-scope"></div>
          </article>
        </div>
        <div id="resolver-banner" class="resolver-banner" hidden></div>
      </section>

      <section class="summary-grid" aria-label="summary">
        <article class="card">
          <div class="card-label">Blocking</div>
          <div class="card-value" id="summary-blocking"></div>
          <div class="card-meta">CI-blocking findings under current policy</div>
        </article>
        <article class="card">
          <div class="card-label">Warnings</div>
          <div class="card-value" id="summary-warning"></div>
          <div class="card-meta">Needs firm review before promotion</div>
        </article>
        <article class="card">
          <div class="card-label">Advisories</div>
          <div class="card-value" id="summary-advisory"></div>
          <div class="card-meta">Non-blocking architecture pressure</div>
        </article>
        <article class="card">
          <div class="card-label">Protected Scope Findings</div>
          <div class="card-value" id="summary-protected"></div>
          <div class="card-meta">Findings inside stricter ownership zones</div>
        </article>
        <article class="card">
          <div class="card-label">Owner Truth Coverage</div>
          <div class="card-value" id="summary-owner-truth"></div>
          <div class="card-meta">Config-owned files vs heuristic fallback</div>
        </article>
      </section>

      <section class="board" aria-label="guardrail board">
        <article class="lane">
          <div class="panel-label">Action First</div>
          <h2>Blocking queue</h2>
          <div id="lane-action" class="lane-list"></div>
        </article>
        <article class="lane">
          <div class="panel-label">Remediation Matrix</div>
          <h2>How to fix</h2>
          <div id="lane-weak" class="lane-list"></div>
        </article>
        <article class="lane">
          <div class="panel-label">Owner Accountability</div>
          <h2>Who must act</h2>
          <div class="meta-list">
            <div class="lane-item">
              <strong>Owner queue</strong>
              <span id="meta-owner-queue"></span>
            </div>
            <div class="lane-item">
              <strong>Current focus</strong>
              <span id="meta-owner-focus"></span>
            </div>
            <div class="lane-item">
              <strong>Shared roots</strong>
              <span id="meta-shared-roots"></span>
            </div>
            <div class="lane-item">
              <strong>Runtime owners</strong>
              <span id="meta-runtime-owners"></span>
            </div>
            <div class="lane-item">
              <strong>Ignored buckets</strong>
              <span id="meta-ignored"></span>
            </div>
            <div class="lane-item">
              <strong>Protected scopes</strong>
              <span id="meta-protected"></span>
            </div>
            <div class="lane-item">
              <strong>Fallback-owned files</strong>
              <span id="meta-owner-fallback"></span>
            </div>
          </div>
        </article>
      </section>

      <section class="workspace">
        <article class="panel">
          <div class="panel-label">Finding Queue</div>
          <h2>Triaged findings</h2>
          <div class="toolbar" id="action-toolbar"></div>
          <div class="toolbar" id="toolbar"></div>
          <div class="toolbar" id="owner-toolbar"></div>
          <div id="finding-list" class="finding-list"></div>
        </article>
        <aside class="panel">
          <div class="panel-label">Governance Verdict</div>
          <h2 id="detail-title">Select a finding</h2>
          <div id="detail-badges" class="badge-row"></div>
          <div id="detail-summary" class="meta-list" style="margin-top: 14px;"></div>
          <div id="detail-lineage" class="lineage"></div>
          <div id="detail-note" class="note" hidden></div>
        </aside>
      </section>
    </main>

    <script>
      const REPORT = ${serializedReport};
      const CATEGORY_ORDER = ["all", "wrapper", "dead", "weak-boundary", "shared-single-use", "unknown-role-protected-scope", "unknown-role-consumed", "unknown-role-unconsumed", "empty-folder"];
      const releaseStrip = document.getElementById("release-strip");
      const findingList = document.getElementById("finding-list");
      const actionToolbar = document.getElementById("action-toolbar");
      const toolbar = document.getElementById("toolbar");
      const ownerToolbar = document.getElementById("owner-toolbar");
      const detailTitle = document.getElementById("detail-title");
      const detailBadges = document.getElementById("detail-badges");
      const detailSummary = document.getElementById("detail-summary");
      const detailLineage = document.getElementById("detail-lineage");
      const detailNote = document.getElementById("detail-note");
      const activeState = { mode: "all", category: "all", owner: "all", selectedPath: REPORT.findings[0]?.path ?? null };

      hydrateHero();
      hydrateSummary();
      hydrateBoard();
      renderReleaseStrip();
      renderActionToolbar();
      renderToolbar();
      renderOwnerToolbar();
      renderFindingList();
      renderDetail(findSelectedFinding());

      function hydrateHero() {
        document.getElementById("hero-rollout").textContent = REPORT.rolloutId;
        document.getElementById("hero-generated-at").textContent = "Generated " + formatDate(REPORT.generatedAt);
        document.getElementById("hero-status").textContent = REPORT.rolloutStatus;
        document.getElementById("hero-mode").textContent = "Mode: " + REPORT.rolloutMode;
        document.getElementById("hero-trust").textContent = REPORT.reportTrust;
        document.getElementById("hero-unresolved").textContent =
          REPORT.resolver.unresolvedImportCount + " unresolved imports · " +
          REPORT.resolver.ignoredAssetImportCount + " ignored asset imports · " +
          REPORT.resolver.integrityStatus;
        document.getElementById("hero-findings").textContent = String(REPORT.stats.findingCount);
        document.getElementById("hero-scope").textContent =
          REPORT.scope.root + " · " + REPORT.stats.scannedFileCount + " files scanned";

        if (REPORT.reportTrust !== "trusted") {
          const banner = document.getElementById("resolver-banner");
          banner.hidden = false;
          const trustMessage = REPORT.reportTrust === "degraded"
            ? "Blocking is suppressed outside protected scopes until resolver trust recovers."
            : "Findings remain usable, but should be reviewed with resolver caution.";
          banner.innerHTML = "<strong>Resolver integrity warning</strong>" +
            escapeHtml(String(REPORT.resolver.unresolvedImportCount)) +
            " unresolved imports against threshold " +
            escapeHtml(String(REPORT.resolver.warningThreshold)) +
            ". " + escapeHtml(trustMessage);
        }
      }

      function hydrateSummary() {
        document.getElementById("summary-blocking").textContent = String(
          REPORT.findings.filter((finding) => finding.ciBlocking).length
        );
        document.getElementById("summary-warning").textContent = String(REPORT.stats.findingsBySeverity.warning);
        document.getElementById("summary-advisory").textContent = String(REPORT.stats.findingsBySeverity.advisory);
        document.getElementById("summary-protected").textContent = String(
          REPORT.findings.filter((finding) => finding.protectedScopeIds.length > 0).length
        );
        document.getElementById("summary-owner-truth").textContent =
          REPORT.ownerCoverage.configOwnedCount + " / " + REPORT.ownerCoverage.fallbackOwnedCount;
      }

      function hydrateBoard() {
        renderLane(
          document.getElementById("lane-action"),
          REPORT.findings.filter((finding) => finding.ciBlocking).slice(0, 4),
          "No CI-blocking findings in this rollout."
        );
        renderRemediationLane(
          document.getElementById("lane-weak"),
          REPORT.remediationMatrix.slice(0, 4),
          "No remediation pressure right now."
        );
        document.getElementById("meta-shared-roots").textContent = REPORT.scope.sharedRoots.join(" · ") || "none";
        document.getElementById("meta-runtime-owners").textContent = REPORT.scope.runtimeOwners.slice(0, 4).join(" · ") + (REPORT.scope.runtimeOwners.length > 4 ? " +" + (REPORT.scope.runtimeOwners.length - 4) : "");
        document.getElementById("meta-ignored").textContent = REPORT.scope.ignoredBuckets.join(" · ") || "none";
        document.getElementById("meta-protected").textContent =
          REPORT.scope.protectedScopes.map((scope) => scope.id).join(" · ") || "none";
        document.getElementById("meta-owner-queue").textContent =
          REPORT.ownerAccountability.length === 0
            ? "none"
            : REPORT.ownerAccountability.slice(0, 3).map((entry) =>
                entry.owner + " (" + entry.blockingFindingCount + "/" + entry.findingCount + ")"
              ).join(" · ");
        const activeOwnerEntry = getActiveOwnerAccountability();
        document.getElementById("meta-owner-focus").textContent =
          activeState.owner === "all"
            ? (activeState.mode === "blocking" ? "blocking-only · all owners" : "all owners")
            : (activeOwnerEntry
                ? activeOwnerEntry.owner + " · " + activeOwnerEntry.blockingFindingCount + "/" + activeOwnerEntry.findingCount
                : activeState.owner);
        document.getElementById("meta-owner-fallback").textContent =
          REPORT.ownerCoverage.fallbackOwnedCount === 0
            ? "none"
            : REPORT.ownerCoverage.fallbackOwnedCount + " file(s)";
      }

      function renderLane(target, findings, emptyMessage) {
        if (findings.length === 0) {
          target.innerHTML = '<div class="empty-state">' + escapeHtml(emptyMessage) + '</div>';
          return;
        }

        target.innerHTML = findings.map((finding) =>
          '<div class="lane-item">' +
            '<strong>' + escapeHtml(finding.ruleId + " · " + finding.path) + '</strong>' +
            '<span>' + escapeHtml(finding.ruleName + ". " + finding.whyIllegal) + '</span>' +
          '</div>'
        ).join("");
      }

      function renderRemediationLane(target, entries, emptyMessage) {
        if (entries.length === 0) {
          target.innerHTML = '<div class="empty-state">' + escapeHtml(emptyMessage) + '</div>';
          return;
        }

        target.innerHTML = entries.map((entry) =>
          '<div class="lane-item">' +
            '<strong>' + escapeHtml(entry.kind + " · " + entry.blockingFindingCount + "/" + entry.findingCount) + '</strong>' +
            '<span>' + escapeHtml("Owners: " + entry.owners.join(", ")) + '</span>' +
          '</div>'
        ).join("");
      }

      function renderReleaseStrip() {
        const blockingOwners = REPORT.ownerAccountability.filter((entry) => entry.blockingFindingCount > 0);
        const items = [
          { label: "status", value: REPORT.rolloutStatus },
          { label: "blocking", value: String(REPORT.findings.filter((finding) => finding.ciBlocking).length) },
          { label: "owners", value: blockingOwners.length === 0 ? "none" : blockingOwners.map((entry) => entry.owner).join(" · ") },
        ];

        releaseStrip.innerHTML = items.map((item) =>
          '<span class="chip active">' + escapeHtml(item.label + ": " + item.value) + '</span>'
        ).join("");
      }

      function renderActionToolbar() {
        const entries = [
          { mode: "all", label: "all findings", count: getModeCount("all") },
          { mode: "blocking", label: "blocking only", count: getModeCount("blocking") },
        ];

        actionToolbar.innerHTML = entries.map((entry) =>
          '<button class="chip' + (activeState.mode === entry.mode ? " active" : "") + '" data-mode="' + entry.mode + '">' +
            escapeHtml(entry.label) + " · " + escapeHtml(String(entry.count)) +
          "</button>"
        ).join("");

        actionToolbar.querySelectorAll("[data-mode]").forEach((button) => {
          button.addEventListener("click", () => {
            activeState.mode = button.getAttribute("data-mode");
            const visibleFindings = getVisibleFindings();
            if (!visibleFindings.some((finding) => finding.path === activeState.selectedPath)) {
              activeState.selectedPath = visibleFindings[0]?.path ?? null;
            }
            hydrateBoard();
            renderActionToolbar();
            renderToolbar();
            renderOwnerToolbar();
            renderFindingList();
            renderDetail(findSelectedFinding());
          });
        });
      }

      function renderToolbar() {
        toolbar.innerHTML = CATEGORY_ORDER.map((category) => {
          const count = category === "all"
            ? getOwnerAndModeFilteredFindings().length
            : getOwnerAndModeFilteredFindings().filter((finding) => finding.category === category).length;

          return '<button class="chip' + (activeState.category === category ? " active" : "") + '" data-category="' + category + '">' +
            escapeHtml(category) + " · " + escapeHtml(String(count)) +
          "</button>";
        }).join("");

        toolbar.querySelectorAll("[data-category]").forEach((button) => {
          button.addEventListener("click", () => {
            activeState.category = button.getAttribute("data-category");
            const visibleFindings = getVisibleFindings();
            if (!visibleFindings.some((finding) => finding.path === activeState.selectedPath)) {
              activeState.selectedPath = visibleFindings[0]?.path ?? null;
            }
            hydrateBoard();
            renderActionToolbar();
            renderToolbar();
            renderOwnerToolbar();
            renderFindingList();
            renderDetail(findSelectedFinding());
          });
        });
      }

      function renderOwnerToolbar() {
        const entries = [{ owner: "all", findingCount: REPORT.findings.length, blockingFindingCount: REPORT.findings.filter((finding) => finding.ciBlocking).length }]
          .concat(REPORT.ownerAccountability);

        ownerToolbar.innerHTML = entries.map((entry) => {
          const owner = entry.owner;
          const label = owner === "all"
            ? "all owners"
            : owner;
          const count = owner === "all"
            ? getCategoryAndModeFilteredFindings().length
            : getCategoryAndModeFilteredFindings().filter((finding) => finding.owner === owner).length;

          return '<button class="chip' + (activeState.owner === owner ? " active" : "") + '" data-owner="' + escapeHtml(owner) + '">' +
            escapeHtml(label) + " · " + escapeHtml(String(count)) +
          "</button>";
        }).join("");

        ownerToolbar.querySelectorAll("[data-owner]").forEach((button) => {
          button.addEventListener("click", () => {
            activeState.owner = button.getAttribute("data-owner");
            const visibleFindings = getVisibleFindings();
            if (!visibleFindings.some((finding) => finding.path === activeState.selectedPath)) {
              activeState.selectedPath = visibleFindings[0]?.path ?? null;
            }
            hydrateBoard();
            renderActionToolbar();
            renderToolbar();
            renderOwnerToolbar();
            renderFindingList();
            renderDetail(findSelectedFinding());
          });
        });
      }

      function renderFindingList() {
        const visibleFindings = getVisibleFindings();

        if (visibleFindings.length === 0) {
          findingList.innerHTML = '<div class="empty-state">No findings in this filter.</div>';
          return;
        }

        findingList.innerHTML = visibleFindings.map((finding) => {
          const badges = [
            badgeMarkup(finding.severity, finding.severity),
            badgeMarkup(finding.category, finding.category),
            badgeMarkup(finding.confidence, finding.confidence),
            badgeMarkup(finding.recommendedAction, finding.recommendedAction, "tag"),
          ].join("");

          return '<button class="finding-item' + (finding.path === activeState.selectedPath ? " active" : "") + '" data-path="' + escapeHtml(finding.path) + '">' +
            '<div class="finding-head">' +
              '<div class="finding-path"><strong>' + escapeHtml(finding.ruleId) + '</strong><br /><span class="inline-code">' + escapeHtml(finding.path) + '</span></div>' +
              '<div class="badge-row">' + badges + '</div>' +
            '</div>' +
            '<div class="finding-reason">' + escapeHtml(finding.ruleName + ". " + finding.whyIllegal) + '</div>' +
          '</button>';
        }).join("");

        findingList.querySelectorAll("[data-path]").forEach((button) => {
          button.addEventListener("click", () => {
            activeState.selectedPath = button.getAttribute("data-path");
            renderFindingList();
            renderDetail(findSelectedFinding());
          });
        });
      }

      function renderDetail(finding) {
        if (!finding) {
          detailTitle.textContent = "No finding selected";
          detailBadges.innerHTML = "";
          detailSummary.innerHTML = "";
          detailLineage.innerHTML = '<div class="empty-state">Choose a finding to inspect its lineage line.</div>';
          detailNote.hidden = true;
          return;
        }

        detailTitle.textContent = finding.ruleId + " · " + finding.ruleName;
        detailBadges.innerHTML = [
          badgeMarkup(finding.severity, finding.severity),
          badgeMarkup(finding.category, finding.category),
          badgeMarkup(finding.confidence, finding.confidence),
          badgeMarkup(finding.inferredRole, finding.inferredRole, "tag"),
          badgeMarkup(finding.recommendedAction, finding.recommendedAction, "tag"),
        ].join("");

        detailSummary.innerHTML = [
          { title: "Source Tool", value: finding.sourceTool },
          { title: "Owner", value: finding.owner },
          { title: "Owner Source", value: finding.ownerSource },
          { title: "Slice", value: finding.slice },
          { title: "CI Blocking", value: finding.ciBlocking ? "yes" : "no" },
          { title: "Protected Scopes", value: finding.protectedScopeIds.length > 0 ? finding.protectedScopeIds.join(" · ") : "none" },
          { title: "Approved Remediation", value: formatRemediation(finding.approvedRemediation) },
          { title: "File", value: finding.path },
        ].map((item) =>
          '<div class="lane-item">' +
            '<strong>' + escapeHtml(item.title) + '</strong>' +
            '<span>' + escapeHtml(item.value) + '</span>' +
          '</div>'
        ).join("");

        const lineageSegments = [
          {
            title: "Why This Is Illegal Or Suspicious",
            value: [finding.whyIllegal],
          },
          {
            title: "Verdict",
            value: [
              "Severity: " + finding.severity,
              "Category: " + finding.category,
              "Confidence: " + finding.confidence,
              "Rule: " + finding.ruleId,
              "CI blocking: " + (finding.ciBlocking ? "yes" : "no"),
            ],
          },
          {
            title: "Approved Remediation",
            value: [
              "Kind: " + finding.approvedRemediation.kind,
              "Target zone: " + (finding.approvedRemediation.targetZone ?? "none"),
              "Autofix eligible: " + (finding.approvedRemediation.autofixEligible ? "yes" : "no"),
              "Human review required: " + (finding.approvedRemediation.requiresHumanReview ? "yes" : "no"),
            ],
          },
          {
            title: "Lineage Line",
            value: finding.importers.length > 0
              ? finding.importers
              : ["No direct importers recorded"],
          },
          {
            title: "Evidence Roles",
            value: finding.evidenceRole.length > 0 ? finding.evidenceRole : ["none"],
          },
          {
            title: "Survival Basis",
            value: finding.survivalBasis.length > 0 ? finding.survivalBasis : ["none"],
          },
          {
            title: "Governance Context",
            value: [
              "Rollout: " + REPORT.rolloutId,
              "Mode: " + REPORT.rolloutMode,
              "Status: " + REPORT.rolloutStatus,
              "Trust: " + REPORT.reportTrust,
              "Root: " + REPORT.scope.root,
              "Owner: " + finding.owner,
              "Slice: " + finding.slice,
            ],
          },
        ];

        const ownerEntry = REPORT.ownerAccountability.find((entry) => entry.owner === finding.owner);
        if (ownerEntry) {
          lineageSegments.push({
            title: "Owner Accountability",
            value: [
              "Owner: " + ownerEntry.owner,
              "Owner source: " + ownerEntry.ownerSource,
              "Blocking findings: " + ownerEntry.blockingFindingCount,
              "Total findings: " + ownerEntry.findingCount,
            ],
          });
        }

        detailLineage.innerHTML = lineageSegments.map((segment) =>
          '<section class="lineage-segment">' +
            '<div class="segment-title">' + escapeHtml(segment.title) + '</div>' +
            '<div class="segment-value">' +
              '<ul class="list-reset">' +
                segment.value.map((item) => '<li class="inline-code">' + escapeHtml(String(item)) + '</li>').join("") +
              '</ul>' +
            '</div>' +
          '</section>'
        ).join("");

        if (finding.notes && finding.notes.length > 0) {
          detailNote.hidden = false;
          detailNote.innerHTML = "<strong>Notes</strong><br />" + finding.notes.map((note) => escapeHtml(note)).join("<br />");
        } else {
          detailNote.hidden = true;
        }
      }

      function findSelectedFinding() {
        return getVisibleFindings().find((finding) => finding.path === activeState.selectedPath)
          ?? getVisibleFindings()[0]
          ?? null;
      }

      function getModeCount(mode) {
        if (mode === "blocking") {
          return REPORT.findings.filter((finding) => finding.ciBlocking).length;
        }
        return REPORT.findings.length;
      }

      function getModeFilteredFindings() {
        if (activeState.mode === "blocking") {
          return REPORT.findings.filter((finding) => finding.ciBlocking);
        }
        return REPORT.findings;
      }

      function getCategoryFilteredFindings() {
        if (activeState.category === "all") {
          return getModeFilteredFindings();
        }
        return getModeFilteredFindings().filter((finding) => finding.category === activeState.category);
      }

      function getOwnerFilteredFindings() {
        if (activeState.owner === "all") {
          return getModeFilteredFindings();
        }
        return getModeFilteredFindings().filter((finding) => finding.owner === activeState.owner);
      }

      function getOwnerAndModeFilteredFindings() {
        if (activeState.owner === "all") {
          return getModeFilteredFindings();
        }
        return getModeFilteredFindings().filter((finding) => finding.owner === activeState.owner);
      }

      function getCategoryAndModeFilteredFindings() {
        if (activeState.category === "all") {
          return getModeFilteredFindings();
        }
        return getModeFilteredFindings().filter((finding) => finding.category === activeState.category);
      }

      function getActiveOwnerAccountability() {
        if (activeState.owner === "all") {
          return null;
        }
        return REPORT.ownerAccountability.find((entry) => entry.owner === activeState.owner) ?? null;
      }

      function getVisibleFindings() {
        return getModeFilteredFindings().filter((finding) => {
          const categoryMatch =
            activeState.category === "all" || finding.category === activeState.category;
          const ownerMatch =
            activeState.owner === "all" || finding.owner === activeState.owner;
          return categoryMatch && ownerMatch;
        });
      }

      function badgeMarkup(kind, label, className = "badge") {
        return '<span class="' + className + " " + escapeAttribute(kind) + '">' + escapeHtml(label) + "</span>";
      }

      function formatRemediation(remediation) {
        return [
          remediation.kind,
          remediation.targetZone ? "target " + remediation.targetZone : "no target zone",
          remediation.autofixEligible ? "autofix eligible" : "manual fix",
          remediation.requiresHumanReview ? "human review required" : "human review not required",
        ].join(" · ");
      }

      function formatDate(value) {
        try {
          return new Intl.DateTimeFormat(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          }).format(new Date(value));
        } catch {
          return value;
        }
      }

      function escapeHtml(value) {
        return String(value)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;");
      }

      function escapeAttribute(value) {
        return String(value).replace(/[^a-z0-9-]/gi, "-").toLowerCase();
      }
    </script>
  </body>
</html>
`
}

function createFinding({
  analysis,
  category,
  confidence,
  reason,
  recommendedAction,
  blockingPolicy,
  reportTrust,
}: {
  analysis: FileAnalysis
  category: FileSurvivalFindingCategory
  confidence: FileSurvivalFindingConfidence
  reason: string
  recommendedAction: FileSurvivalRecommendedAction
  blockingPolicy: FileSurvivalRolloutDefinition["blockingPolicy"]
  reportTrust: FileSurvivalReportTrust
}): FileSurvivalFinding {
  const severity = inferFindingSeverity({
    category,
    confidence,
    protectedScopeIds: analysis.protectedScopeIds,
    blockingPolicy,
  })
  const approvedRemediation = inferApprovedRemediation({
    category,
    recommendedAction,
    targetZone: analysis.slice,
    protectedScopeIds: analysis.protectedScopeIds,
  })
  const ciBlocking = inferCiBlocking({
    category,
    confidence,
    protectedScopeIds: analysis.protectedScopeIds,
    reportTrust,
    blockingPolicy,
  })

  return {
    category,
    confidence,
    severity,
    sourceTool: "file-survival-audit",
    ruleId: inferRuleId(category, analysis.wrapperSubtype),
    ruleName: inferRuleName(category, analysis.wrapperSubtype),
    path: analysis.path,
    slice: analysis.slice,
    owner: analysis.owner,
    ownerSource: analysis.ownerSource,
    protectedScopeIds: analysis.protectedScopeIds,
    inferredRole: analysis.claimedRole,
    whyIllegal: reason,
    approvedRemediation,
    ciBlocking,
    evidenceRole: analysis.evidenceRole,
    survivalBasis: analysis.survivalBasis,
    importerCount: analysis.directImporters.length,
    importers: analysis.directImporters,
    evidence: {
      evidenceRole: analysis.evidenceRole,
      survivalBasis: analysis.survivalBasis,
      importerCount: analysis.directImporters.length,
      importers: analysis.directImporters,
      notes: analysis.notes,
    },
    reason,
    recommendedAction,
    notes: analysis.notes,
  }
}

function createEmptyFolderFinding(
  directoryPath: string,
  rollout: FileSurvivalRolloutDefinition
): FileSurvivalFinding {
  const reason = "The directory contains no surviving non-ignored files."
  const slice = inferSlice(directoryPath)
  const owner = inferOwner({
    filePath: directoryPath,
    inferredRole: "empty-folder",
    rollout,
  })
  const protectedScopeIds = inferProtectedScopeIds(directoryPath, rollout)

  return {
    category: "empty-folder",
    confidence: "high",
    severity: "warning",
    sourceTool: "file-survival-audit",
    ruleId: "FS-EMPTY-FOLDER-001",
    ruleName: "Empty folder in governed scope",
    path: directoryPath,
    slice,
    owner: owner.owner,
    ownerSource: owner.source,
    protectedScopeIds,
    inferredRole: "empty-folder",
    whyIllegal: reason,
    approvedRemediation: {
      kind: "delete",
      targetZone: path.dirname(directoryPath),
      autofixEligible: true,
      requiresHumanReview: false,
    },
    ciBlocking: false,
    evidenceRole: [],
    survivalBasis: [],
    importerCount: 0,
    importers: [],
    evidence: {
      evidenceRole: [],
      survivalBasis: [],
      importerCount: 0,
      importers: [],
    },
    reason,
    recommendedAction: "delete",
  }
}

function collectFileFindings(
  analyses: ReadonlyMap<string, FileAnalysis>,
  policy: {
    readonly blockingPolicy: FileSurvivalRolloutDefinition["blockingPolicy"]
    readonly reportTrust: FileSurvivalReportTrust
  }
): readonly FileSurvivalFinding[] {
  const findings: FileSurvivalFinding[] = []

  for (const analysis of analyses.values()) {
    if (analysis.isReviewedException) {
      continue
    }

    if (analysis.claimedRole === "unknown") {
      const category =
        analysis.protectedScopeIds.length > 0
          ? "unknown-role-protected-scope"
          : analysis.directImporters.length > 0
            ? "unknown-role-consumed"
            : "unknown-role-unconsumed"
      const confidence =
        category === "unknown-role-protected-scope"
          ? "high"
          : analysis.directImporters.length > 0
            ? "medium"
            : "low"
      const reason =
        category === "unknown-role-protected-scope"
          ? "The file sits inside a protected scope, but the configured role rules cannot classify it."
          : analysis.directImporters.length > 0
            ? "The file is actively consumed, but the configured role rules cannot classify it."
            : "The file cannot be classified by current role rules and has no direct consumers."
      findings.push(
        createFinding({
          analysis,
          category,
          confidence,
          reason,
          recommendedAction: "keep-reviewed",
          blockingPolicy: policy.blockingPolicy,
          reportTrust: policy.reportTrust,
        })
      )
      continue
    }

    const wrapperFinding = classifyWrapperFinding(analysis, policy)
    if (wrapperFinding !== null) {
      findings.push(wrapperFinding)
      continue
    }

    const sharedSingleUseFinding = classifySharedSingleUseFinding(
      analysis,
      policy
    )
    if (sharedSingleUseFinding !== null) {
      findings.push(sharedSingleUseFinding)
      continue
    }

    const weakBoundaryFinding = classifyWeakBoundaryFinding(analysis, policy)
    if (weakBoundaryFinding !== null) {
      findings.push(weakBoundaryFinding)
      continue
    }

    if (analysis.survivalBasis.length === 0) {
      findings.push(
        createFinding({
          analysis,
          category: "dead",
          confidence: "high",
          reason:
            "The file has a known role, but no valid survival basis was found from ownership evidence or configured exception.",
          recommendedAction: "delete",
          blockingPolicy: policy.blockingPolicy,
          reportTrust: policy.reportTrust,
        })
      )
    }
  }

  return findings
}

function classifyWrapperFinding(
  analysis: FileAnalysis,
  policy: {
    readonly blockingPolicy: FileSurvivalRolloutDefinition["blockingPolicy"]
    readonly reportTrust: FileSurvivalReportTrust
  }
): FileSurvivalFinding | null {
  if (analysis.wrapperSubtype === null) {
    return null
  }

  if (analysis.claimedRole === "runtime-orchestrator") {
    return null
  }

  if (
    analysis.claimedRole === "route-owner" ||
    analysis.claimedRole === "registry"
  ) {
    return null
  }

  if (
    analysis.wrapperSubtype === "re-export-only" &&
    path.basename(analysis.path).startsWith("index.")
  ) {
    return null
  }

  return {
    ...createFinding({
      analysis,
      category: "wrapper",
      confidence: "high",
      reason:
        analysis.wrapperSubtype === "re-export-only"
          ? "The file only re-exports another module and does not add ownership, policy, or entrypoint meaning."
          : "The file is a pass-through wrapper and does not add route, provider, loading, metadata, or composition boundary value.",
      recommendedAction:
        analysis.wrapperSubtype === "re-export-only" ? "delete" : "inline",
      blockingPolicy: policy.blockingPolicy,
      reportTrust: policy.reportTrust,
    }),
  }
}

function classifySharedSingleUseFinding(
  analysis: FileAnalysis,
  policy: {
    readonly blockingPolicy: FileSurvivalRolloutDefinition["blockingPolicy"]
    readonly reportTrust: FileSurvivalReportTrust
  }
): FileSurvivalFinding | null {
  if (analysis.claimedRole !== "shared-component") {
    return null
  }

  if (path.basename(analysis.path).startsWith("index.")) {
    return null
  }

  if (analysis.routeOwnerConsumers.length !== 1) {
    return null
  }

  if (analysis.survivalBasis.includes("shared-root-multi-consumer")) {
    return null
  }

  return {
    ...createFinding({
      analysis,
      category: "shared-single-use",
      confidence: "medium",
      reason:
        "The file lives in an approved shared root, but current evidence shows only one route-owner consumer and no stronger shared justification.",
      recommendedAction: "move-local",
      blockingPolicy: policy.blockingPolicy,
      reportTrust: policy.reportTrust,
    }),
  }
}

function classifyWeakBoundaryFinding(
  analysis: FileAnalysis,
  policy: {
    readonly blockingPolicy: FileSurvivalRolloutDefinition["blockingPolicy"]
    readonly reportTrust: FileSurvivalReportTrust
  }
): FileSurvivalFinding | null {
  const baseName = path.basename(analysis.path)

  if (
    analysis.claimedRole !== "page-local-composition" &&
    analysis.claimedRole !== "editorial-content"
  ) {
    return null
  }

  if (
    analysis.claimedRole === "editorial-content" &&
    analysis.survivalBasis.includes("content-owned-by-page")
  ) {
    return null
  }

  if (
    analysis.claimedRole === "page-local-composition" &&
    analysis.directImporters.length >= 2
  ) {
    return null
  }

  if (analysis.survivalBasis.length === 0) {
    return null
  }

  const consumerShapeTriggers = [
    analysis.directImporters.length <= 1 &&
      !LOCAL_COMPOSITION_SIGNAL_PATTERN.test(baseName),
    analysis.claimedRole === "page-local-composition" &&
      analysis.candidateRoles.length === 1 &&
      !LOCAL_COMPOSITION_SIGNAL_PATTERN.test(baseName),
    analysis.meaningfulBoundarySignals.length === 0,
    BOUNDARY_SIGNAL_PATTERN.test(baseName) &&
      analysis.routeOwnerConsumers.length <= 1,
  ]
  const substanceTriggers = [
    analysis.isTrivialExportSurface,
    analysis.isVerySmall,
  ]
  const trueTriggerCount = [
    ...consumerShapeTriggers,
    ...substanceTriggers,
  ].filter(Boolean).length

  if (substanceTriggers.filter(Boolean).length === 0 || trueTriggerCount < 2) {
    return null
  }

  return {
    ...createFinding({
      analysis,
      category: "weak-boundary",
      confidence: trueTriggerCount >= 4 ? "medium" : "low",
      reason:
        "The file is separated as a boundary, but its size, consumer shape, and lack of boundary signals make the extraction weakly justified.",
      recommendedAction: "merge-with-owner",
      blockingPolicy: policy.blockingPolicy,
      reportTrust: policy.reportTrust,
    }),
  }
}

function collectEmptyFolderFindings({
  allDirectories,
  allFiles,
  ignorePatterns,
  repoRoot,
  scopeRoot,
  rollout,
}: {
  allDirectories: readonly string[]
  allFiles: readonly string[]
  ignorePatterns: readonly string[]
  repoRoot: string
  scopeRoot: string
  rollout: FileSurvivalRolloutDefinition
}): readonly FileSurvivalFinding[] {
  const survivingFileSet = new Set(allFiles)
  const findings: FileSurvivalFinding[] = []

  for (const directoryPath of allDirectories) {
    const absoluteDirectoryPath = path.join(repoRoot, directoryPath)
    const survivingChildren = [...survivingFileSet].filter((filePath) =>
      filePath.startsWith(`${directoryPath}/`)
    )

    if (survivingChildren.length > 0) {
      continue
    }

    if (
      isIgnoredScopePath({
        scopeRelativePath: normalizeWorkspacePath(
          path.relative(scopeRoot, directoryPath)
        ),
        ignorePatterns,
        isDirectory: true,
      })
    ) {
      continue
    }

    if (readdirSync(absoluteDirectoryPath).length > 0) {
      continue
    }

    findings.push({
      ...createEmptyFolderFinding(directoryPath, rollout),
    })
  }

  return findings
}

function buildStats({
  analyses,
  findings,
  ignoredFileCount,
  scannedDirectoryCount,
  reviewedExceptionCount,
}: {
  analyses: ReadonlyMap<string, FileAnalysis>
  findings: readonly FileSurvivalFinding[]
  ignoredFileCount: number
  scannedDirectoryCount: number
  reviewedExceptionCount: number
}): FileSurvivalStats {
  const findingsByCategory = Object.fromEntries(
    CATEGORY_ORDER.map((category) => [category, 0])
  ) as Record<FileSurvivalFindingCategory, number>
  const findingsByConfidence = Object.fromEntries(
    CONFIDENCE_ORDER.map((confidence) => [confidence, 0])
  ) as Record<FileSurvivalFindingConfidence, number>
  const findingsBySeverity = Object.fromEntries(
    SEVERITY_ORDER.map((severity) => [severity, 0])
  ) as Record<FileSurvivalFindingSeverity, number>
  const scannedFilesByRole = Object.fromEntries(
    ROLE_ORDER.map((role) => [role, 0])
  ) as Record<FileSurvivalClaimedRole, number>
  const scannedFilesByOwnerSource = {
    config: 0,
    fallback: 0,
  } as Record<FileSurvivalOwnerSource, number>

  for (const analysis of analyses.values()) {
    scannedFilesByRole[analysis.claimedRole] += 1
    scannedFilesByOwnerSource[analysis.ownerSource] += 1
  }

  for (const finding of findings) {
    findingsByCategory[finding.category] += 1
    findingsByConfidence[finding.confidence] += 1
    findingsBySeverity[finding.severity] += 1
  }

  return {
    scannedFileCount: analyses.size,
    ignoredFileCount,
    scannedDirectoryCount,
    exceptionCount: reviewedExceptionCount,
    findingCount: findings.length,
    findingsByCategory,
    findingsByConfidence,
    findingsBySeverity,
    scannedFilesByRole,
    scannedFilesByOwnerSource,
  }
}

function buildOwnerCoverage(
  analyses: ReadonlyMap<string, FileAnalysis>
): FileSurvivalOwnerCoverage {
  const fallbackOwnedPaths: string[] = []

  for (const analysis of analyses.values()) {
    if (analysis.ownerSource === "fallback") {
      fallbackOwnedPaths.push(analysis.path)
    }
  }

  return {
    configOwnedCount: analyses.size - fallbackOwnedPaths.length,
    fallbackOwnedCount: fallbackOwnedPaths.length,
    fallbackOwnedPaths: sortStrings(fallbackOwnedPaths),
  }
}

function buildOwnerAccountability(
  findings: readonly FileSurvivalFinding[]
): readonly FileSurvivalOwnerAccountabilityEntry[] {
  const buckets = new Map<
    string,
    {
      owner: string
      ownerSource: FileSurvivalOwnerSource
      findingCount: number
      blockingFindingCount: number
      severityCounts: Record<FileSurvivalFindingSeverity, number>
      topPaths: string[]
    }
  >()

  for (const finding of findings) {
    const existingBucket = buckets.get(finding.owner)
    const bucket = existingBucket ?? {
      owner: finding.owner,
      ownerSource: finding.ownerSource,
      findingCount: 0,
      blockingFindingCount: 0,
      severityCounts: {
        error: 0,
        warning: 0,
        advisory: 0,
      },
      topPaths: [],
    }

    bucket.findingCount += 1
    bucket.severityCounts[finding.severity] += 1
    if (finding.ciBlocking) {
      bucket.blockingFindingCount += 1
    }
    if (bucket.topPaths.length < 5) {
      bucket.topPaths.push(finding.path)
    }

    buckets.set(finding.owner, bucket)
  }

  return [...buckets.values()]
    .sort((left, right) => {
      if (left.blockingFindingCount !== right.blockingFindingCount) {
        return right.blockingFindingCount - left.blockingFindingCount
      }
      if (left.findingCount !== right.findingCount) {
        return right.findingCount - left.findingCount
      }
      return left.owner.localeCompare(right.owner)
    })
    .map((bucket) => ({
      owner: bucket.owner,
      ownerSource: bucket.ownerSource,
      findingCount: bucket.findingCount,
      blockingFindingCount: bucket.blockingFindingCount,
      severityCounts: bucket.severityCounts,
      topPaths: bucket.topPaths,
    }))
}

function buildRemediationMatrix(
  findings: readonly FileSurvivalFinding[]
): readonly FileSurvivalRemediationMatrixEntry[] {
  const buckets = new Map<
    FileSurvivalRecommendedAction,
    {
      kind: FileSurvivalRecommendedAction
      findingCount: number
      blockingFindingCount: number
      owners: Set<string>
      topPaths: string[]
    }
  >()

  for (const finding of findings) {
    const kind = finding.approvedRemediation.kind
    const bucket = buckets.get(kind) ?? {
      kind,
      findingCount: 0,
      blockingFindingCount: 0,
      owners: new Set<string>(),
      topPaths: [],
    }

    bucket.findingCount += 1
    if (finding.ciBlocking) {
      bucket.blockingFindingCount += 1
    }
    bucket.owners.add(finding.owner)
    if (bucket.topPaths.length < 5) {
      bucket.topPaths.push(finding.path)
    }

    buckets.set(kind, bucket)
  }

  return [...buckets.values()]
    .sort((left, right) => {
      if (left.blockingFindingCount !== right.blockingFindingCount) {
        return right.blockingFindingCount - left.blockingFindingCount
      }
      if (left.findingCount !== right.findingCount) {
        return right.findingCount - left.findingCount
      }
      return left.kind.localeCompare(right.kind)
    })
    .map((bucket) => ({
      kind: bucket.kind,
      findingCount: bucket.findingCount,
      blockingFindingCount: bucket.blockingFindingCount,
      owners: sortStrings([...bucket.owners]),
      topPaths: bucket.topPaths,
    }))
}

function inferFindingSeverity({
  category,
  confidence,
  protectedScopeIds,
  blockingPolicy,
}: {
  category: FileSurvivalFindingCategory
  confidence: FileSurvivalFindingConfidence
  protectedScopeIds: readonly string[]
  blockingPolicy: FileSurvivalRolloutDefinition["blockingPolicy"]
}): FileSurvivalFindingSeverity {
  if (
    category === "wrapper" ||
    category === "dead" ||
    category === "unknown-role-protected-scope"
  ) {
    return "error"
  }

  if (
    protectedScopeIds.length > 0 &&
    blockingPolicy.protectedScopeBlockingCategories.includes(category) &&
    blockingPolicy.protectedScopeBlockingConfidence.includes(confidence)
  ) {
    return "error"
  }

  if (
    protectedScopeIds.length > 0 &&
    (category === "weak-boundary" || category === "shared-single-use")
  ) {
    return "warning"
  }

  if (category === "empty-folder" || confidence === "high") {
    return "warning"
  }

  return "advisory"
}

function inferRuleId(
  category: FileSurvivalFindingCategory,
  wrapperSubtype: WrapperSubtype
): string {
  if (category === "wrapper") {
    return wrapperSubtype === "pass-through-only"
      ? "FS-WRAPPER-PASSTHROUGH-001"
      : "FS-WRAPPER-REEXPORT-001"
  }

  switch (category) {
    case "dead":
      return "FS-SURVIVAL-BASIS-001"
    case "weak-boundary":
      return "FS-WEAK-BOUNDARY-001"
    case "shared-single-use":
      return "FS-SHARED-ROOT-001"
    case "unknown-role-protected-scope":
      return "FS-UNKNOWN-ROLE-PROTECTED-001"
    case "unknown-role-consumed":
      return "FS-UNKNOWN-ROLE-CONSUMED-001"
    case "unknown-role-unconsumed":
      return "FS-UNKNOWN-ROLE-UNCONSUMED-001"
    case "empty-folder":
      return "FS-EMPTY-FOLDER-001"
  }
}

function inferRuleName(
  category: FileSurvivalFindingCategory,
  wrapperSubtype: WrapperSubtype
): string {
  if (category === "wrapper") {
    return wrapperSubtype === "pass-through-only"
      ? "Pass-through wrapper without governance value"
      : "Re-export wrapper without governance value"
  }

  switch (category) {
    case "dead":
      return "Known role without valid survival basis"
    case "weak-boundary":
      return "Weak extracted boundary"
    case "shared-single-use":
      return "Shared-root file with single-use justification only"
    case "unknown-role-protected-scope":
      return "Unclassified file role inside protected scope"
    case "unknown-role-consumed":
      return "Consumed file with unclassified role"
    case "unknown-role-unconsumed":
      return "Unconsumed file with unclassified role"
    case "empty-folder":
      return "Empty folder in governed scope"
  }
}

function inferApprovedRemediation({
  category,
  recommendedAction,
  targetZone,
  protectedScopeIds,
}: {
  category: FileSurvivalFindingCategory
  recommendedAction: FileSurvivalRecommendedAction
  targetZone: string | null
  protectedScopeIds: readonly string[]
}): FileSurvivalApprovedRemediation {
  switch (category) {
    case "empty-folder":
      return {
        kind: "delete",
        targetZone,
        autofixEligible: true,
        requiresHumanReview: false,
      }
    case "unknown-role-protected-scope":
      return {
        kind: "keep-reviewed",
        targetZone: protectedScopeIds[0] ?? targetZone,
        autofixEligible: false,
        requiresHumanReview: true,
      }
    case "unknown-role-consumed":
    case "unknown-role-unconsumed":
      return {
        kind: "keep-reviewed",
        targetZone,
        autofixEligible: false,
        requiresHumanReview: true,
      }
    case "wrapper":
      return {
        kind: recommendedAction,
        targetZone,
        autofixEligible: false,
        requiresHumanReview: true,
      }
    case "dead":
    case "weak-boundary":
    case "shared-single-use":
      return {
        kind: recommendedAction,
        targetZone,
        autofixEligible: false,
        requiresHumanReview: true,
      }
  }
}

function inferSlice(filePath: string): string {
  const normalizedPath = normalizeWorkspacePath(filePath)

  if (normalizedPath.includes("/pages/")) {
    return normalizeWorkspacePath(path.dirname(normalizedPath))
  }

  if (normalizedPath.includes("/components/")) {
    return "apps/web/src/marketing/components"
  }

  return "apps/web/src/marketing"
}

function inferOwner({
  filePath,
  inferredRole,
  rollout,
}: {
  filePath: string
  inferredRole: FileSurvivalClaimedRole | "empty-folder"
  rollout: FileSurvivalRolloutDefinition
}): {
  readonly owner: string
  readonly source: FileSurvivalOwnerSource
} {
  const ownerTruthMatch = findLongestMatchingRoot(filePath, rollout.ownerTruth)
  if (ownerTruthMatch !== null) {
    return {
      owner: ownerTruthMatch.owner,
      source: "config",
    }
  }

  return {
    owner: inferOwnerFallback(filePath, inferredRole),
    source: "fallback",
  }
}

function inferOwnerFallback(
  filePath: string,
  inferredRole: FileSurvivalClaimedRole | "empty-folder"
): string {
  const normalizedPath = normalizeWorkspacePath(filePath)

  if (
    inferredRole === "runtime-orchestrator" ||
    inferredRole === "registry" ||
    normalizedPath.startsWith("apps/web/src/marketing/marketing-")
  ) {
    return "marketing-runtime"
  }

  if (
    inferredRole === "shared-component" ||
    normalizedPath.includes("/components/")
  ) {
    return "marketing-shared-surface"
  }

  if (normalizedPath.includes("/pages/")) {
    const [, pageSlice = "pages"] = normalizedPath.split("/pages/")
    const ownerRoot = pageSlice.split("/").slice(0, 2).join("/")
    return `marketing-route:${ownerRoot || "pages"}`
  }

  return "marketing-governance"
}

function inferEvidenceRoles({
  directImporters,
  directImportersByClaimedRole,
  routeOwnerConsumers,
  registryConsumers,
  routerConsumers,
  layoutOrHomeConsumers,
  wrapperSubtype,
}: {
  filePath: string
  claimedRole: FileSurvivalClaimedRole
  directImporters: readonly string[]
  directImportersByClaimedRole: readonly FileSurvivalClaimedRole[]
  routeOwnerConsumers: readonly string[]
  runtimeOwnerConsumers: readonly string[]
  registryConsumers: readonly string[]
  routerConsumers: readonly string[]
  layoutOrHomeConsumers: readonly string[]
  wrapperSubtype: WrapperSubtype
}): readonly FileSurvivalEvidenceRole[] {
  const roles = new Set<FileSurvivalEvidenceRole>()

  for (const claimedRole of directImportersByClaimedRole) {
    if (claimedRole === "route-owner") {
      roles.add("direct-consumer:route-owner")
    } else if (claimedRole === "shared-component") {
      roles.add("direct-consumer:shared-component")
    } else if (claimedRole === "runtime-orchestrator") {
      roles.add("direct-consumer:runtime-orchestrator")
    } else if (claimedRole === "registry") {
      roles.add("direct-consumer:registry")
    } else if (claimedRole === "page-local-composition") {
      roles.add("direct-consumer:page-local-composition")
    } else if (claimedRole === "editorial-content") {
      roles.add("direct-consumer:editorial-content")
    }
  }

  if (wrapperSubtype === "pass-through-only") {
    roles.add("pass-through-only")
  }

  if (registryConsumers.length > 0) {
    roles.add("reachable-from-registry")
  }
  if (routerConsumers.length > 0) {
    roles.add("reachable-from-router")
  }
  if (layoutOrHomeConsumers.length > 0) {
    roles.add("reachable-from-layout-or-home-loader")
  }
  if (routeOwnerConsumers.length > 0) {
    roles.add("reachable-from-route-owner")
  }
  if (routeOwnerConsumers.length >= 2) {
    roles.add("shared-multi-consumer")
  }
  if (directImporters.length === 0 && roles.size === 0) {
    roles.add("no-evidence")
  }

  return sortStrings([...roles]) as readonly FileSurvivalEvidenceRole[]
}

function inferSurvivalBasis({
  filePath,
  claimedRole,
  routeOwnerConsumers,
  registryConsumers,
  routerConsumers,
  layoutOrHomeConsumers,
  runtimeOwnerSet,
  sharedRootSet,
  routeOwnerConsumerCount,
  reviewedExceptionSet,
}: {
  filePath: string
  claimedRole: FileSurvivalClaimedRole
  routeOwnerConsumers: readonly string[]
  registryConsumers: readonly string[]
  routerConsumers: readonly string[]
  layoutOrHomeConsumers: readonly string[]
  runtimeOwnerSet: ReadonlySet<string>
  sharedRootSet: ReadonlySet<string>
  routeOwnerConsumerCount: number
  reviewedExceptionSet: ReadonlySet<string>
}): readonly FileSurvivalBasis[] {
  const bases = new Set<FileSurvivalBasis>()

  if (reviewedExceptionSet.has(filePath)) {
    bases.add("reviewed-exception")
  }

  if (runtimeOwnerSet.has(filePath)) {
    bases.add("configured-runtime-owner")
  }

  if (registryConsumers.length > 0) {
    bases.add("reachable-from-registry")
  }

  if (routerConsumers.length > 0) {
    bases.add("reachable-from-router")
  }

  if (layoutOrHomeConsumers.length > 0) {
    bases.add("reachable-from-layout-or-home-loader")
  }

  if (
    claimedRole === "page-local-composition" &&
    routeOwnerConsumers.length > 0
  ) {
    bases.add("page-local-child-of-route-owner")
  }

  if (
    (claimedRole === "editorial-content" || claimedRole === "config") &&
    routeOwnerConsumers.length > 0
  ) {
    bases.add("content-owned-by-page")
  }

  if (
    isInsideSharedRoot(filePath, sharedRootSet) &&
    routeOwnerConsumerCount >= 2
  ) {
    bases.add("shared-root-multi-consumer")
  }

  return sortStrings([...bases]) as readonly FileSurvivalBasis[]
}

function countMatchingReviewedExceptions(
  reviewedExceptionSet: ReadonlySet<string>,
  relevantFilePathSet: ReadonlySet<string>
): number {
  let count = 0

  for (const reviewedException of reviewedExceptionSet) {
    if (relevantFilePathSet.has(reviewedException)) {
      count += 1
    }
  }

  return count
}

function claimedRoleForPath({
  filePath,
  scopeRootWorkspacePath,
  sharedRootSet,
  runtimeOwnerSet,
  rolePatterns,
  rolePrecedence,
}: {
  filePath: string
  scopeRootWorkspacePath: string
  sharedRootSet: ReadonlySet<string>
  runtimeOwnerSet: ReadonlySet<string>
  rolePatterns: FileSurvivalRolloutDefinition["rolePatterns"]
  rolePrecedence: readonly FileSurvivalClaimedRole[]
}): {
  readonly claimedRole: FileSurvivalClaimedRole
  readonly candidateRoles: readonly InternalCandidateRole[]
} {
  const scopeRelativePath = toPosixPath(
    path.relative(scopeRootWorkspacePath, filePath)
  )
  const candidates = new Set<InternalCandidateRole>()
  const baseName = path.basename(filePath)

  if (runtimeOwnerSet.has(filePath)) {
    if (baseName.includes("registry")) {
      candidates.add("registry")
    } else {
      candidates.add("runtime-orchestrator")
    }
  }

  if (isInsideSharedRoot(filePath, sharedRootSet)) {
    candidates.add("shared-component")
  }

  if (matchesAnyPattern(scopeRelativePath, rolePatterns.routeOwner)) {
    candidates.add("route-owner")
  }

  if (matchesAnyPattern(scopeRelativePath, rolePatterns.contentOwner)) {
    if (baseName.endsWith(".config.ts")) {
      candidates.add("config")
    } else {
      candidates.add("editorial-content")
    }
  }

  if (matchesAnyPattern(scopeRelativePath, rolePatterns.pageLocalComposition)) {
    candidates.add("page-local-composition")
  }

  if (baseName.endsWith(".css")) {
    candidates.add("styling-asset")
  }

  if (filePath.includes("/__tests__/") || /\.test\.(ts|tsx)$/.test(baseName)) {
    candidates.add("test")
  }

  for (const role of rolePrecedence) {
    if (candidates.has(role)) {
      return {
        claimedRole: role,
        candidateRoles: [...candidates].sort((left, right) =>
          left.localeCompare(right)
        ),
      }
    }
  }

  return {
    claimedRole: "unknown",
    candidateRoles: [...candidates].sort((left, right) =>
      left.localeCompare(right)
    ),
  }
}

function createResolverContext(tsconfigPath: string): ResolverContext {
  const configResult = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
  if (configResult.error) {
    throw new Error(
      ts.formatDiagnosticsWithColorAndContext([configResult.error], {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => process.cwd(),
        getNewLine: () => "\n",
      })
    )
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configResult.config,
    ts.sys,
    path.dirname(tsconfigPath),
    undefined,
    tsconfigPath
  )

  return {
    compilerOptions: parsedConfig.options,
    moduleResolutionHost: {
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      directoryExists: ts.sys.directoryExists,
      getDirectories: ts.sys.getDirectories,
      realpath: ts.sys.realpath,
    },
  }
}

function parseModule({
  absoluteFilePath,
  filePath,
  repoRoot,
  resolver,
  relevantFilePathSet,
  sharedRootSet,
}: {
  absoluteFilePath: string
  filePath: string
  repoRoot: string
  resolver: ResolverContext
  relevantFilePathSet: ReadonlySet<string>
  sharedRootSet: ReadonlySet<string>
}): ParsedModuleData {
  const raw = readFileSync(absoluteFilePath, "utf8")
  const sourceFile = ts.createSourceFile(
    absoluteFilePath,
    raw,
    ts.ScriptTarget.Latest,
    true,
    absoluteFilePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  )

  const specifiers: string[] = []

  visit(sourceFile)

  const directDependencies = new Set<string>()
  const unresolvedInternalSpecifiers = new Set<string>()
  const ignoredUnresolvedInternalSpecifiers = new Set<string>()

  for (const specifier of specifiers) {
    const resolution = ts.resolveModuleName(
      specifier,
      absoluteFilePath,
      resolver.compilerOptions,
      resolver.moduleResolutionHost
    )

    const resolvedFileName = resolution.resolvedModule?.resolvedFileName

    if (!resolvedFileName) {
      if (isPotentialInternalSpecifier(specifier)) {
        if (isIgnoredAssetSpecifier(specifier)) {
          ignoredUnresolvedInternalSpecifiers.add(specifier)
        } else {
          unresolvedInternalSpecifiers.add(specifier)
        }
      }
      continue
    }

    const normalizedResolvedPath = normalizeResolvedSourcePath({
      resolvedFileName,
      repoRoot,
    })

    if (normalizedResolvedPath === null) {
      continue
    }

    if (!relevantFilePathSet.has(normalizedResolvedPath)) {
      continue
    }

    directDependencies.add(normalizedResolvedPath)
  }

  return {
    directDependencies: sortStrings([...directDependencies]),
    unresolvedInternalSpecifiers: sortStrings([
      ...unresolvedInternalSpecifiers,
    ]),
    ignoredUnresolvedInternalSpecifiers: sortStrings([
      ...ignoredUnresolvedInternalSpecifiers,
    ]),
    wrapperSubtype: detectWrapperSubtype({
      sourceFile,
      filePath,
      directDependencies: sortStrings([...directDependencies]),
      sharedRootSet,
    }),
    lineCount: raw.split(/\r?\n/u).length,
    topLevelStatementCount: sourceFile.statements.length,
    significantStatementCount: countSignificantStatements(sourceFile),
    exportedDeclarationCount: countExportedDeclarations(sourceFile),
    meaningfulBoundarySignals: detectMeaningfulBoundarySignals(filePath, raw),
  }

  function visit(node: ts.Node) {
    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text)
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text)
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments.length > 0 &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text)
    }

    ts.forEachChild(node, visit)
  }
}

function detectWrapperSubtype({
  sourceFile,
  filePath,
  directDependencies,
  sharedRootSet,
}: {
  sourceFile: ts.SourceFile
  filePath: string
  directDependencies: readonly string[]
  sharedRootSet: ReadonlySet<string>
}): WrapperSubtype {
  if (isReExportOnlyModule(sourceFile)) {
    if (
      path.basename(filePath).startsWith("index.") &&
      isInsideSharedRoot(filePath, sharedRootSet)
    ) {
      return null
    }
    return "re-export-only"
  }

  if (detectPassThroughModule(sourceFile, directDependencies)) {
    return "pass-through-only"
  }

  return null
}

function isReExportOnlyModule(sourceFile: ts.SourceFile): boolean {
  let hasReExport = false

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      continue
    }

    if (
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier &&
      ts.isStringLiteralLike(statement.moduleSpecifier)
    ) {
      hasReExport = true
      continue
    }

    if (ts.isEmptyStatement(statement)) {
      continue
    }

    return false
  }

  return hasReExport
}

function detectPassThroughModule(
  sourceFile: ts.SourceFile,
  directDependencies: readonly string[]
): boolean {
  if (directDependencies.length !== 1) {
    return false
  }

  const importedSymbols = new Set<string>()

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) {
      continue
    }

    if (!statement.importClause) {
      continue
    }

    if (statement.importClause.name) {
      importedSymbols.add(statement.importClause.name.text)
    }

    const namedBindings = statement.importClause.namedBindings
    if (!namedBindings) {
      continue
    }

    if (ts.isNamespaceImport(namedBindings)) {
      importedSymbols.add(namedBindings.name.text)
      continue
    }

    for (const element of namedBindings.elements) {
      importedSymbols.add((element.propertyName ?? element.name).text)
      importedSymbols.add(element.name.text)
    }
  }

  const defaultExportTarget = getDefaultExportTargetName(sourceFile)

  if (defaultExportTarget && importedSymbols.has(defaultExportTarget)) {
    return true
  }

  const passThroughDeclaration = findPassThroughDeclaration(
    sourceFile,
    defaultExportTarget,
    importedSymbols
  )

  return passThroughDeclaration
}

function getDefaultExportTargetName(sourceFile: ts.SourceFile): string | null {
  for (const statement of sourceFile.statements) {
    if (
      ts.isExportAssignment(statement) &&
      ts.isIdentifier(statement.expression)
    ) {
      return statement.expression.text
    }

    if (ts.isFunctionDeclaration(statement) && hasDefaultModifier(statement)) {
      return statement.name?.text ?? null
    }

    if (ts.isClassDeclaration(statement) && hasDefaultModifier(statement)) {
      return statement.name?.text ?? null
    }
  }

  return null
}

function findPassThroughDeclaration(
  sourceFile: ts.SourceFile,
  defaultExportTarget: string | null,
  importedSymbols: ReadonlySet<string>
): boolean {
  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === defaultExportTarget
    ) {
      return functionReturnsImportedComponent(statement, importedSymbols)
    }

    if (
      ts.isVariableStatement(statement) &&
      statement.declarationList.declarations.length > 0
    ) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.name.text === defaultExportTarget
        ) {
          return variableReturnsImportedComponent(declaration, importedSymbols)
        }
      }
    }
  }

  return false
}

function functionReturnsImportedComponent(
  declaration: ts.FunctionDeclaration,
  importedSymbols: ReadonlySet<string>
): boolean {
  if (!declaration.body) {
    return false
  }

  const returnStatement = declaration.body.statements.find((statement) =>
    ts.isReturnStatement(statement)
  ) as ts.ReturnStatement | undefined

  if (!returnStatement?.expression) {
    return false
  }

  return expressionReturnsImportedComponent(
    returnStatement.expression,
    importedSymbols
  )
}

function variableReturnsImportedComponent(
  declaration: ts.VariableDeclaration,
  importedSymbols: ReadonlySet<string>
): boolean {
  if (!declaration.initializer) {
    return false
  }

  if (ts.isArrowFunction(declaration.initializer)) {
    if (ts.isBlock(declaration.initializer.body)) {
      const returnStatement = declaration.initializer.body.statements.find(
        (statement) => ts.isReturnStatement(statement)
      ) as ts.ReturnStatement | undefined

      if (!returnStatement?.expression) {
        return false
      }

      return expressionReturnsImportedComponent(
        returnStatement.expression,
        importedSymbols
      )
    }

    return expressionReturnsImportedComponent(
      declaration.initializer.body,
      importedSymbols
    )
  }

  return false
}

function expressionReturnsImportedComponent(
  expression: ts.Expression,
  importedSymbols: ReadonlySet<string>
): boolean {
  if (ts.isIdentifier(expression)) {
    return importedSymbols.has(expression.text)
  }

  if (ts.isJsxSelfClosingElement(expression)) {
    return jsxTagMatchesImportedSymbol(expression.tagName, importedSymbols)
  }

  if (ts.isJsxElement(expression)) {
    return jsxTagMatchesImportedSymbol(
      expression.openingElement.tagName,
      importedSymbols
    )
  }

  return false
}

function jsxTagMatchesImportedSymbol(
  tagName: ts.JsxTagNameExpression,
  importedSymbols: ReadonlySet<string>
): boolean {
  return ts.isIdentifier(tagName) && importedSymbols.has(tagName.text)
}

function hasDefaultModifier(node: ts.Node): boolean {
  const modifiers = ts.canHaveModifiers(node)
    ? ts.getModifiers(node)
    : undefined

  return Boolean(
    modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword
    )
  )
}

function countSignificantStatements(sourceFile: ts.SourceFile): number {
  return sourceFile.statements.filter((statement) => {
    if (ts.isImportDeclaration(statement)) {
      return false
    }

    if (
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)
    ) {
      return false
    }

    return !ts.isEmptyStatement(statement)
  }).length
}

function countExportedDeclarations(sourceFile: ts.SourceFile): number {
  let exportedDeclarationCount = 0

  for (const statement of sourceFile.statements) {
    if (ts.isExportAssignment(statement)) {
      exportedDeclarationCount += 1
      continue
    }

    if (
      ts.canHaveModifiers(statement) &&
      (ts
        .getModifiers(statement)
        ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword) ??
        false)
    ) {
      exportedDeclarationCount += 1
    }
  }

  return exportedDeclarationCount
}

function detectMeaningfulBoundarySignals(
  filePath: string,
  source: string
): readonly string[] {
  const signals = new Set<string>()
  const baseName = path.basename(filePath)

  if (BOUNDARY_SIGNAL_PATTERN.test(baseName)) {
    signals.add("boundary-name")
  }
  if (/\blazy\s*\(/u.test(source)) {
    signals.add("lazy-loading")
  }
  if (/\bSuspense\b/u.test(source)) {
    signals.add("suspense-boundary")
  }
  if (/\bProvider\b/u.test(source)) {
    signals.add("provider-boundary")
  }
  if (/\berrorElement\b/u.test(source) || /\bFallback\b/u.test(source)) {
    signals.add("error-loading-boundary")
  }

  return sortStrings([...signals])
}

function buildDirectImporters(
  parsedModules: ReadonlyMap<string, ParsedModuleData>
): Map<string, Set<string>> {
  const directImporters = new Map<string, Set<string>>()

  for (const [filePath, parsedModule] of parsedModules.entries()) {
    for (const dependency of parsedModule.directDependencies) {
      const importerSet = directImporters.get(dependency) ?? new Set<string>()
      importerSet.add(filePath)
      directImporters.set(dependency, importerSet)
    }
  }

  return directImporters
}

function computeForwardReachability(
  roots: readonly string[],
  parsedModules: ReadonlyMap<string, ParsedModuleData>
): Map<string, Set<string>> {
  const reachableFromRoots = new Map<string, Set<string>>()

  for (const root of roots) {
    const visited = new Set<string>()
    const queue = [root]

    while (queue.length > 0) {
      const current = queue.shift()
      if (!current || visited.has(current)) {
        continue
      }

      visited.add(current)
      const reachers = reachableFromRoots.get(current) ?? new Set<string>()
      reachers.add(root)
      reachableFromRoots.set(current, reachers)

      const dependencies = parsedModules.get(current)?.directDependencies ?? []
      for (const dependency of dependencies) {
        if (!visited.has(dependency)) {
          queue.push(dependency)
        }
      }
    }
  }

  return reachableFromRoots
}

function collectScopeEntries({
  scopeRootAbsolutePath,
  ignorePatterns,
  repoRoot,
}: {
  scopeRootAbsolutePath: string
  ignorePatterns: readonly string[]
  repoRoot: string
}): {
  readonly directories: readonly string[]
  readonly files: readonly string[]
  readonly ignoredFiles: readonly string[]
} {
  const directories: string[] = []
  const files: string[] = []
  const ignoredFiles: string[] = []

  walk(scopeRootAbsolutePath)

  return {
    directories: sortStrings(directories),
    files: sortStrings(files),
    ignoredFiles: sortStrings(ignoredFiles),
  }

  function walk(directoryPath: string) {
    for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
      const absoluteEntryPath = path.join(directoryPath, entry.name)
      const workspaceRelativePath = normalizeWorkspacePath(
        path.relative(repoRoot, absoluteEntryPath)
      )
      const scopeRelativePath = normalizeWorkspacePath(
        path.relative(scopeRootAbsolutePath, absoluteEntryPath)
      )

      if (
        entry.isDirectory() &&
        isIgnoredScopePath({
          scopeRelativePath,
          ignorePatterns,
          isDirectory: true,
        })
      ) {
        continue
      }

      if (entry.isDirectory()) {
        directories.push(workspaceRelativePath)
        walk(absoluteEntryPath)
        continue
      }

      if (
        isIgnoredScopePath({
          scopeRelativePath,
          ignorePatterns,
          isDirectory: false,
        })
      ) {
        ignoredFiles.push(workspaceRelativePath)
        continue
      }

      files.push(workspaceRelativePath)
    }
  }
}

function isIgnoredScopePath({
  scopeRelativePath,
  ignorePatterns,
  isDirectory,
}: {
  scopeRelativePath: string
  ignorePatterns: readonly string[]
  isDirectory: boolean
}): boolean {
  const candidatePath = scopeRelativePath || "."

  return ignorePatterns.some((pattern) => {
    if (path.matchesGlob(candidatePath, pattern)) {
      return true
    }

    if (isDirectory && path.matchesGlob(`${candidatePath}/`, pattern)) {
      return true
    }

    return false
  })
}

function normalizeResolvedSourcePath({
  resolvedFileName,
  repoRoot,
}: {
  resolvedFileName: string
  repoRoot: string
}): string | null {
  const normalizedResolvedFileName = path.normalize(resolvedFileName)

  if (!normalizedResolvedFileName.startsWith(path.normalize(repoRoot))) {
    return null
  }

  if (!/\.(ts|tsx|mts|cts)$/u.test(normalizedResolvedFileName)) {
    return null
  }

  return normalizeWorkspacePath(
    path.relative(repoRoot, normalizedResolvedFileName)
  )
}

function matchesAnyPattern(
  scopeRelativePath: string,
  patterns: readonly string[]
): boolean {
  return patterns.some((pattern) =>
    path.matchesGlob(scopeRelativePath, pattern)
  )
}

function isGovernedSourceFile(filePath: string): boolean {
  return /\.(ts|tsx)$/u.test(filePath)
}

function isPotentialInternalSpecifier(specifier: string): boolean {
  return specifier.startsWith(".") || specifier.startsWith("@/")
}

function isIgnoredAssetSpecifier(specifier: string): boolean {
  return /\.(css|scss|sass|less|styl|pcss)$/iu.test(specifier)
}

function isInsideSharedRoot(
  filePath: string,
  sharedRootSet: ReadonlySet<string>
): boolean {
  for (const sharedRoot of sharedRootSet) {
    if (filePath === sharedRoot || filePath.startsWith(`${sharedRoot}/`)) {
      return true
    }
  }

  return false
}

function normalizeWorkspacePath(value: string): string {
  return toPosixPath(value)
}

function inferReportTrust(
  unresolvedImportCount: number,
  warningThreshold: number
): FileSurvivalReportTrust {
  if (unresolvedImportCount === 0) {
    return "trusted"
  }

  return unresolvedImportCount > warningThreshold ? "degraded" : "caution"
}

function inferResolverIntegrityStatus(
  reportTrust: FileSurvivalReportTrust
): FileSurvivalResolverStats["integrityStatus"] {
  if (reportTrust === "trusted") {
    return "ok"
  }

  return reportTrust === "caution" ? "warning" : "degraded"
}

function inferRolloutStatus({
  findings,
  reportTrust,
}: {
  findings: readonly FileSurvivalFinding[]
  reportTrust: FileSurvivalReportTrust
}): FileSurvivalRolloutStatus {
  if (findings.some((finding) => finding.ciBlocking)) {
    return "blocked"
  }

  if (reportTrust !== "trusted" || findings.length > 0) {
    return "review"
  }

  return "pass"
}

function inferCiBlocking({
  category,
  confidence,
  protectedScopeIds,
  reportTrust,
  blockingPolicy,
}: {
  category: FileSurvivalFindingCategory
  confidence: FileSurvivalFindingConfidence
  protectedScopeIds: readonly string[]
  reportTrust: FileSurvivalReportTrust
  blockingPolicy: FileSurvivalRolloutDefinition["blockingPolicy"]
}): boolean {
  if (blockingPolicy.rolloutMode !== "block") {
    return false
  }

  if (
    protectedScopeIds.length > 0 &&
    blockingPolicy.protectedScopeBlockingCategories.includes(category) &&
    blockingPolicy.protectedScopeBlockingConfidence.includes(confidence)
  ) {
    return true
  }

  if (!blockingPolicy.blockingCategories.includes(category)) {
    return false
  }

  if (!blockingPolicy.blockingConfidence.includes(confidence)) {
    return false
  }

  if (reportTrust === "degraded" && protectedScopeIds.length === 0) {
    return false
  }

  return true
}

function inferProtectedScopeIds(
  filePath: string,
  rollout: FileSurvivalRolloutDefinition
): readonly string[] {
  const normalizedPath = normalizeWorkspacePath(filePath)
  return rollout.protectedScopes
    .filter((protectedScope) =>
      protectedScope.roots.some((root) => pathMatchesRoot(normalizedPath, root))
    )
    .map((protectedScope) => protectedScope.id)
    .sort((left, right) => left.localeCompare(right))
}

function pathMatchesRoot(filePath: string, root: string): boolean {
  const normalizedPath = normalizeWorkspacePath(filePath)
  const normalizedRoot = normalizeWorkspacePath(root)
  return (
    normalizedPath === normalizedRoot ||
    normalizedPath.startsWith(`${normalizedRoot}/`)
  )
}

function findLongestMatchingRoot<T extends { root: string }>(
  filePath: string,
  items: readonly T[]
): T | null {
  const normalizedPath = normalizeWorkspacePath(filePath)
  let bestMatch: T | null = null

  for (const item of items) {
    const normalizedRoot = normalizeWorkspacePath(item.root)
    if (!pathMatchesRoot(normalizedPath, normalizedRoot)) {
      continue
    }

    if (bestMatch === null || normalizedRoot.length > bestMatch.root.length) {
      bestMatch = item
    }
  }

  return bestMatch
}

function sortStrings(values: readonly string[]): string[] {
  return [...values].sort((left, right) => left.localeCompare(right))
}

function compareFindings(
  left: FileSurvivalFinding,
  right: FileSurvivalFinding
): number {
  if (left.ciBlocking !== right.ciBlocking) {
    return left.ciBlocking ? -1 : 1
  }

  const categoryComparison =
    CATEGORY_ORDER.indexOf(left.category) -
    CATEGORY_ORDER.indexOf(right.category)
  if (categoryComparison !== 0) {
    return categoryComparison
  }

  const confidenceComparison =
    CONFIDENCE_ORDER.indexOf(left.confidence) -
    CONFIDENCE_ORDER.indexOf(right.confidence)
  if (confidenceComparison !== 0) {
    return confidenceComparison
  }

  return left.path.localeCompare(right.path)
}

function renderFindingList(
  findings: readonly FileSurvivalFinding[],
  emptyState: string
): readonly string[] {
  if (findings.length === 0) {
    return [emptyState]
  }

  const lines: string[] = []

  for (const finding of findings) {
    lines.push(
      `- [${finding.ruleId}] [${finding.severity}/${finding.confidence}] \`${finding.path}\` -> ${finding.recommendedAction}`
    )
    lines.push(`  - Rule: ${finding.ruleName}`)
    lines.push(`  - Role: \`${finding.inferredRole}\``)
    lines.push(`  - Slice: \`${finding.slice}\``)
    lines.push(`  - Owner: \`${finding.owner}\``)
    lines.push(`  - Owner source: \`${finding.ownerSource}\``)
    lines.push(`  - Reason: ${finding.reason}`)
    lines.push(
      `  - Approved remediation: ${formatApprovedRemediation(finding.approvedRemediation)}`
    )
    lines.push(`  - CI blocking: ${finding.ciBlocking ? "yes" : "no"}`)
    lines.push(
      `  - Evidence: ${finding.evidenceRole.length > 0 ? finding.evidenceRole.map((item) => `\`${item}\``).join(", ") : "none"}`
    )
    lines.push(
      `  - Survival basis: ${finding.survivalBasis.length > 0 ? finding.survivalBasis.map((item) => `\`${item}\``).join(", ") : "none"}`
    )
    if (finding.importers.length > 0) {
      lines.push(
        `  - Importers (${String(finding.importerCount)}): ${finding.importers
          .slice(0, 5)
          .map((item) => `\`${item}\``)
          .join(", ")}`
      )
    }
    if (finding.notes && finding.notes.length > 0) {
      for (const note of finding.notes.slice(0, 3)) {
        lines.push(`  - Note: ${note}`)
      }
    }
  }

  return lines
}

function formatApprovedRemediation(
  remediation: FileSurvivalApprovedRemediation
): string {
  const targetZone =
    remediation.targetZone === null
      ? "no target zone"
      : `target ${remediation.targetZone}`
  const reviewState = remediation.requiresHumanReview
    ? "human review required"
    : "human review not required"
  const autofixState = remediation.autofixEligible
    ? "autofix eligible"
    : "manual fix"

  return `${remediation.kind}; ${targetZone}; ${autofixState}; ${reviewState}`
}

function renderOwnerAccountabilityList(
  entries: readonly FileSurvivalOwnerAccountabilityEntry[]
): readonly string[] {
  if (entries.length === 0) {
    return ["- No owner accountability entries."]
  }

  const lines: string[] = []

  for (const entry of entries) {
    lines.push(
      `- \`${entry.owner}\` [source=${entry.ownerSource}] -> ${String(entry.blockingFindingCount)} blocking / ${String(entry.findingCount)} total`
    )
    lines.push(
      `  - Severity mix: error=${String(entry.severityCounts.error)}, warning=${String(entry.severityCounts.warning)}, advisory=${String(entry.severityCounts.advisory)}`
    )
    lines.push(
      `  - Top paths: ${entry.topPaths.map((filePath) => `\`${filePath}\``).join(", ")}`
    )
  }

  return lines
}

function renderRemediationMatrix(
  entries: readonly FileSurvivalRemediationMatrixEntry[]
): readonly string[] {
  if (entries.length === 0) {
    return ["- No remediation entries."]
  }

  const lines: string[] = []

  for (const entry of entries) {
    lines.push(
      `- \`${entry.kind}\` -> ${String(entry.blockingFindingCount)} blocking / ${String(entry.findingCount)} total`
    )
    lines.push(
      `  - Owners: ${entry.owners.map((owner) => `\`${owner}\``).join(", ")}`
    )
    lines.push(
      `  - Top paths: ${entry.topPaths.map((filePath) => `\`${filePath}\``).join(", ")}`
    )
  }

  return lines
}

function formatInlineCodeList(values: readonly string[]): string {
  if (values.length === 0) {
    return "none"
  }

  return values.map((item) => `\`${item}\``).join(", ")
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}
