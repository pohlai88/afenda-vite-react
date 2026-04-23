/// <reference types="node" />

import fs from "fs/promises"
import path from "path"
import { fileURLToPath } from "url"

export type ReadmeTargetMode =
  | "docs-root"
  | "docs-collections"
  | "scripts"
  | "generic-formal-directory"

export interface ReadmeTargetDefinition {
  path: string
  mode: ReadmeTargetMode
  title?: string
  description?: string
  includeChildDirectories?: boolean
}

export interface AfendaConfig {
  $schema?: string
  schemaVersion: number
  product: {
    name: string
    description: string
  }
  workspace: {
    packageManager: "pnpm"
    rootPackageName: string
    defaultPackageScope: string
  }
  paths: {
    webApp: string
    typescriptSharedConfig: string
  }
  readmeTargets: ReadmeTargetDefinition[]
  fileSurvival: FileSurvivalGovernance
  workspaceGovernance: WorkspaceGovernance
  governance: GovernanceConfig
}

export type GovernanceLifecycleStatus =
  | "watcher"
  | "bound"
  | "partial"
  | "enforced"
  | "drifted"
  | "retired"

export type GovernanceEnforcementMaturity =
  | "defined"
  | "measured"
  | "warned"
  | "blocking"
  | "runtime-enforced"

export type GovernanceSeverity = "info" | "warn" | "error" | "fatal"

export type GovernanceTier = "tier-1" | "tier-2" | "tier-3"

export type GovernanceCiBehavior = "observe" | "warn" | "block"

export interface GovernanceDocLinks {
  primary: string
  references: string[]
}

export interface GovernanceCommandDefinition {
  id: string
  command: string
  scriptPath: string
}

export interface GovernanceReportDefinition {
  command: string
  scriptPath: string
}

export interface GovernanceDomainDefinition {
  id: string
  title: string
  owner: string
  lifecycleStatus: GovernanceLifecycleStatus
  enforcementMaturity: GovernanceEnforcementMaturity
  defaultSeverity: GovernanceSeverity
  tier: GovernanceTier
  docs: GovernanceDocLinks
  localConfig: string
  checks: GovernanceCommandDefinition[]
  report: GovernanceReportDefinition
  evidencePath: string
  ciBehavior: GovernanceCiBehavior
  reviewCadence: string
}

export interface GovernanceGateDefinition {
  id: string
  title: string
  description: string
  command: string
  scriptPath: string
  ciBehavior: GovernanceCiBehavior
}

export interface GovernanceEvidenceConfig {
  root: string
  aggregateReportPath: string
  summaryReportPath: string
  registerPath: string
  registerSnapshotPath: string
}

export interface GovernanceWaiverConfig {
  registryPath: string
  reportPath: string
}

export interface GovernanceConfig {
  version: number
  idFamilies: string[]
  domains: GovernanceDomainDefinition[]
  gates: GovernanceGateDefinition[]
  evidence: GovernanceEvidenceConfig
  waivers: GovernanceWaiverConfig
}

export type FileSurvivalClaimedRole =
  | "runtime-orchestrator"
  | "registry"
  | "route-owner"
  | "editorial-content"
  | "config"
  | "shared-component"
  | "page-local-composition"
  | "unknown"

export interface FileSurvivalRolePatterns {
  routeOwner: string[]
  contentOwner: string[]
  pageLocalComposition: string[]
}

export type FileSurvivalRolloutMode = "observe" | "warn" | "block"

export interface FileSurvivalBlockingPolicy {
  rolloutMode: FileSurvivalRolloutMode
  blockingCategories: string[]
  blockingConfidence: ("high" | "medium" | "low")[]
  protectedScopeBlockingCategories: string[]
  protectedScopeBlockingConfidence: ("high" | "medium" | "low")[]
}

export interface FileSurvivalProtectedScope {
  id: string
  roots: string[]
}

export interface FileSurvivalOwnerTruth {
  root: string
  owner: string
}

export interface FileSurvivalRolloutDefinition {
  id: string
  scopeRoot: string
  sharedRoots: string[]
  runtimeOwners: string[]
  rolePatterns: FileSurvivalRolePatterns
  ignore: string[]
  reviewedExceptions: string[]
  protectedScopes: FileSurvivalProtectedScope[]
  ownerTruth: FileSurvivalOwnerTruth[]
  blockingPolicy: FileSurvivalBlockingPolicy
  rolePrecedence: FileSurvivalClaimedRole[]
  resolverUnresolvedWarningThreshold: number
}

export interface FileSurvivalGovernance {
  rollouts: FileSurvivalRolloutDefinition[]
}

export interface WorkspaceGovernance {
  rootTopology: RootTopologyGovernance
  packageTopology: PackageTopologyGovernance
  packageRoots: PackageRootGovernance
  featureTemplate: FeatureTemplateGovernance
  sharedPackageTemplate: SharedPackageTemplateGovernance
  webClientSrc: WebClientSrcGovernance
}

export interface RootTopologyGovernance {
  primaryProductDirectories: string[]
  allowedRootDirectories: string[]
  allowedHiddenRootDirectories: string[]
  storageDirectories: string[]
  requiredRootFiles: string[]
}

export interface PackageTopologyGovernance {
  workspaceRootDirectories: string[]
  allowedManifestlessDirectories: string[]
}

export interface PackageRootProfile {
  name: string
  allowedDirectories: string[]
  allowedFiles: string[]
}

export interface PackageRootDefinition {
  path: string
  profile: string
  extraAllowedDirectories: string[]
  extraAllowedFiles: string[]
}

export interface PackageRootGovernance {
  profiles: PackageRootProfile[]
  packages: PackageRootDefinition[]
}

export interface FeatureTemplateGovernance {
  featuresRoot: string
  requiredDirectories: string[]
  requiredFiles: string[]
  enforceWhenFeatureExists: boolean
}

export interface SharedPackageTemplateGovernance {
  packagePath: string
  requiredDirectories: string[]
  requireDirectoriesWhenPackageExists: boolean
}

/** Machine-enforced `apps/web/src` topology (see docs/PROJECT_STRUCTURE.md). */
export interface WebClientSrcGovernance {
  srcRoot: string
  allowedTopLevelDirectories: string[]
  requiredShareSubdirectories: string[]
  enforce: boolean
}

export const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
export const workspaceRoot = path.resolve(scriptDirectory, "..")
export const afendaConfigPath = path.join(scriptDirectory, "afenda.config.json")
export const afendaSchemaPath = path.join(
  scriptDirectory,
  "afenda.config.schema.json"
)

export async function loadAfendaConfig(): Promise<AfendaConfig> {
  const value = await readJsonFile(afendaConfigPath)
  assertAfendaConfigShape(value)

  return value
}

export async function readJsonFile(filePath: string): Promise<unknown> {
  const raw = await fs.readFile(filePath, "utf8")
  return JSON.parse(raw) as unknown
}

export function assertAfendaConfigShape(
  value: unknown
): asserts value is AfendaConfig {
  assert(isRecord(value), "Afenda config must be a JSON object.")

  assert(value.schemaVersion === 1, "Afenda config schemaVersion must be 1.")

  assert(isRecord(value.product), "Afenda config product must be an object.")
  assertNonEmptyString(value.product.name, "product.name")
  assertNonEmptyString(value.product.description, "product.description")

  assert(
    isRecord(value.workspace),
    "Afenda config workspace must be an object."
  )
  assert(
    value.workspace.packageManager === "pnpm",
    'Afenda config workspace.packageManager must be "pnpm".'
  )
  assertNonEmptyString(
    value.workspace.rootPackageName,
    "workspace.rootPackageName"
  )
  assertNonEmptyString(
    value.workspace.defaultPackageScope,
    "workspace.defaultPackageScope"
  )

  assert(isRecord(value.paths), "Afenda config paths must be an object.")
  assertNonEmptyString(value.paths.webApp, "paths.webApp")
  assertNonEmptyString(
    value.paths.typescriptSharedConfig,
    "paths.typescriptSharedConfig"
  )

  assert(
    Array.isArray(value.readmeTargets),
    "Afenda config readmeTargets must be an array."
  )
  assert(
    value.readmeTargets.length > 0,
    "Afenda config readmeTargets must contain at least one target."
  )

  value.readmeTargets.forEach((target, index) => {
    assertReadmeTargetDefinition(target, `readmeTargets[${index}]`)
  })

  assert(
    isRecord(value.fileSurvival),
    "Afenda config fileSurvival must be an object."
  )
  assert(
    Array.isArray(value.fileSurvival.rollouts),
    "Afenda config fileSurvival.rollouts must be an array."
  )
  assert(
    value.fileSurvival.rollouts.length > 0,
    "Afenda config fileSurvival.rollouts must contain at least one rollout."
  )
  value.fileSurvival.rollouts.forEach((rollout, index) => {
    assertFileSurvivalRolloutDefinition(
      rollout,
      `fileSurvival.rollouts[${index}]`
    )
  })

  assert(
    isRecord(value.workspaceGovernance),
    "Afenda config workspaceGovernance must be an object."
  )

  assert(
    isRecord(value.workspaceGovernance.rootTopology),
    "workspaceGovernance.rootTopology must be an object."
  )
  assertStringArray(
    value.workspaceGovernance.rootTopology.primaryProductDirectories,
    "workspaceGovernance.rootTopology.primaryProductDirectories"
  )
  assertStringArray(
    value.workspaceGovernance.rootTopology.allowedRootDirectories,
    "workspaceGovernance.rootTopology.allowedRootDirectories"
  )
  assertStringArray(
    value.workspaceGovernance.rootTopology.allowedHiddenRootDirectories,
    "workspaceGovernance.rootTopology.allowedHiddenRootDirectories"
  )
  assertStringArray(
    value.workspaceGovernance.rootTopology.storageDirectories,
    "workspaceGovernance.rootTopology.storageDirectories"
  )
  assertStringArray(
    value.workspaceGovernance.rootTopology.requiredRootFiles,
    "workspaceGovernance.rootTopology.requiredRootFiles"
  )

  assert(
    isRecord(value.workspaceGovernance.packageTopology),
    "workspaceGovernance.packageTopology must be an object."
  )
  assertStringArray(
    value.workspaceGovernance.packageTopology.workspaceRootDirectories,
    "workspaceGovernance.packageTopology.workspaceRootDirectories"
  )
  assertStringArrayAllowEmpty(
    value.workspaceGovernance.packageTopology.allowedManifestlessDirectories,
    "workspaceGovernance.packageTopology.allowedManifestlessDirectories"
  )

  assert(
    isRecord(value.workspaceGovernance.packageRoots),
    "workspaceGovernance.packageRoots must be an object."
  )
  assert(
    Array.isArray(value.workspaceGovernance.packageRoots.profiles),
    "workspaceGovernance.packageRoots.profiles must be an array."
  )
  assert(
    value.workspaceGovernance.packageRoots.profiles.length > 0,
    "workspaceGovernance.packageRoots.profiles must contain at least one profile."
  )
  value.workspaceGovernance.packageRoots.profiles.forEach((profile, index) => {
    assert(
      isRecord(profile),
      `workspaceGovernance.packageRoots.profiles[${index}] must be an object.`
    )
    assertNonEmptyString(
      profile.name,
      `workspaceGovernance.packageRoots.profiles[${index}].name`
    )
    assertStringArray(
      profile.allowedDirectories,
      `workspaceGovernance.packageRoots.profiles[${index}].allowedDirectories`
    )
    assertStringArray(
      profile.allowedFiles,
      `workspaceGovernance.packageRoots.profiles[${index}].allowedFiles`
    )
  })
  assert(
    Array.isArray(value.workspaceGovernance.packageRoots.packages),
    "workspaceGovernance.packageRoots.packages must be an array."
  )
  value.workspaceGovernance.packageRoots.packages.forEach((pkg, index) => {
    assert(
      isRecord(pkg),
      `workspaceGovernance.packageRoots.packages[${index}] must be an object.`
    )
    assertNonEmptyString(
      pkg.path,
      `workspaceGovernance.packageRoots.packages[${index}].path`
    )
    assertNonEmptyString(
      pkg.profile,
      `workspaceGovernance.packageRoots.packages[${index}].profile`
    )
    assertStringArrayAllowEmpty(
      pkg.extraAllowedDirectories,
      `workspaceGovernance.packageRoots.packages[${index}].extraAllowedDirectories`
    )
    assertStringArrayAllowEmpty(
      pkg.extraAllowedFiles,
      `workspaceGovernance.packageRoots.packages[${index}].extraAllowedFiles`
    )
  })

  assert(
    isRecord(value.workspaceGovernance.featureTemplate),
    "workspaceGovernance.featureTemplate must be an object."
  )
  assertNonEmptyString(
    value.workspaceGovernance.featureTemplate.featuresRoot,
    "workspaceGovernance.featureTemplate.featuresRoot"
  )
  assertStringArrayAllowEmpty(
    value.workspaceGovernance.featureTemplate.requiredDirectories,
    "workspaceGovernance.featureTemplate.requiredDirectories"
  )
  assertStringArrayAllowEmpty(
    value.workspaceGovernance.featureTemplate.requiredFiles,
    "workspaceGovernance.featureTemplate.requiredFiles"
  )
  assert(
    typeof value.workspaceGovernance.featureTemplate
      .enforceWhenFeatureExists === "boolean",
    "workspaceGovernance.featureTemplate.enforceWhenFeatureExists must be a boolean."
  )

  assert(
    isRecord(value.workspaceGovernance.sharedPackageTemplate),
    "workspaceGovernance.sharedPackageTemplate must be an object."
  )
  assertNonEmptyString(
    value.workspaceGovernance.sharedPackageTemplate.packagePath,
    "workspaceGovernance.sharedPackageTemplate.packagePath"
  )
  assertStringArray(
    value.workspaceGovernance.sharedPackageTemplate.requiredDirectories,
    "workspaceGovernance.sharedPackageTemplate.requiredDirectories"
  )
  assert(
    typeof value.workspaceGovernance.sharedPackageTemplate
      .requireDirectoriesWhenPackageExists === "boolean",
    "workspaceGovernance.sharedPackageTemplate.requireDirectoriesWhenPackageExists must be a boolean."
  )

  assert(
    isRecord(value.workspaceGovernance.webClientSrc),
    "workspaceGovernance.webClientSrc must be an object."
  )
  assertNonEmptyString(
    value.workspaceGovernance.webClientSrc.srcRoot,
    "workspaceGovernance.webClientSrc.srcRoot"
  )
  assertStringArray(
    value.workspaceGovernance.webClientSrc.allowedTopLevelDirectories,
    "workspaceGovernance.webClientSrc.allowedTopLevelDirectories"
  )
  assert(
    Array.isArray(
      value.workspaceGovernance.webClientSrc.requiredShareSubdirectories
    ),
    "workspaceGovernance.webClientSrc.requiredShareSubdirectories must be an array."
  )
  value.workspaceGovernance.webClientSrc.requiredShareSubdirectories.forEach(
    (item, index) => {
      assertNonEmptyString(
        item,
        `workspaceGovernance.webClientSrc.requiredShareSubdirectories[${index}]`
      )
    }
  )
  assert(
    typeof value.workspaceGovernance.webClientSrc.enforce === "boolean",
    "workspaceGovernance.webClientSrc.enforce must be a boolean."
  )

  assert(isRecord(value.governance), "Afenda config governance must be an object.")
  assert(
    typeof value.governance.version === "number" &&
      Number.isInteger(value.governance.version) &&
      value.governance.version >= 1,
    "governance.version must be an integer >= 1."
  )
  assertStringArray(value.governance.idFamilies, "governance.idFamilies")
  assert(Array.isArray(value.governance.domains), "governance.domains must be an array.")
  assert(
    value.governance.domains.length > 0,
    "governance.domains must contain at least one domain."
  )
  value.governance.domains.forEach((domain, index) => {
    assertGovernanceDomainDefinition(domain, `governance.domains[${index}]`)
  })
  assert(Array.isArray(value.governance.gates), "governance.gates must be an array.")
  assert(
    value.governance.gates.length > 0,
    "governance.gates must contain at least one gate."
  )
  value.governance.gates.forEach((gate, index) => {
    assertGovernanceGateDefinition(gate, `governance.gates[${index}]`)
  })
  assert(
    isRecord(value.governance.evidence),
    "governance.evidence must be an object."
  )
  assertNonEmptyString(value.governance.evidence.root, "governance.evidence.root")
  assertNonEmptyString(
    value.governance.evidence.aggregateReportPath,
    "governance.evidence.aggregateReportPath"
  )
  assertNonEmptyString(
    value.governance.evidence.summaryReportPath,
    "governance.evidence.summaryReportPath"
  )
  assertNonEmptyString(
    value.governance.evidence.registerPath,
    "governance.evidence.registerPath"
  )
  assertNonEmptyString(
    value.governance.evidence.registerSnapshotPath,
    "governance.evidence.registerSnapshotPath"
  )
  assert(
    isRecord(value.governance.waivers),
    "governance.waivers must be an object."
  )
  assertNonEmptyString(
    value.governance.waivers.registryPath,
    "governance.waivers.registryPath"
  )
  assertNonEmptyString(
    value.governance.waivers.reportPath,
    "governance.waivers.reportPath"
  )
}

export function assertReadmeTargetDefinition(
  value: unknown,
  label: string
): asserts value is ReadmeTargetDefinition {
  assert(isRecord(value), `${label} must be an object.`)
  assertNonEmptyString(value.path, `${label}.path`)
  assertReadmeTargetMode(value.mode, `${label}.mode`)

  if (value.title !== undefined) {
    assertNonEmptyString(value.title, `${label}.title`)
  }

  if (value.description !== undefined) {
    assertNonEmptyString(value.description, `${label}.description`)
  }

  if (value.includeChildDirectories !== undefined) {
    assert(
      typeof value.includeChildDirectories === "boolean",
      `${label}.includeChildDirectories must be a boolean.`
    )
    assert(
      value.mode === "generic-formal-directory",
      `${label}.includeChildDirectories is only supported for generic-formal-directory targets.`
    )
  }

  if (value.mode === "generic-formal-directory") {
    assertNonEmptyString(value.title, `${label}.title`)
    assertNonEmptyString(value.description, `${label}.description`)
  }
}

export function assertGovernanceDomainDefinition(
  value: unknown,
  label: string
): asserts value is GovernanceDomainDefinition {
  assert(isRecord(value), `${label} must be an object.`)
  assertNonEmptyString(value.id, `${label}.id`)
  assertNonEmptyString(value.title, `${label}.title`)
  assertNonEmptyString(value.owner, `${label}.owner`)
  assertGovernanceLifecycleStatus(value.lifecycleStatus, `${label}.lifecycleStatus`)
  assertGovernanceEnforcementMaturity(
    value.enforcementMaturity,
    `${label}.enforcementMaturity`
  )
  assertGovernanceSeverity(value.defaultSeverity, `${label}.defaultSeverity`)
  assertGovernanceTier(value.tier, `${label}.tier`)
  assert(isRecord(value.docs), `${label}.docs must be an object.`)
  assertNonEmptyString(value.docs.primary, `${label}.docs.primary`)
  assertStringArrayAllowEmpty(value.docs.references, `${label}.docs.references`)
  assertNonEmptyString(value.localConfig, `${label}.localConfig`)
  assert(Array.isArray(value.checks), `${label}.checks must be an array.`)
  assert(value.checks.length > 0, `${label}.checks must contain at least one check.`)
  value.checks.forEach((check, index) => {
    assertGovernanceCommandDefinition(check, `${label}.checks[${index}]`)
  })
  assert(isRecord(value.report), `${label}.report must be an object.`)
  assertNonEmptyString(value.report.command, `${label}.report.command`)
  assertNonEmptyString(value.report.scriptPath, `${label}.report.scriptPath`)
  assertNonEmptyString(value.evidencePath, `${label}.evidencePath`)
  assertGovernanceCiBehavior(value.ciBehavior, `${label}.ciBehavior`)
  assertNonEmptyString(value.reviewCadence, `${label}.reviewCadence`)
}

export function assertGovernanceGateDefinition(
  value: unknown,
  label: string
): asserts value is GovernanceGateDefinition {
  assert(isRecord(value), `${label} must be an object.`)
  assertNonEmptyString(value.id, `${label}.id`)
  assertNonEmptyString(value.title, `${label}.title`)
  assertNonEmptyString(value.description, `${label}.description`)
  assertNonEmptyString(value.command, `${label}.command`)
  assertNonEmptyString(value.scriptPath, `${label}.scriptPath`)
  assertGovernanceCiBehavior(value.ciBehavior, `${label}.ciBehavior`)
}

export function assertGovernanceCommandDefinition(
  value: unknown,
  label: string
): asserts value is GovernanceCommandDefinition {
  assert(isRecord(value), `${label} must be an object.`)
  assertNonEmptyString(value.id, `${label}.id`)
  assertNonEmptyString(value.command, `${label}.command`)
  assertNonEmptyString(value.scriptPath, `${label}.scriptPath`)
}

export function assertFileSurvivalRolloutDefinition(
  value: unknown,
  label: string
): asserts value is FileSurvivalRolloutDefinition {
  assert(isRecord(value), `${label} must be an object.`)
  assertNonEmptyString(value.id, `${label}.id`)
  assertNonEmptyString(value.scopeRoot, `${label}.scopeRoot`)
  assertStringArray(value.sharedRoots, `${label}.sharedRoots`)
  assertStringArray(value.runtimeOwners, `${label}.runtimeOwners`)
  assertStringArray(value.ignore, `${label}.ignore`)
  assertStringArrayAllowEmpty(
    value.reviewedExceptions,
    `${label}.reviewedExceptions`
  )
  assert(
    Array.isArray(value.protectedScopes),
    `${label}.protectedScopes must be an array.`
  )
  assert(
    value.protectedScopes.length > 0,
    `${label}.protectedScopes must contain at least one protected scope.`
  )
  value.protectedScopes.forEach((scope, index) => {
    assert(isRecord(scope), `${label}.protectedScopes[${index}] must be an object.`)
    assertNonEmptyString(scope.id, `${label}.protectedScopes[${index}].id`)
    assertStringArray(
      scope.roots,
      `${label}.protectedScopes[${index}].roots`
    )
  })
  assert(
    Array.isArray(value.ownerTruth),
    `${label}.ownerTruth must be an array.`
  )
  assert(
    value.ownerTruth.length > 0,
    `${label}.ownerTruth must contain at least one owner rule.`
  )
  value.ownerTruth.forEach((ownerRule, index) => {
    assert(isRecord(ownerRule), `${label}.ownerTruth[${index}] must be an object.`)
    assertNonEmptyString(ownerRule.root, `${label}.ownerTruth[${index}].root`)
    assertNonEmptyString(ownerRule.owner, `${label}.ownerTruth[${index}].owner`)
  })
  assert(
    isRecord(value.blockingPolicy),
    `${label}.blockingPolicy must be an object.`
  )
  assertFileSurvivalRolloutMode(
    value.blockingPolicy.rolloutMode,
    `${label}.blockingPolicy.rolloutMode`
  )
  assertStringArray(
    value.blockingPolicy.blockingCategories,
    `${label}.blockingPolicy.blockingCategories`
  )
  assert(
    Array.isArray(value.blockingPolicy.blockingConfidence),
    `${label}.blockingPolicy.blockingConfidence must be an array.`
  )
  assert(
    value.blockingPolicy.blockingConfidence.length > 0,
    `${label}.blockingPolicy.blockingConfidence must contain at least one confidence level.`
  )
  value.blockingPolicy.blockingConfidence.forEach((confidence, index) => {
    assert(
      confidence === "high" ||
        confidence === "medium" ||
        confidence === "low",
      `${label}.blockingPolicy.blockingConfidence[${index}] must be one of: high, medium, low.`
    )
  })
  assertStringArray(
    value.blockingPolicy.protectedScopeBlockingCategories,
    `${label}.blockingPolicy.protectedScopeBlockingCategories`
  )
  assert(
    Array.isArray(value.blockingPolicy.protectedScopeBlockingConfidence),
    `${label}.blockingPolicy.protectedScopeBlockingConfidence must be an array.`
  )
  assert(
    value.blockingPolicy.protectedScopeBlockingConfidence.length > 0,
    `${label}.blockingPolicy.protectedScopeBlockingConfidence must contain at least one confidence level.`
  )
  value.blockingPolicy.protectedScopeBlockingConfidence.forEach(
    (confidence, index) => {
      assert(
        confidence === "high" ||
          confidence === "medium" ||
          confidence === "low",
        `${label}.blockingPolicy.protectedScopeBlockingConfidence[${index}] must be one of: high, medium, low.`
      )
    }
  )
  assert(Array.isArray(value.rolePrecedence), `${label}.rolePrecedence must be an array.`)
  assert(
    value.rolePrecedence.length === FILE_SURVIVAL_ROLE_PRECEDENCE.length,
    `${label}.rolePrecedence must contain exactly ${String(FILE_SURVIVAL_ROLE_PRECEDENCE.length)} items.`
  )

  const actualRolePrecedence = value.rolePrecedence.map((item, index) => {
    assertFileSurvivalClaimedRole(item, `${label}.rolePrecedence[${index}]`)
    return item
  })

  assert(
    actualRolePrecedence.join("|") === FILE_SURVIVAL_ROLE_PRECEDENCE.join("|"),
    `${label}.rolePrecedence must equal ${FILE_SURVIVAL_ROLE_PRECEDENCE.join(", ")}.`
  )

  assert(
    typeof value.resolverUnresolvedWarningThreshold === "number" &&
      Number.isInteger(value.resolverUnresolvedWarningThreshold) &&
      value.resolverUnresolvedWarningThreshold >= 0,
    `${label}.resolverUnresolvedWarningThreshold must be a non-negative integer.`
  )

  assert(
    isRecord(value.rolePatterns),
    `${label}.rolePatterns must be an object.`
  )
  assertStringArray(value.rolePatterns.routeOwner, `${label}.rolePatterns.routeOwner`)
  assertStringArray(
    value.rolePatterns.contentOwner,
    `${label}.rolePatterns.contentOwner`
  )
  assertStringArray(
    value.rolePatterns.pageLocalComposition,
    `${label}.rolePatterns.pageLocalComposition`
  )
}

export const FILE_SURVIVAL_ROLE_PRECEDENCE = [
  "runtime-orchestrator",
  "registry",
  "route-owner",
  "editorial-content",
  "config",
  "shared-component",
  "page-local-composition",
  "unknown",
] as const satisfies readonly FileSurvivalClaimedRole[]

export const GOVERNANCE_LIFECYCLE_STATUSES = [
  "watcher",
  "bound",
  "partial",
  "enforced",
  "drifted",
  "retired",
] as const satisfies readonly GovernanceLifecycleStatus[]

export const GOVERNANCE_ENFORCEMENT_MATURITIES = [
  "defined",
  "measured",
  "warned",
  "blocking",
  "runtime-enforced",
] as const satisfies readonly GovernanceEnforcementMaturity[]

export const GOVERNANCE_SEVERITIES = [
  "info",
  "warn",
  "error",
  "fatal",
] as const satisfies readonly GovernanceSeverity[]

export const GOVERNANCE_TIERS = [
  "tier-1",
  "tier-2",
  "tier-3",
] as const satisfies readonly GovernanceTier[]

export const GOVERNANCE_CI_BEHAVIORS = [
  "observe",
  "warn",
  "block",
] as const satisfies readonly GovernanceCiBehavior[]

export function assertFileSurvivalClaimedRole(
  value: unknown,
  label: string
): asserts value is FileSurvivalClaimedRole {
  assert(
    value === "runtime-orchestrator" ||
      value === "registry" ||
      value === "route-owner" ||
      value === "editorial-content" ||
      value === "config" ||
      value === "shared-component" ||
      value === "page-local-composition" ||
      value === "unknown",
    `${label} must be one of: ${FILE_SURVIVAL_ROLE_PRECEDENCE.join(", ")}.`
  )
}

export function assertGovernanceLifecycleStatus(
  value: unknown,
  label: string
): asserts value is GovernanceLifecycleStatus {
  assert(
    GOVERNANCE_LIFECYCLE_STATUSES.includes(
      value as GovernanceLifecycleStatus
    ),
    `${label} must be one of: ${GOVERNANCE_LIFECYCLE_STATUSES.join(", ")}.`
  )
}

export function assertGovernanceEnforcementMaturity(
  value: unknown,
  label: string
): asserts value is GovernanceEnforcementMaturity {
  assert(
    GOVERNANCE_ENFORCEMENT_MATURITIES.includes(
      value as GovernanceEnforcementMaturity
    ),
    `${label} must be one of: ${GOVERNANCE_ENFORCEMENT_MATURITIES.join(", ")}.`
  )
}

export function assertGovernanceSeverity(
  value: unknown,
  label: string
): asserts value is GovernanceSeverity {
  assert(
    GOVERNANCE_SEVERITIES.includes(value as GovernanceSeverity),
    `${label} must be one of: ${GOVERNANCE_SEVERITIES.join(", ")}.`
  )
}

export function assertGovernanceTier(
  value: unknown,
  label: string
): asserts value is GovernanceTier {
  assert(
    GOVERNANCE_TIERS.includes(value as GovernanceTier),
    `${label} must be one of: ${GOVERNANCE_TIERS.join(", ")}.`
  )
}

export function assertGovernanceCiBehavior(
  value: unknown,
  label: string
): asserts value is GovernanceCiBehavior {
  assert(
    GOVERNANCE_CI_BEHAVIORS.includes(value as GovernanceCiBehavior),
    `${label} must be one of: ${GOVERNANCE_CI_BEHAVIORS.join(", ")}.`
  )
}

export function assertFileSurvivalRolloutMode(
  value: unknown,
  label: string
): asserts value is FileSurvivalRolloutMode {
  assert(
    value === "observe" || value === "warn" || value === "block",
    `${label} must be one of: observe, warn, block.`
  )
}

export function assertReadmeTargetMode(
  value: unknown,
  label: string
): asserts value is ReadmeTargetMode {
  assert(
    value === "docs-root" ||
      value === "docs-collections" ||
      value === "scripts" ||
      value === "generic-formal-directory",
    `${label} must be one of: docs-root, docs-collections, scripts, generic-formal-directory.`
  )
}

export function assertNonEmptyString(
  value: unknown,
  label: string
): asserts value is string {
  assert(
    typeof value === "string" && value.trim().length > 0,
    `${label} must be a non-empty string.`
  )
}

export function assertStringArray(
  value: unknown,
  label: string
): asserts value is string[] {
  assert(Array.isArray(value), `${label} must be an array.`)
  assert(value.length > 0, `${label} must contain at least one item.`)
  value.forEach((item, index) => {
    assertNonEmptyString(item, `${label}[${index}]`)
  })
}

export function assertStringArrayAllowEmpty(
  value: unknown,
  label: string
): asserts value is string[] {
  assert(Array.isArray(value), `${label} must be an array.`)
  value.forEach((item, index) => {
    assertNonEmptyString(item, `${label}[${index}]`)
  })
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

export function toPosixPath(value: string) {
  return value.split(path.sep).join("/")
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}
