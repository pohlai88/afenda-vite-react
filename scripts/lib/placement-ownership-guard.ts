import path from "node:path"

import type {
  AfendaConfig,
  FileSurvivalOwnerTruth,
  FileSurvivalRolloutDefinition,
} from "../afenda-config.js"
import type { RepoGuardFinding } from "./repo-guard.js"

export interface PlacementOwnershipRule {
  readonly owner: string
  readonly root: string
  readonly kind: "runtime-owner" | "shared-root" | "owner-root"
  readonly matchMode: "exact" | "prefix"
}

export interface PlacementOwnershipScope {
  readonly id: string
  readonly scopeRoot: string
  readonly ignorePatterns: readonly string[]
  readonly rules: readonly PlacementOwnershipRule[]
}

export function buildPlacementOwnershipScopes(
  config: AfendaConfig,
  staticScopes: readonly PlacementOwnershipScope[] = []
): readonly PlacementOwnershipScope[] {
  return [
    ...config.fileSurvival.rollouts.map((rollout) =>
      buildPlacementOwnershipScope(rollout)
    ),
    ...staticScopes,
  ]
}

export function buildPlacementOwnershipScope(
  rollout: FileSurvivalRolloutDefinition
): PlacementOwnershipScope {
  const ownerTruthByRoot = new Map(
    rollout.ownerTruth.map((ownerTruth) => [ownerTruth.root, ownerTruth.owner])
  )
  const specializedRoots = new Set([
    ...rollout.runtimeOwners,
    ...rollout.sharedRoots,
  ])
  const rules: PlacementOwnershipRule[] = [
    ...rollout.runtimeOwners.map((ownerPath) => ({
      owner: ownerTruthByRoot.get(ownerPath) ?? `${rollout.id}:runtime`,
      root: ownerPath,
      kind: "runtime-owner" as const,
      matchMode: "exact" as const,
    })),
    ...rollout.sharedRoots.map((sharedRoot) => ({
      owner: ownerTruthByRoot.get(sharedRoot) ?? `${rollout.id}:shared`,
      root: sharedRoot,
      kind: "shared-root" as const,
      matchMode: "prefix" as const,
    })),
    ...rollout.ownerTruth
      .filter((ownerTruth) => !specializedRoots.has(ownerTruth.root))
      .map((ownerTruth) => toOwnerRootRule(ownerTruth)),
  ]

  return {
    id: rollout.id,
    scopeRoot: rollout.scopeRoot,
    ignorePatterns: rollout.ignore,
    rules,
  }
}

export function evaluatePlacementOwnershipFindings(options: {
  readonly filePaths: readonly string[]
  readonly scopes: readonly PlacementOwnershipScope[]
  readonly ignoredPathPatterns: readonly string[]
}): readonly RepoGuardFinding[] {
  const findings: RepoGuardFinding[] = []

  for (const filePath of options.filePaths) {
    if (matchesAnyPathPattern(filePath, options.ignoredPathPatterns)) {
      continue
    }

    const scope = resolvePlacementOwnershipScope(filePath, options.scopes)
    if (!scope) {
      continue
    }

    if (matchesAnyPathPattern(filePath, scope.ignorePatterns)) {
      continue
    }

    const matchingRules = scope.rules.filter((rule) =>
      matchesPlacementOwnershipRule(filePath, rule)
    )

    if (matchingRules.length === 0) {
      findings.push({
        severity: "error",
        ruleId: "RG-STRUCT-001",
        filePath,
        message:
          "Governed file does not map to any declared owner root within its rollout scope.",
        evidence: `scope=${scope.id}`,
        suggestedFix:
          "Move the file under a declared owner root, add an explicit runtime/shared owner, or update the rollout owner truth.",
      })
      continue
    }

    const strongestRules =
      resolveStrongestPlacementOwnershipRules(matchingRules)
    const strongestOwners = [
      ...new Set(strongestRules.map((rule) => rule.owner)),
    ]

    if (strongestOwners.length > 1) {
      findings.push({
        severity: "error",
        ruleId: "RG-STRUCT-001",
        filePath,
        message:
          "Governed file matches multiple equally specific owner roots with different owners.",
        evidence: `scope=${scope.id}; owners=${strongestOwners.join(",")}`,
        suggestedFix:
          "Narrow the owner truth so one owner root is authoritative for this file.",
      })
    }
  }

  return findings
}

export function resolvePlacementOwnershipScope(
  filePath: string,
  scopes: readonly PlacementOwnershipScope[]
): PlacementOwnershipScope | undefined {
  const matchingScopes = scopes.filter(
    (scope) =>
      filePath === scope.scopeRoot || filePath.startsWith(`${scope.scopeRoot}/`)
  )

  if (matchingScopes.length === 0) {
    return undefined
  }

  return [...matchingScopes].sort(
    (left, right) => right.scopeRoot.length - left.scopeRoot.length
  )[0]
}

export function matchesPlacementOwnershipRule(
  filePath: string,
  rule: PlacementOwnershipRule
): boolean {
  if (rule.matchMode === "exact") {
    return filePath === rule.root
  }

  return filePath === rule.root || filePath.startsWith(`${rule.root}/`)
}

export function resolveStrongestPlacementOwnershipRules(
  rules: readonly PlacementOwnershipRule[]
): readonly PlacementOwnershipRule[] {
  if (rules.length === 0) {
    return []
  }

  const strongestRootLength = Math.max(...rules.map((rule) => rule.root.length))
  return rules.filter((rule) => rule.root.length === strongestRootLength)
}

function toOwnerRootRule(
  ownerTruth: FileSurvivalOwnerTruth
): PlacementOwnershipRule {
  return {
    owner: ownerTruth.owner,
    root: ownerTruth.root,
    kind: "owner-root",
    matchMode: "prefix",
  }
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
