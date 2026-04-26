import type { RepoGuardFinding } from "../contracts/repo-guard.js"
import type {
  PlacementOwnershipRule,
  PlacementOwnershipScope,
} from "../contracts/placement-ownership.js"
import { matchesAnyPathPattern } from "../utils/path-patterns.js"

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

  if (rule.matchMode === "startsWith") {
    return filePath.startsWith(rule.root)
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
