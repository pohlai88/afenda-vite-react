import { spawnSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

import type {
  AfendaConfig,
  GovernanceCiBehavior,
  GovernanceDomainDefinition,
  GovernanceEnforcementMaturity,
  GovernanceLifecycleStatus,
  GovernanceSeverity,
  GovernanceTier,
} from "../config/afenda-config.js"

export interface GovernanceIssue {
  readonly scope: string
  readonly message: string
}

export interface GovernanceWaiver {
  readonly id: string
  readonly policyId: string
  readonly domainId: string
  readonly paths: readonly string[]
  readonly reason: string
  readonly owner: string
  readonly approvedBy: string
  readonly createdAt: string
  readonly expiresAt: string
  readonly severityCap: GovernanceSeverity
  readonly remediationPlan: string
}

export interface GovernanceWaiverRegistry {
  readonly version: number
  readonly waivers: readonly GovernanceWaiver[]
}

export interface GovernanceWaiverViolation {
  readonly waiverId: string
  readonly domainId: string
  readonly severity: GovernanceSeverity
  readonly message: string
}

export interface GovernanceWaiverReport {
  readonly generatedAt: string
  readonly registryPath: string
  readonly waiverCount: number
  readonly activeWaiverCount: number
  readonly expiredWaiverCount: number
  readonly activeWaivers: readonly GovernanceWaiver[]
  readonly valid: boolean
  readonly violations: readonly GovernanceWaiverViolation[]
}

export interface GovernanceCheckExecution {
  readonly id: string
  readonly command: string
  readonly scriptPath: string
  readonly status: "passed" | "failed"
  readonly exitCode: number | null
  readonly durationMs: number
}

export interface GovernanceDomainViolation {
  readonly checkId: string
  readonly severity: GovernanceSeverity
  readonly message: string
}

export interface GovernanceDomainReport {
  readonly domainId: string
  readonly title: string
  readonly owner: string
  readonly generatedAt: string
  readonly lifecycleStatus: GovernanceLifecycleStatus
  readonly enforcementMaturity: GovernanceEnforcementMaturity
  readonly defaultSeverity: GovernanceSeverity
  readonly tier: GovernanceTier
  readonly ciBehavior: GovernanceCiBehavior
  readonly localConfig: string
  readonly checks: readonly GovernanceCheckExecution[]
  readonly violations: readonly GovernanceDomainViolation[]
  readonly evidenceComplete: boolean
  readonly driftDetected: boolean
  readonly ciOutcome: "passed" | "observed" | "warned" | "blocked"
}

interface SelfManagedGovernanceEvidenceReport {
  readonly governanceDomain: GovernanceDomainReport
}

export interface GovernanceAggregateSummary {
  readonly totalDomains: number
  readonly passedDomains: number
  readonly warnedDomains: number
  readonly blockedDomains: number
  readonly observedDomains: number
  readonly lifecycleCounts: Readonly<Record<GovernanceLifecycleStatus, number>>
  readonly enforcementMaturityCounts: Readonly<
    Record<GovernanceEnforcementMaturity, number>
  >
  readonly violationSeverityCounts: Readonly<Record<GovernanceSeverity, number>>
  readonly activeWaiverCount: number
  readonly expiredWaiverCount: number
  readonly evidenceCompleteCount: number
  readonly missingEvidenceDomains: readonly string[]
  readonly driftedDomains: readonly string[]
  readonly blockedDomainIds: readonly string[]
  readonly warnedDomainIds: readonly string[]
  readonly finalVerdict: "pass" | "warn" | "block"
  readonly finalVerdictExplanation: string
  readonly verdictReasons: readonly (
    | "missing-evidence"
    | "blocked-domain-failure"
    | "waiver-violation"
    | "warned-domain"
    | "all-clear"
  )[]
}

export interface GovernanceAggregateReport {
  readonly generatedAt: string
  readonly evidenceRoot: string
  readonly domains: readonly GovernanceDomainReport[]
  readonly waivers: GovernanceWaiverReport
  readonly summary: GovernanceAggregateSummary
}

export interface GovernanceRegisterSnapshot {
  readonly aggregateGeneratedAt: string
  readonly registerPath: string
  readonly finalVerdict: "pass" | "warn" | "block"
  readonly blockedDomainIds: readonly string[]
  readonly warnedDomainIds: readonly string[]
  readonly domainRows: readonly {
    readonly domainId: string
    readonly evidencePath: string
    readonly ciBehavior: GovernanceCiBehavior
  }[]
}

export function normalizeRelativePath(value: string): string {
  return value.split(path.sep).join("/")
}

export async function readRootPackageScripts(
  repoRoot: string
): Promise<Record<string, string>> {
  const manifestPath = path.join(repoRoot, "package.json")
  const manifestRaw = await fs.readFile(manifestPath, "utf8")
  const manifest = JSON.parse(manifestRaw) as {
    readonly scripts?: Record<string, string>
  }

  return manifest.scripts ?? {}
}

export function evaluateGovernanceRegistry(
  config: AfendaConfig
): GovernanceIssue[] {
  const issues: GovernanceIssue[] = []
  const seenFamilies = new Set<string>()
  const seenDomainIds = new Set<string>()
  const seenGateIds = new Set<string>()
  const seenEvidencePaths = new Set<string>()
  const evidenceRoot = normalizeRelativePath(config.governance.evidence.root)

  for (const family of config.governance.idFamilies) {
    if (seenFamilies.has(family)) {
      issues.push({
        scope: "governance.idFamilies",
        message: `Duplicate governance id family "${family}".`,
      })
    }
    seenFamilies.add(family)
  }

  for (const domain of config.governance.domains) {
    if (seenDomainIds.has(domain.id)) {
      issues.push({
        scope: `governance.domains.${domain.id}`,
        message: `Duplicate governance domain id "${domain.id}".`,
      })
    }
    seenDomainIds.add(domain.id)

    if (!matchesAnyIdFamily(domain.id, config.governance.idFamilies)) {
      issues.push({
        scope: `governance.domains.${domain.id}.id`,
        message: `Domain id "${domain.id}" does not match any configured governance id family.`,
      })
    }

    if (!isDescendantOrSelf(domain.evidencePath, evidenceRoot)) {
      issues.push({
        scope: `governance.domains.${domain.id}.evidencePath`,
        message: `Evidence path "${domain.evidencePath}" must live under governance.evidence.root (${evidenceRoot}).`,
      })
    }

    if (seenEvidencePaths.has(domain.evidencePath)) {
      issues.push({
        scope: `governance.domains.${domain.id}.evidencePath`,
        message: `Evidence path "${domain.evidencePath}" is duplicated.`,
      })
    }
    seenEvidencePaths.add(domain.evidencePath)

    const expectedCiBehavior = expectedCiBehaviorForTier(domain.tier)
    if (domain.ciBehavior !== expectedCiBehavior) {
      issues.push({
        scope: `governance.domains.${domain.id}.ciBehavior`,
        message: `Tier ${domain.tier} must use ciBehavior "${expectedCiBehavior}", received "${domain.ciBehavior}".`,
      })
    }

    const lifecycleIssue = validateLifecycleBehavior(domain)
    if (lifecycleIssue) {
      issues.push({
        scope: `governance.domains.${domain.id}`,
        message: lifecycleIssue,
      })
    }

    const maturityIssue = validateMaturityBehavior(domain)
    if (maturityIssue) {
      issues.push({
        scope: `governance.domains.${domain.id}`,
        message: maturityIssue,
      })
    }

    if (!/^\d+d$/u.test(domain.reviewCadence)) {
      issues.push({
        scope: `governance.domains.${domain.id}.reviewCadence`,
        message: `Review cadence "${domain.reviewCadence}" must use <days>d form, for example 30d.`,
      })
    }

    const seenCheckIds = new Set<string>()
    for (const check of domain.checks) {
      if (seenCheckIds.has(check.id)) {
        issues.push({
          scope: `governance.domains.${domain.id}.checks`,
          message: `Duplicate check id "${check.id}" in domain "${domain.id}".`,
        })
      }
      seenCheckIds.add(check.id)
    }
  }

  const reservedEvidencePaths = [
    config.governance.evidence.aggregateReportPath,
    config.governance.evidence.summaryReportPath,
    config.governance.waivers.reportPath,
    config.governance.evidence.registerSnapshotPath,
  ]

  for (const evidencePath of reservedEvidencePaths) {
    if (!isDescendantOrSelf(evidencePath, evidenceRoot)) {
      issues.push({
        scope: "governance.evidence",
        message: `Reserved evidence path "${evidencePath}" must live under governance.evidence.root (${evidenceRoot}).`,
      })
    }
    if (seenEvidencePaths.has(evidencePath)) {
      issues.push({
        scope: "governance.evidence",
        message: `Reserved evidence path "${evidencePath}" conflicts with a domain evidence path.`,
      })
    }
  }

  if (
    !isDescendantOrSelf(
      config.governance.evidence.registerPath,
      "docs/architecture/governance/generated"
    )
  ) {
    issues.push({
      scope: "governance.evidence.registerPath",
      message:
        'Governance register path must live under "docs/architecture/governance/generated".',
    })
  }

  for (const gate of config.governance.gates) {
    if (seenGateIds.has(gate.id)) {
      issues.push({
        scope: `governance.gates.${gate.id}`,
        message: `Duplicate governance gate id "${gate.id}".`,
      })
    }
    seenGateIds.add(gate.id)

    if (!gate.id.startsWith("GOV-CI-")) {
      issues.push({
        scope: `governance.gates.${gate.id}.id`,
        message: `Gate id "${gate.id}" must start with "GOV-CI-".`,
      })
    }

    const expectedGateBehavior = expectedCiBehaviorForGate(gate.id)
    if (expectedGateBehavior && gate.ciBehavior !== expectedGateBehavior) {
      issues.push({
        scope: `governance.gates.${gate.id}.ciBehavior`,
        message: `Gate "${gate.id}" must use ciBehavior "${expectedGateBehavior}".`,
      })
    }
  }

  return issues
}

export async function evaluateGovernanceBindings(
  config: AfendaConfig,
  repoRoot: string
): Promise<GovernanceIssue[]> {
  const issues: GovernanceIssue[] = []
  const rootScripts = await readRootPackageScripts(repoRoot)

  for (const domain of config.governance.domains) {
    await assertPathExists(
      repoRoot,
      domain.docs.primary,
      `governance.domains.${domain.id}.docs.primary`,
      issues
    )

    for (const referencePath of domain.docs.references) {
      await assertPathExists(
        repoRoot,
        referencePath,
        `governance.domains.${domain.id}.docs.references`,
        issues
      )
    }

    await assertPathExists(
      repoRoot,
      domain.localConfig,
      `governance.domains.${domain.id}.localConfig`,
      issues
    )

    for (const check of domain.checks) {
      await assertPathExists(
        repoRoot,
        check.scriptPath,
        `governance.domains.${domain.id}.checks.${check.id}.scriptPath`,
        issues
      )
      assertPnpmRunScriptExists(
        check.command,
        rootScripts,
        `governance.domains.${domain.id}.checks.${check.id}.command`,
        issues
      )
    }

    await assertPathExists(
      repoRoot,
      domain.report.scriptPath,
      `governance.domains.${domain.id}.report.scriptPath`,
      issues
    )
    assertPnpmRunScriptExists(
      domain.report.command,
      rootScripts,
      `governance.domains.${domain.id}.report.command`,
      issues
    )
  }

  for (const gate of config.governance.gates) {
    await assertPathExists(
      repoRoot,
      gate.scriptPath,
      `governance.gates.${gate.id}.scriptPath`,
      issues
    )
    assertPnpmRunScriptExists(
      gate.command,
      rootScripts,
      `governance.gates.${gate.id}.command`,
      issues
    )
  }

  await assertPathExists(
    repoRoot,
    config.governance.waivers.registryPath,
    "governance.waivers.registryPath",
    issues
  )

  return issues
}

export async function loadGovernanceWaiverRegistry(
  repoRoot: string,
  relativePath: string
): Promise<GovernanceWaiverRegistry> {
  const absolutePath = path.join(repoRoot, relativePath)
  const raw = await fs.readFile(absolutePath, "utf8")
  return JSON.parse(raw) as GovernanceWaiverRegistry
}

export function evaluateGovernanceWaivers(
  config: AfendaConfig,
  waiverRegistry: GovernanceWaiverRegistry,
  registryPath: string,
  referenceDate: Date
): GovernanceWaiverReport {
  const violations: GovernanceWaiverViolation[] = []
  const domainMap = new Map(
    config.governance.domains.map((domain) => [domain.id, domain] as const)
  )
  const knownDomainIds = new Set(
    config.governance.domains.map((domain) => domain.id)
  )
  const knownPolicyPrefixes = new Set(config.governance.idFamilies)
  const seenWaiverIds = new Set<string>()
  let activeWaiverCount = 0
  let expiredWaiverCount = 0
  const activeWaivers: GovernanceWaiver[] = []

  for (const waiver of waiverRegistry.waivers) {
    if (seenWaiverIds.has(waiver.id)) {
      violations.push({
        waiverId: waiver.id,
        domainId: waiver.domainId,
        severity: "fatal",
        message: `Waiver id "${waiver.id}" is duplicated.`,
      })
    }
    seenWaiverIds.add(waiver.id)

    if (!knownDomainIds.has(waiver.domainId)) {
      violations.push({
        waiverId: waiver.id,
        domainId: waiver.domainId,
        severity: "fatal",
        message: `Waiver domainId "${waiver.domainId}" is not registered.`,
      })
    }

    const boundDomain = domainMap.get(waiver.domainId)
    if (boundDomain?.lifecycleStatus === "retired") {
      violations.push({
        waiverId: waiver.id,
        domainId: waiver.domainId,
        severity: "fatal",
        message: `Waiver domainId "${waiver.domainId}" targets a retired domain.`,
      })
    }

    if (!matchesAnyIdFamily(waiver.policyId, [...knownPolicyPrefixes])) {
      violations.push({
        waiverId: waiver.id,
        domainId: waiver.domainId,
        severity: "fatal",
        message: `Waiver policyId "${waiver.policyId}" does not match a configured governance id family.`,
      })
    }

    if (waiver.paths.length === 0) {
      violations.push({
        waiverId: waiver.id,
        domainId: waiver.domainId,
        severity: "fatal",
        message: "Waiver must declare at least one target path.",
      })
    }

    for (const field of [
      ["reason", waiver.reason],
      ["owner", waiver.owner],
      ["approvedBy", waiver.approvedBy],
      ["remediationPlan", waiver.remediationPlan],
    ] as const) {
      if (!field[1].trim()) {
        violations.push({
          waiverId: waiver.id,
          domainId: waiver.domainId,
          severity: "fatal",
          message: `Waiver field "${field[0]}" must be non-empty.`,
        })
      }
    }

    const createdAt = Date.parse(waiver.createdAt)
    const expiresAt = Date.parse(waiver.expiresAt)
    if (Number.isNaN(createdAt) || Number.isNaN(expiresAt)) {
      violations.push({
        waiverId: waiver.id,
        domainId: waiver.domainId,
        severity: "fatal",
        message: "Waiver createdAt and expiresAt must be valid ISO dates.",
      })
      continue
    }

    if (expiresAt <= createdAt) {
      violations.push({
        waiverId: waiver.id,
        domainId: waiver.domainId,
        severity: "fatal",
        message: "Waiver expiresAt must be later than createdAt.",
      })
    }

    if (referenceDate.getTime() > expiresAt) {
      expiredWaiverCount += 1
      violations.push({
        waiverId: waiver.id,
        domainId: waiver.domainId,
        severity: "fatal",
        message: `Waiver expired on ${waiver.expiresAt}.`,
      })
    } else {
      activeWaiverCount += 1
      activeWaivers.push(waiver)
    }
  }

  return {
    generatedAt: referenceDate.toISOString(),
    registryPath,
    waiverCount: waiverRegistry.waivers.length,
    activeWaiverCount,
    expiredWaiverCount,
    activeWaivers,
    valid: violations.length === 0,
    violations,
  }
}

export async function writeGovernanceWaiverReport(
  repoRoot: string,
  config: AfendaConfig,
  report: GovernanceWaiverReport
): Promise<void> {
  await writeJsonFile(
    path.join(repoRoot, config.governance.waivers.reportPath),
    report
  )
}

export async function runGovernanceChecks(
  config: AfendaConfig,
  repoRoot: string,
  generatedAt: Date,
  options?: {
    readonly writeReports?: boolean
  }
): Promise<{
  readonly reports: readonly GovernanceDomainReport[]
  readonly blockingFailures: readonly string[]
  readonly warningFailures: readonly string[]
}> {
  const writeReports = options?.writeReports ?? true
  const reports: GovernanceDomainReport[] = []
  const blockingFailures: string[] = []
  const warningFailures: string[] = []

  for (const domain of config.governance.domains) {
    const executions: GovernanceCheckExecution[] = []
    const violations: GovernanceDomainViolation[] = []
    const reportPath = path.join(repoRoot, domain.evidencePath)
    const originalReportContent = writeReports
      ? null
      : await fs.readFile(reportPath, "utf8").catch(() => null)

    if (writeReports) {
      await fs.rm(reportPath, { force: true }).catch(() => undefined)
    }

    for (const check of domain.checks) {
      const startedAt = Date.now()
      const command =
        !writeReports && !check.command.includes("--read-only")
          ? `${check.command} -- --read-only`
          : check.command
      const result = spawnSync(command, {
        cwd: repoRoot,
        encoding: "utf8",
        shell: true,
      })
      const durationMs = Date.now() - startedAt
      const exitCode = typeof result.status === "number" ? result.status : 1

      if (result.stdout) {
        process.stdout.write(result.stdout)
      }
      if (result.stderr) {
        process.stderr.write(result.stderr)
      }

      executions.push({
        id: check.id,
        command,
        scriptPath: check.scriptPath,
        status: exitCode === 0 ? "passed" : "failed",
        exitCode,
        durationMs,
      })

      if (exitCode !== 0) {
        violations.push({
          checkId: check.id,
          severity: domain.defaultSeverity,
          message: `Check "${command}" failed with exit code ${String(exitCode)}.`,
        })
      }
    }

    const selfManagedReport = await readGovernanceDomainReportFromEvidencePath(
      reportPath,
      domain.id
    )
    const report =
      selfManagedReport ??
      buildGovernanceDomainReport(domain, generatedAt, executions, violations)
    reports.push(report)
    if (writeReports && !selfManagedReport) {
      await writeJsonFile(reportPath, report)
    }
    if (!writeReports) {
      if (originalReportContent === null) {
        await fs.rm(reportPath, { force: true }).catch(() => undefined)
      } else {
        await fs.writeFile(reportPath, originalReportContent, "utf8")
      }
    }

    if (violations.length === 0) {
      continue
    }

    if (domain.ciBehavior === "block") {
      blockingFailures.push(domain.id)
    } else if (domain.ciBehavior === "warn") {
      warningFailures.push(domain.id)
    }
  }

  return { reports, blockingFailures, warningFailures }
}

export async function loadGovernanceDomainReports(
  config: AfendaConfig,
  repoRoot: string
): Promise<readonly GovernanceDomainReport[]> {
  const reports: GovernanceDomainReport[] = []

  for (const domain of config.governance.domains) {
    const reportPath = path.join(repoRoot, domain.evidencePath)
    const raw = await fs.readFile(reportPath, "utf8")
    const parsed = JSON.parse(raw) as unknown
    reports.push(extractGovernanceDomainReport(parsed, domain.id))
  }

  return reports
}

export function buildGovernanceAggregateReport(
  config: AfendaConfig,
  domainReports: readonly GovernanceDomainReport[],
  waiverReport: GovernanceWaiverReport,
  generatedAt: Date
): GovernanceAggregateReport {
  const effectiveDomainReports = applyWaiversToDomainReports(
    domainReports,
    waiverReport
  )
  const registeredDomains = config.governance.domains
  const missingEvidenceDomains = config.governance.domains
    .map((domain) => domain.id)
    .filter(
      (domainId) =>
        !effectiveDomainReports.some((report) => report.domainId === domainId)
    )
  const driftedDomains = registeredDomains
    .filter(
      (domain) =>
        domain.lifecycleStatus === "drifted" ||
        effectiveDomainReports.some(
          (report) => report.domainId === domain.id && report.driftDetected
        )
    )
    .map((domain) => domain.id)
  const blockedDomainIds = effectiveDomainReports
    .filter((report) => report.ciOutcome === "blocked")
    .map((report) => report.domainId)
  const warnedDomainIds = effectiveDomainReports
    .filter((report) => report.ciOutcome === "warned")
    .map((report) => report.domainId)
  const evidenceCompleteCount = effectiveDomainReports.filter(
    (report) => report.evidenceComplete
  ).length
  const lifecycleCounts = countByEnum<GovernanceLifecycleStatus>(
    ["watcher", "bound", "partial", "enforced", "drifted", "retired"],
    registeredDomains.map((domain) => domain.lifecycleStatus)
  )
  const enforcementMaturityCounts = countByEnum<GovernanceEnforcementMaturity>(
    ["defined", "measured", "warned", "blocking", "runtime-enforced"],
    registeredDomains.map((domain) => domain.enforcementMaturity)
  )
  const violationSeverityCounts = countByEnum<GovernanceSeverity>(
    ["info", "warn", "error", "fatal"],
    [
      ...effectiveDomainReports.flatMap((report) =>
        report.violations.map((violation) => violation.severity)
      ),
      ...waiverReport.violations.map((violation) => violation.severity),
    ]
  )
  const verdictReasons = resolveVerdictReasons({
    blockedDomainIds,
    warnedDomainIds,
    missingEvidenceDomains,
    waiverReport,
  })
  const finalVerdict = resolveFinalVerdict({ verdictReasons })
  const finalVerdictExplanation = explainFinalVerdict({
    finalVerdict,
    verdictReasons,
    blockedDomainIds,
    warnedDomainIds,
    missingEvidenceDomains,
    waiverReport,
    evidenceCompleteCount,
    totalDomains: registeredDomains.length,
  })

  const summary: GovernanceAggregateSummary = {
    totalDomains: registeredDomains.length,
    passedDomains: effectiveDomainReports.filter(
      (report) => report.ciOutcome === "passed"
    ).length,
    warnedDomains: effectiveDomainReports.filter(
      (report) => report.ciOutcome === "warned"
    ).length,
    blockedDomains: effectiveDomainReports.filter(
      (report) => report.ciOutcome === "blocked"
    ).length,
    observedDomains: effectiveDomainReports.filter(
      (report) => report.ciOutcome === "observed"
    ).length,
    lifecycleCounts,
    enforcementMaturityCounts,
    violationSeverityCounts,
    activeWaiverCount: waiverReport.activeWaiverCount,
    expiredWaiverCount: waiverReport.expiredWaiverCount,
    evidenceCompleteCount,
    missingEvidenceDomains,
    driftedDomains,
    blockedDomainIds,
    warnedDomainIds,
    finalVerdict,
    finalVerdictExplanation,
    verdictReasons,
  }

  return {
    generatedAt: generatedAt.toISOString(),
    evidenceRoot: config.governance.evidence.root,
    domains: effectiveDomainReports,
    waivers: waiverReport,
    summary,
  }
}

export function renderGovernanceRegisterMarkdown(
  config: AfendaConfig,
  report: GovernanceAggregateReport
): string {
  const lines = [
    "---",
    "title: Governance register",
    "description: Generated register of governance domains, evidence paths, and CI behavior.",
    "status: active",
    "owner: governance-toolchain",
    "truthStatus: supporting",
    "docClass: supporting-doc",
    "relatedDomain: governance-registry",
    "order: 10",
    "---",
    "",
    "<!-- This file is auto-generated by `pnpm run script:generate-governance-register`. -->",
    "",
    "# Governance register",
    "",
    "This register is generated from `scripts/afenda.config.json` and the latest governance evidence under `.artifacts/reports/governance/`.",
    "",
    "## Summary",
    "",
    `- Final verdict: \`${report.summary.finalVerdict}\``,
    `- Verdict explanation: ${report.summary.finalVerdictExplanation}`,
    `- Verdict reasons: ${report.summary.verdictReasons.join(", ")}`,
    `- Domains: ${String(report.summary.totalDomains)}`,
    `- Passed: ${String(report.summary.passedDomains)}`,
    `- Warned: ${String(report.summary.warnedDomains)}`,
    `- Blocked: ${String(report.summary.blockedDomains)}`,
    `- Observed: ${String(report.summary.observedDomains)}`,
    `- Evidence complete: ${String(report.summary.evidenceCompleteCount)} / ${String(report.summary.totalDomains)}`,
    `- Active waivers: ${String(report.summary.activeWaiverCount)}`,
    `- Expired waivers: ${String(report.summary.expiredWaiverCount)}`,
    "",
    "## Verdict details",
    "",
    "- Lifecycle counts:",
    `  watcher=${String(report.summary.lifecycleCounts.watcher)}, bound=${String(report.summary.lifecycleCounts.bound)}, partial=${String(report.summary.lifecycleCounts.partial)}, enforced=${String(report.summary.lifecycleCounts.enforced)}, drifted=${String(report.summary.lifecycleCounts.drifted)}, retired=${String(report.summary.lifecycleCounts.retired)}`,
    "- Enforcement maturity counts:",
    `  defined=${String(report.summary.enforcementMaturityCounts.defined)}, measured=${String(report.summary.enforcementMaturityCounts.measured)}, warned=${String(report.summary.enforcementMaturityCounts.warned)}, blocking=${String(report.summary.enforcementMaturityCounts.blocking)}, runtime-enforced=${String(report.summary.enforcementMaturityCounts["runtime-enforced"])}`,
    "- Violation severity counts:",
    `  info=${String(report.summary.violationSeverityCounts.info)}, warn=${String(report.summary.violationSeverityCounts.warn)}, error=${String(report.summary.violationSeverityCounts.error)}, fatal=${String(report.summary.violationSeverityCounts.fatal)}`,
    `- Blocked domains: ${report.summary.blockedDomainIds.length > 0 ? report.summary.blockedDomainIds.map((domainId) => `\`${domainId}\``).join(", ") : "none"}`,
    `- Warned domains: ${report.summary.warnedDomainIds.length > 0 ? report.summary.warnedDomainIds.map((domainId) => `\`${domainId}\``).join(", ") : "none"}`,
    "",
    "## Domains",
    "",
    "| Domain | Title | Lifecycle | Maturity | CI behavior | Evidence | Local config |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ]

  for (const domain of config.governance.domains) {
    lines.push(
      `| \`${domain.id}\` | ${escapeMarkdownTable(domain.title)} | \`${domain.lifecycleStatus}\` | \`${domain.enforcementMaturity}\` | \`${domain.ciBehavior}\` | \`${domain.evidencePath}\` | \`${domain.localConfig}\` |`
    )
  }

  lines.push(
    "",
    "## Gates",
    "",
    "| Gate | Title | CI behavior | Command |",
    "| --- | --- | --- | --- |"
  )

  for (const gate of config.governance.gates) {
    lines.push(
      `| \`${gate.id}\` | ${escapeMarkdownTable(gate.title)} | \`${gate.ciBehavior}\` | \`${gate.command}\` |`
    )
  }

  if (report.summary.missingEvidenceDomains.length > 0) {
    lines.push("", "## Missing evidence", "")
    for (const domainId of report.summary.missingEvidenceDomains) {
      lines.push(`- \`${domainId}\``)
    }
  }

  return `${lines.join("\n")}\n`
}

export function renderGovernanceSummaryMarkdown(
  report: GovernanceAggregateReport
): string {
  return [
    "# Governance summary",
    "",
    `- Generated at: ${report.generatedAt}`,
    `- Final verdict: \`${report.summary.finalVerdict}\``,
    `- Verdict explanation: ${report.summary.finalVerdictExplanation}`,
    `- Verdict reasons: ${report.summary.verdictReasons.join(", ")}`,
    `- Domains: ${String(report.summary.totalDomains)}`,
    `- Evidence complete: ${String(report.summary.evidenceCompleteCount)} / ${String(report.summary.totalDomains)}`,
    `- Active waivers: ${String(report.summary.activeWaiverCount)}`,
    `- Expired waivers: ${String(report.summary.expiredWaiverCount)}`,
    `- Blocked domains: ${report.summary.blockedDomainIds.length > 0 ? report.summary.blockedDomainIds.join(", ") : "none"}`,
    `- Warned domains: ${report.summary.warnedDomainIds.length > 0 ? report.summary.warnedDomainIds.join(", ") : "none"}`,
    "",
    "## Lifecycle counts",
    "",
    `- watcher: ${String(report.summary.lifecycleCounts.watcher)}`,
    `- bound: ${String(report.summary.lifecycleCounts.bound)}`,
    `- partial: ${String(report.summary.lifecycleCounts.partial)}`,
    `- enforced: ${String(report.summary.lifecycleCounts.enforced)}`,
    `- drifted: ${String(report.summary.lifecycleCounts.drifted)}`,
    `- retired: ${String(report.summary.lifecycleCounts.retired)}`,
    "",
    "## Enforcement maturity counts",
    "",
    `- defined: ${String(report.summary.enforcementMaturityCounts.defined)}`,
    `- measured: ${String(report.summary.enforcementMaturityCounts.measured)}`,
    `- warned: ${String(report.summary.enforcementMaturityCounts.warned)}`,
    `- blocking: ${String(report.summary.enforcementMaturityCounts.blocking)}`,
    `- runtime-enforced: ${String(report.summary.enforcementMaturityCounts["runtime-enforced"])}`,
    "",
    "## Violation severity counts",
    "",
    `- info: ${String(report.summary.violationSeverityCounts.info)}`,
    `- warn: ${String(report.summary.violationSeverityCounts.warn)}`,
    `- error: ${String(report.summary.violationSeverityCounts.error)}`,
    `- fatal: ${String(report.summary.violationSeverityCounts.fatal)}`,
    "",
  ].join("\n")
}

export function buildGovernanceRegisterSnapshot(
  config: AfendaConfig,
  report: GovernanceAggregateReport
): GovernanceRegisterSnapshot {
  return {
    aggregateGeneratedAt: report.generatedAt,
    registerPath: config.governance.evidence.registerPath,
    finalVerdict: report.summary.finalVerdict,
    blockedDomainIds: report.summary.blockedDomainIds,
    warnedDomainIds: report.summary.warnedDomainIds,
    domainRows: config.governance.domains.map((domain) => ({
      domainId: domain.id,
      evidencePath: domain.evidencePath,
      ciBehavior: domain.ciBehavior,
    })),
  }
}

export function evaluateGovernanceRegisterConsistency(
  config: AfendaConfig,
  report: GovernanceAggregateReport,
  snapshot: GovernanceRegisterSnapshot
): GovernanceIssue[] {
  const issues: GovernanceIssue[] = []

  if (snapshot.aggregateGeneratedAt !== report.generatedAt) {
    issues.push({
      scope: "governance.registerSnapshot",
      message:
        "Register snapshot aggregateGeneratedAt does not match the aggregate report.",
    })
  }

  if (snapshot.registerPath !== config.governance.evidence.registerPath) {
    issues.push({
      scope: "governance.registerSnapshot",
      message:
        "Register snapshot registerPath does not match governance.evidence.registerPath.",
    })
  }

  if (snapshot.finalVerdict !== report.summary.finalVerdict) {
    issues.push({
      scope: "governance.registerSnapshot",
      message:
        "Register snapshot finalVerdict does not match aggregate summary finalVerdict.",
    })
  }

  if (
    snapshot.blockedDomainIds.join("|") !==
    report.summary.blockedDomainIds.join("|")
  ) {
    issues.push({
      scope: "governance.registerSnapshot",
      message:
        "Register snapshot blockedDomainIds do not match aggregate summary blockedDomainIds.",
    })
  }

  if (
    snapshot.warnedDomainIds.join("|") !==
    report.summary.warnedDomainIds.join("|")
  ) {
    issues.push({
      scope: "governance.registerSnapshot",
      message:
        "Register snapshot warnedDomainIds do not match aggregate summary warnedDomainIds.",
    })
  }

  if (snapshot.domainRows.length !== config.governance.domains.length) {
    issues.push({
      scope: "governance.registerSnapshot",
      message:
        "Register snapshot domain row count does not match configured governance domains.",
    })
  }

  for (const domain of config.governance.domains) {
    const row = snapshot.domainRows.find((item) => item.domainId === domain.id)
    if (!row) {
      issues.push({
        scope: "governance.registerSnapshot",
        message: `Register snapshot is missing row for domain "${domain.id}".`,
      })
      continue
    }

    if (row.evidencePath !== domain.evidencePath) {
      issues.push({
        scope: "governance.registerSnapshot",
        message: `Register snapshot evidencePath for "${domain.id}" does not match afenda.config.`,
      })
    }

    if (row.ciBehavior !== domain.ciBehavior) {
      issues.push({
        scope: "governance.registerSnapshot",
        message: `Register snapshot ciBehavior for "${domain.id}" does not match afenda.config.`,
      })
    }
  }

  return issues
}

export async function writeJsonFile(
  filePath: string,
  value: unknown
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8")
}

function buildGovernanceDomainReport(
  domain: GovernanceDomainDefinition,
  generatedAt: Date,
  executions: readonly GovernanceCheckExecution[],
  violations: readonly GovernanceDomainViolation[]
): GovernanceDomainReport {
  const hasFailure = violations.length > 0

  return {
    domainId: domain.id,
    title: domain.title,
    owner: domain.owner,
    generatedAt: generatedAt.toISOString(),
    lifecycleStatus: domain.lifecycleStatus,
    enforcementMaturity: domain.enforcementMaturity,
    defaultSeverity: domain.defaultSeverity,
    tier: domain.tier,
    ciBehavior: domain.ciBehavior,
    localConfig: domain.localConfig,
    checks: executions,
    violations,
    evidenceComplete: true,
    driftDetected: hasFailure || domain.lifecycleStatus === "drifted",
    ciOutcome: resolveCiOutcome(domain.ciBehavior, hasFailure),
  }
}

function resolveCiOutcome(
  ciBehavior: GovernanceCiBehavior,
  hasFailure: boolean
): GovernanceDomainReport["ciOutcome"] {
  if (!hasFailure) {
    return "passed"
  }
  if (ciBehavior === "block") {
    return "blocked"
  }
  if (ciBehavior === "warn") {
    return "warned"
  }
  return "observed"
}

function resolveFinalVerdict(input: {
  readonly verdictReasons: readonly GovernanceAggregateSummary["verdictReasons"][number][]
}): "pass" | "warn" | "block" {
  if (
    input.verdictReasons.includes("missing-evidence") ||
    input.verdictReasons.includes("blocked-domain-failure") ||
    input.verdictReasons.includes("waiver-violation")
  ) {
    return "block"
  }

  if (input.verdictReasons.includes("warned-domain")) {
    return "warn"
  }

  return "pass"
}

function explainFinalVerdict(input: {
  readonly finalVerdict: "pass" | "warn" | "block"
  readonly verdictReasons: readonly GovernanceAggregateSummary["verdictReasons"][number][]
  readonly blockedDomainIds: readonly string[]
  readonly warnedDomainIds: readonly string[]
  readonly missingEvidenceDomains: readonly string[]
  readonly waiverReport: GovernanceWaiverReport
  readonly evidenceCompleteCount: number
  readonly totalDomains: number
}): string {
  if (input.finalVerdict === "block") {
    const reasons: string[] = []
    if (input.verdictReasons.includes("blocked-domain-failure")) {
      reasons.push(
        `blocking domains failed (${input.blockedDomainIds.join(", ")})`
      )
    }
    if (input.verdictReasons.includes("missing-evidence")) {
      reasons.push(
        `required evidence is missing for ${input.missingEvidenceDomains.join(", ")}`
      )
    }
    if (input.verdictReasons.includes("waiver-violation")) {
      reasons.push("waiver policy violations are present")
    }
    return `block: ${reasons.join("; ")}`
  }

  if (input.finalVerdict === "warn") {
    return `warn: no blocking failures, but warned domains have drift or incomplete evidence (${input.warnedDomainIds.join(", ")})`
  }

  return `pass: no blocking failures, no expired waivers, and all enforced domains emitted evidence (${String(input.evidenceCompleteCount)}/${String(input.totalDomains)} reports present)`
}

function resolveVerdictReasons(input: {
  readonly blockedDomainIds: readonly string[]
  readonly warnedDomainIds: readonly string[]
  readonly missingEvidenceDomains: readonly string[]
  readonly waiverReport: GovernanceWaiverReport
}): GovernanceAggregateSummary["verdictReasons"] {
  const reasons: GovernanceAggregateSummary["verdictReasons"][number][] = []

  if (input.missingEvidenceDomains.length > 0) {
    reasons.push("missing-evidence")
  }
  if (input.blockedDomainIds.length > 0) {
    reasons.push("blocked-domain-failure")
  }
  if (!input.waiverReport.valid) {
    reasons.push("waiver-violation")
  }
  if (reasons.length === 0 && input.warnedDomainIds.length > 0) {
    reasons.push("warned-domain")
  }
  if (reasons.length === 0) {
    reasons.push("all-clear")
  }

  return reasons
}

function matchesAnyIdFamily(id: string, families: readonly string[]): boolean {
  return families.some((family) => id === family || id.startsWith(`${family}-`))
}

function expectedCiBehaviorForTier(tier: GovernanceTier): GovernanceCiBehavior {
  if (tier === "tier-1") {
    return "observe"
  }
  if (tier === "tier-2") {
    return "warn"
  }
  return "block"
}

function expectedCiBehaviorForGate(
  gateId: string
): GovernanceCiBehavior | null {
  return gateId.startsWith("GOV-CI-GATE-") ? "block" : null
}

function validateLifecycleBehavior(
  domain: GovernanceDomainDefinition
): string | null {
  if (
    (domain.lifecycleStatus === "watcher" ||
      domain.lifecycleStatus === "bound" ||
      domain.lifecycleStatus === "retired") &&
    domain.ciBehavior !== "observe"
  ) {
    return `Lifecycle status "${domain.lifecycleStatus}" must use ciBehavior "observe".`
  }

  if (domain.lifecycleStatus === "partial" && domain.ciBehavior !== "warn") {
    return 'Lifecycle status "partial" must use ciBehavior "warn".'
  }

  if (domain.lifecycleStatus === "enforced" && domain.ciBehavior !== "block") {
    return 'Lifecycle status "enforced" must use ciBehavior "block".'
  }

  return null
}

function validateMaturityBehavior(
  domain: GovernanceDomainDefinition
): string | null {
  if (
    domain.enforcementMaturity === "defined" &&
    domain.ciBehavior !== "observe"
  ) {
    return 'Enforcement maturity "defined" must use ciBehavior "observe".'
  }

  if (domain.enforcementMaturity === "warned" && domain.ciBehavior !== "warn") {
    return 'Enforcement maturity "warned" must use ciBehavior "warn".'
  }

  if (
    (domain.enforcementMaturity === "blocking" ||
      domain.enforcementMaturity === "runtime-enforced") &&
    domain.ciBehavior !== "block"
  ) {
    return `Enforcement maturity "${domain.enforcementMaturity}" must use ciBehavior "block".`
  }

  return null
}

async function assertPathExists(
  repoRoot: string,
  relativePath: string,
  scope: string,
  issues: GovernanceIssue[]
): Promise<void> {
  const absolutePath = path.join(repoRoot, relativePath)
  const exists = await fs
    .stat(absolutePath)
    .then(() => true)
    .catch(() => false)

  if (!exists) {
    issues.push({
      scope,
      message: `Path "${relativePath}" does not exist.`,
    })
  }
}

async function readGovernanceDomainReportFromEvidencePath(
  reportPath: string,
  domainId: string
): Promise<GovernanceDomainReport | null> {
  const raw = await fs.readFile(reportPath, "utf8").catch(() => null)
  if (raw === null) {
    return null
  }

  const parsed = JSON.parse(raw) as unknown
  return extractGovernanceDomainReport(parsed, domainId)
}

function extractGovernanceDomainReport(
  value: unknown,
  expectedDomainId: string
): GovernanceDomainReport {
  if (isGovernanceDomainReport(value, expectedDomainId)) {
    return value
  }

  if (isSelfManagedGovernanceEvidenceReport(value, expectedDomainId)) {
    return value.governanceDomain
  }

  throw new Error(
    `Evidence report for "${expectedDomainId}" does not contain a valid governance domain report.`
  )
}

function isGovernanceDomainReport(
  value: unknown,
  expectedDomainId: string
): value is GovernanceDomainReport {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Partial<GovernanceDomainReport>
  return (
    candidate.domainId === expectedDomainId &&
    typeof candidate.title === "string" &&
    typeof candidate.owner === "string" &&
    typeof candidate.generatedAt === "string" &&
    Array.isArray(candidate.checks) &&
    Array.isArray(candidate.violations) &&
    typeof candidate.evidenceComplete === "boolean" &&
    typeof candidate.driftDetected === "boolean" &&
    typeof candidate.ciOutcome === "string"
  )
}

function isSelfManagedGovernanceEvidenceReport(
  value: unknown,
  expectedDomainId: string
): value is SelfManagedGovernanceEvidenceReport {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const candidate = value as Partial<SelfManagedGovernanceEvidenceReport>
  return isGovernanceDomainReport(candidate.governanceDomain, expectedDomainId)
}

function assertPnpmRunScriptExists(
  command: string,
  rootScripts: Record<string, string>,
  scope: string,
  issues: GovernanceIssue[]
) {
  const match = command.match(/^pnpm run ([A-Za-z0-9:_-]+)$/u)
  if (!match) {
    issues.push({
      scope,
      message: `Command "${command}" must use "pnpm run <script-name>" form.`,
    })
    return
  }

  const scriptName = match[1]
  if (!(scriptName in rootScripts)) {
    issues.push({
      scope,
      message: `Command "${command}" references missing package.json script "${scriptName}".`,
    })
  }
}

function isDescendantOrSelf(targetPath: string, parentPath: string): boolean {
  const normalizedTarget = normalizeRelativePath(targetPath)
  const normalizedParent = normalizeRelativePath(parentPath)

  return (
    normalizedTarget === normalizedParent ||
    normalizedTarget.startsWith(`${normalizedParent}/`)
  )
}

function escapeMarkdownTable(value: string): string {
  return value.replace(/\|/gu, "\\|")
}

function countByEnum<T extends string>(
  keys: readonly T[],
  values: readonly T[]
): Record<T, number> {
  const counts = Object.fromEntries(keys.map((key) => [key, 0])) as Record<
    T,
    number
  >

  for (const value of values) {
    counts[value] = (counts[value] ?? 0) + 1
  }

  return counts
}

function severityRank(severity: GovernanceSeverity): number {
  if (severity === "info") {
    return 0
  }
  if (severity === "warn") {
    return 1
  }
  if (severity === "error") {
    return 2
  }
  return 3
}

function applyWaiversToDomainReports(
  domainReports: readonly GovernanceDomainReport[],
  waiverReport: GovernanceWaiverReport
): readonly GovernanceDomainReport[] {
  if (!waiverReport.valid || waiverReport.activeWaivers.length === 0) {
    return domainReports
  }

  return domainReports.map((report) => {
    const domainWaivers = waiverReport.activeWaivers.filter(
      (waiver) => waiver.domainId === report.domainId
    )
    if (domainWaivers.length === 0) {
      return report
    }

    const effectiveViolations = report.violations.filter((violation) => {
      return !domainWaivers.some(
        (waiver) =>
          severityRank(violation.severity) <= severityRank(waiver.severityCap)
      )
    })

    return {
      ...report,
      violations: effectiveViolations,
      driftDetected: report.driftDetected || effectiveViolations.length > 0,
      ciOutcome: resolveCiOutcome(
        report.ciBehavior,
        effectiveViolations.length > 0
      ),
    }
  })
}
